import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// GET /api/listings/meta/cities — must be before /:id to avoid conflict
router.get('/meta/cities', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT city FROM listings WHERE city IS NOT NULL ORDER BY city'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// GET /api/listings — search + filter + paginate
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      q, city, district, type, listing_type,
      min_price, max_price, min_area, max_area,
      rooms, has_parking, has_balcony,
      page = '1', limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (q && (q as string).trim().length > 0) {
      const cleaned = (q as string).trim().replace(/[+\-><()~*"@]/g, ' ').trim();
      if (cleaned.length > 0) {
        whereClauses.push(`MATCH(title, description, city, district) AGAINST(? IN BOOLEAN MODE)`);
        params.push(`${cleaned}*`);
      }
    }
    if (city) { whereClauses.push(`city = ?`); params.push(city as string); }
    if (district) { whereClauses.push(`district LIKE ?`); params.push(`%${district}%`); }
    if (type) { whereClauses.push(`property_type = ?`); params.push(type as string); }
    if (listing_type) { whereClauses.push(`listing_type = ?`); params.push(listing_type as string); }
    if (min_price) { whereClauses.push(`price >= ?`); params.push(Number(min_price)); }
    if (max_price) { whereClauses.push(`price <= ?`); params.push(Number(max_price)); }
    if (min_area) { whereClauses.push(`area_sqm >= ?`); params.push(Number(min_area)); }
    if (max_area) { whereClauses.push(`area_sqm <= ?`); params.push(Number(max_area)); }
    if (rooms) { whereClauses.push(`rooms = ?`); params.push(Number(rooms)); }
    if (has_parking === 'true') { whereClauses.push(`has_parking = 1`); }
    if (has_balcony === 'true') { whereClauses.push(`has_balcony = 1`); }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM listings ${where}`, params);
    const total = (countRows as { total: number }[])[0].total;

    const [rows] = await pool.execute(
      `SELECT id, title, price, price_per_sqm, currency, area_sqm, rooms,
              floor, total_floors, city, district, property_type, listing_type,
              has_parking, has_balcony, has_elevator, images, ai_summary, created_at
       FROM listings ${where}
       ORDER BY created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    res.json({
      data: rows,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    const listing = (rows as unknown[])[0];
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

export default router;
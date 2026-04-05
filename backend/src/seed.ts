import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function toNum(val: string | undefined): number | null {
  if (!val || val === 'nan' || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function toInt(val: string | undefined): number | null {
  const n = toNum(val);
  return n !== null ? Math.round(n) : null;
}

function toBool(val: string | undefined): boolean {
  return val === 'yes' || val === 'true' || val === '1';
}

function normalizeRow(row: Record<string, string>, index: number): Record<string, unknown> {
  const price = toNum(row['price']);
  const area = toNum(row['squareMeters']);

  const cityRaw = (row['city'] || '').trim();
  const cityMap: Record<string, string> = {
    'warszawa': 'Warszawa', 'krakow': 'Kraków', 'wroclaw': 'Wrocław',
    'gdansk': 'Gdańsk', 'poznan': 'Poznań', 'lodz': 'Łódź',
    'katowice': 'Katowice', 'szczecin': 'Szczecin', 'bydgoszcz': 'Bydgoszcz',
    'lublin': 'Lublin', 'bialystok': 'Białystok', 'gdynia': 'Gdynia',
  };
  const city = cityMap[cityRaw.toLowerCase()] || cityRaw || null;

  const conditionMap: Record<string, string> = {
    'low': 'needs_renovation', 'medium': 'good', 'high': 'good', 'premium': 'new',
  };
  const condition = conditionMap[(row['condition'] || '').toLowerCase()] || null;

  const floor = toInt(row['floor']);
  const total_floors = toInt(row['floorCount']);
  const rooms = toInt(row['rooms']);
  const year_built = toInt(row['buildYear']);

  const title = `${rooms || '?'}-pokojowe mieszkanie ${area ? area + 'm²' : ''} - ${city || 'Polska'}`;
  const description = `Mieszkanie na sprzedaż w ${city || 'Polsce'}. ` +
    `Powierzchnia: ${area || '?'} m², ${rooms || '?'} pokoje. ` +
    `${floor !== null ? `Piętro: ${floor}/${total_floors || '?'}.` : ''} ` +
    `${row['buildingMaterial'] ? `Materiał: ${row['buildingMaterial']}.` : ''} ` +
    `${row['ownership'] ? `Własność: ${row['ownership']}.` : ''}`.trim();

  const data: Record<string, unknown> = {
    external_id: `KAGGLE-${index}`,
    title,
    description,
    price,
    price_per_sqm: price && area ? Math.round(price / area) : null,
    currency: 'PLN',
    area_sqm: area,
    rooms,
    floor,
    total_floors,
    city,
    district: null,
    property_type: 'apartment',
    listing_type: row['_listing_type'] || 'sale',
    year_built,
    has_parking: toBool(row['hasParkingSpace']),
    has_balcony: toBool(row['hasBalcony']),
    has_elevator: toBool(row['hasElevator']),
    has_storage: toBool(row['hasStorageRoom']),
    condition_type: condition,
    heating_type: null,
    images: null,
    source_url: 'https://www.kaggle.com/datasets/krzysztofjamroz/apartment-prices-in-poland',
  };

  // Validate and clean
  const isRent = data.listing_type === 'rent';
  const minPrice = isRent ? 100 : 10000;
  const maxPrice = isRent ? 50000 : 50000000;
  if (data.price && (Number(data.price) < minPrice || Number(data.price) > maxPrice)) {
    data.price = null;
  }
  if (data.area_sqm && (Number(data.area_sqm) < 10 || Number(data.area_sqm) > 1000)) {
    data.area_sqm = null;
  }
  if (data.rooms && (Number(data.rooms) < 1 || Number(data.rooms) > 20)) {
    data.rooms = null;
  }
  if (data.price && data.area_sqm) {
    data.price_per_sqm = Math.round(Number(data.price) / Number(data.area_sqm));
  }

  return data;
}

async function insertListing(pool: mysql.Pool, data: Record<string, unknown>): Promise<number | null> {
  try {
    const query = `INSERT IGNORE INTO listings
      (external_id, title, description, price, price_per_sqm, currency, area_sqm,
       rooms, floor, total_floors, city, district, property_type, listing_type,
       year_built, has_parking, has_balcony, has_elevator, has_storage,
       condition_type, images, source_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.external_id, data.title, data.description,
      data.price, data.price_per_sqm, data.currency, data.area_sqm,
      data.rooms, data.floor, data.total_floors,
      data.city, data.district, data.property_type, data.listing_type,
      data.year_built, data.has_parking, data.has_balcony,
      data.has_elevator, data.has_storage, data.condition_type,
      data.images, data.source_url,
    ];

    const [result] = await pool.execute(query, values as unknown as string[]);
    const insertId = (result as mysql.ResultSetHeader).insertId;
    return insertId > 0 ? insertId : null;
  } catch (err) {
    console.warn('  ⚠ DB insert failed:', (err as Error).message);
    console.warn('  Data:', JSON.stringify({ external_id: data.external_id, city: data.city, price: data.price }));
    return null;
  }
}

function sampleByCities(rows: Record<string, string>[], perCity: number): Record<string, string>[] {
  const byCities: Record<string, Record<string, string>[]> = {};
  for (const row of rows) {
    const city = (row['city'] || 'unknown').toLowerCase();
    if (!byCities[city]) byCities[city] = [];
    byCities[city].push(row);
  }
  const result: Record<string, string>[] = [];
  for (const cityRows of Object.values(byCities)) {
    result.push(...cityRows.slice(0, perCity));
  }
  console.log(`  Cities found: ${Object.keys(byCities).join(', ')}`);
  return result;
}

async function main() {
  const CSV_FILES = [
    { file: 'data/apartments_pl_2024_06.csv', listing_type: 'sale' },
    { file: 'data/apartments_rent_pl_2024_06.csv', listing_type: 'rent' },
  ];

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'real_estate',
    waitForConnections: true,
    connectionLimit: 5,
  });

  console.log('🧹 Clearing old data...');
  await pool.execute('DELETE FROM listings WHERE external_id LIKE "KAGGLE-%" OR external_id LIKE "MOCK-%"');

  const allRows: Array<Record<string, string> & { _listing_type: string }> = [];

  for (const { file, listing_type } of CSV_FILES) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠ File not found: ${file}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = parseCsv(content).filter(r => r['price'] && r['squareMeters'] && r['city']);
    console.log(`📊 ${file}: ${parsed.length} total rows`);

    // Spread across cities — 8 per city max, 50 total per file
    const sampled = sampleByCities(parsed, 8).slice(0, 50);
    console.log(`  → Using ${sampled.length} rows across cities`);

    allRows.push(...sampled.map(r => ({ ...r, _listing_type: listing_type })));
  }

  console.log(`\n🏗️ Inserting ${allRows.length} listings...\n`);

  let inserted = 0;
  for (let i = 0; i < allRows.length; i++) {
    const data = normalizeRow(allRows[i], i);
    const newId = await insertListing(pool, data);
    if (newId) {
      inserted++;
      console.log(`  ✓ #${newId} ${data.city} — ${data.listing_type} — ${data.price} PLN`);
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted} listings`);
  await pool.end();
}

main().catch(console.error);
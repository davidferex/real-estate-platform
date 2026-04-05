import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Listing, ListingsResponse } from '../types';
import ListingCard from '../components/ListingCard';
import SearchBar from '../components/SearchBar';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    axios.get('/api/listings/meta/cities').then(r => setCities(r.data.map((c: { city: string }) => c.city)));
  }, []);

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      const res = await axios.get<ListingsResponse>('/api/listings', { params });
      setListings(res.data.data);
      setPagination({ page, totalPages: res.data.pagination.totalPages, total: res.data.pagination.total });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(1); }, [fetchListings]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>
      <SearchBar
        onFilterChange={setFilters}
        filters={filters}
        cities={cities}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>
          {pagination.total} listings found
        </h2>
        <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#888' }}>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchListings(p)} style={{
              padding: '4px 10px', borderRadius: 6,
              background: pagination.page === p ? '#1e3a5f' : '#f0f0f0',
              color: pagination.page === p ? 'white' : '#333',
              border: 'none', cursor: 'pointer', fontWeight: 500,
            }}>{p}</button>
          ))}
          {pagination.totalPages > 5 && <span>... {pagination.totalPages}</span>}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 18 }}>
          Loading listings...
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          No listings found. Try adjusting your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
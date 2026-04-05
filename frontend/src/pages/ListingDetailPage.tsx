import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Listing } from '../types';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<Listing>(`/api/listings/${id}`).then(r => {
      const data = r.data;
      if (typeof data.images === 'string') data.images = JSON.parse(data.images);
      setListing(data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading...</div>;
  if (!listing) return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Listing not found.</div>;

  const formatPrice = (p: number) => new Intl.NumberFormat('pl-PL').format(p);

  const features = [
    { icon: '🛏', label: 'Rooms', value: listing.rooms ?? 'N/A' },
    { icon: '📐', label: 'Area', value: listing.area_sqm ? `${listing.area_sqm} m²` : 'N/A' },
    { icon: '🏢', label: 'Floor', value: listing.floor != null ? `${listing.floor} / ${listing.total_floors ?? '?'}` : 'N/A' },
    { icon: '📅', label: 'Built', value: listing.year_built ?? 'N/A' },
    { icon: '🔥', label: 'Heating', value: listing.heating_type ?? 'N/A' },
    { icon: '🛠', label: 'Condition', value: listing.condition_type ?? 'N/A' },
  ];

  const amenities = [
    { has: listing.has_parking, icon: '🚗', label: 'Parking' },
    { has: listing.has_balcony, icon: '🌿', label: 'Balcony' },
    { has: listing.has_elevator, icon: '🛗', label: 'Elevator' },
    { has: listing.has_storage, icon: '📦', label: 'Storage' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
      <Link to="/" style={{ color: '#1e3a5f', fontWeight: 500, fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
        ← Back to listings
      </Link>

      {/* Images */}
      {listing.images && listing.images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: listing.images.length > 1 ? '2fr 1fr' : '1fr', gap: 8, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
          {listing.images.slice(0, 2).map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: '100%', height: i === 0 ? 380 : 186, objectFit: 'cover' }} />
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
        {/* Left column */}
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              background: listing.listing_type === 'sale' ? '#1e3a5f' : '#2d7d46',
              color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            }}>
              {listing.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
            <span style={{ color: '#888', fontSize: 13, textTransform: 'capitalize' }}>{listing.property_type}</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{listing.title}</h1>
          <p style={{ color: '#666', marginBottom: 20 }}>
            📍 {[listing.district, listing.city].filter(Boolean).join(', ') || 'Location not specified'}
          </p>

          {/* AI Summary — only show if already generated, no button */}
          {listing.ai_summary && (
            <div style={{ background: '#f8f9ff', border: '1px solid #dde5ff', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#5566aa', marginBottom: 8 }}>🤖 AI Summary</div>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{listing.ai_summary}</p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Description</h3>
              <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>{listing.description}</p>
            </>
          )}

          {/* Features grid */}
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {features.map(f => (
              <div key={f.label} style={{ background: '#f9f9f9', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{String(f.value)}</div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Amenities</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {amenities.map(a => (
              <div key={a.label} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                background: a.has ? '#e8f5e9' : '#f5f5f5',
                color: a.has ? '#2d7d46' : '#aaa',
                opacity: a.has ? 1 : 0.6,
              }}>
                {a.icon} {a.label} {a.has ? '✓' : '✗'}
              </div>
            ))}
          </div>
        </div>

        {/* Right column — price card */}
        <div>
          <div style={{
            background: 'white', borderRadius: 16, padding: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: 20,
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#1e3a5f', marginBottom: 4 }}>
              {listing.price ? formatPrice(listing.price) : 'Price on request'} {listing.price ? listing.currency : ''}
              {listing.listing_type === 'rent' && listing.price && <span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span>}
            </div>
            {listing.price_per_sqm && (
              <div style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                {formatPrice(listing.price_per_sqm)} PLN/m²
              </div>
            )}

            <button style={{
              width: '100%', padding: '14px', background: '#1e3a5f', color: 'white',
              border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              marginBottom: 10,
            }}>
              Contact Agent
            </button>
            <button style={{
              width: '100%', padding: '12px', background: '#f5f5f5', color: '#333',
              border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer',
            }}>
              ♡ Save to Favourites
            </button>

            {listing.source_url && (
              <a href={listing.source_url} target="_blank" rel="noreferrer" style={{
                display: 'block', textAlign: 'center', marginTop: 14, fontSize: 12, color: '#aaa', textDecoration: 'none',
              }}>
                View original listing ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
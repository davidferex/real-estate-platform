import { Link } from 'react-router-dom';
import { Listing } from '../types';

interface Props { listing: Listing; }

export default function ListingCard({ listing }: Props) {
  const image = listing.images?.[0] || `https://picsum.photos/seed/${listing.id}/400/250`;
  const formatPrice = (p: number) => new Intl.NumberFormat('pl-PL').format(p);

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
      >
        <div style={{ position: 'relative' }}>
          <img src={image} alt={listing.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: listing.listing_type === 'sale' ? '#1e3a5f' : '#2d7d46',
            color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            {listing.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>

        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>
            {formatPrice(listing.price)} {listing.currency}
            {listing.listing_type === 'rent' && <span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span>}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            {formatPrice(listing.price_per_sqm)} PLN/m²
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
            {listing.title}
          </div>

          <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
            📍 {listing.district}, {listing.city}
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#555', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
            <span>🛏 {listing.rooms} rooms</span>
            <span>📐 {listing.area_sqm} m²</span>
            <span>🏢 Floor {listing.floor}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {listing.has_parking && <Tag>🚗 Parking</Tag>}
            {listing.has_balcony && <Tag>🌿 Balcony</Tag>}
            {listing.has_elevator && <Tag>🛗 Elevator</Tag>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: '#f0f4ff',
      color: '#3366cc',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 500,
    }}>{children}</span>
  );
}
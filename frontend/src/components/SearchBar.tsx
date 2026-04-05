interface Props {
  onFilterChange: (filters: Record<string, string>) => void;
  filters: Record<string, string>;
  cities: string[];
}

export default function SearchBar({ onFilterChange, filters, cities }: Props) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <input
          placeholder="Text search..."
          value={filters.q || ''}
          onChange={e => onFilterChange({ ...filters, q: e.target.value })}
          style={inputStyle}
        />
        <select value={filters.city || ''} onChange={e => onFilterChange({ ...filters, city: e.target.value })} style={inputStyle}>
          <option value="">All cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.listing_type || ''} onChange={e => onFilterChange({ ...filters, listing_type: e.target.value })} style={inputStyle}>
          <option value="">Sale + Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select value={filters.rooms || ''} onChange={e => onFilterChange({ ...filters, rooms: e.target.value })} style={inputStyle}>
          <option value="">Any rooms</option>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} rooms</option>)}
        </select>
        <input placeholder="Min price (PLN)" value={filters.min_price || ''} onChange={e => onFilterChange({ ...filters, min_price: e.target.value })} style={inputStyle} type="number" />
        <input placeholder="Max price (PLN)" value={filters.max_price || ''} onChange={e => onFilterChange({ ...filters, max_price: e.target.value })} style={inputStyle} type="number" />
        <input placeholder="Min area (m²)" value={filters.min_area || ''} onChange={e => onFilterChange({ ...filters, min_area: e.target.value })} style={inputStyle} type="number" />
        <input placeholder="Max area (m²)" value={filters.max_area || ''} onChange={e => onFilterChange({ ...filters, max_area: e.target.value })} style={inputStyle} type="number" />
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0',
  fontSize: 13, outline: 'none', width: '100%',
};
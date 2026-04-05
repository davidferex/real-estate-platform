export interface Listing {
  id: number;
  title: string;
  description?: string;
  ai_summary?: string;
  price: number;
  price_per_sqm: number;
  currency: string;
  area_sqm: number;
  rooms: number;
  floor: number;
  total_floors: number;
  city: string;
  district: string;
  address?: string;
  property_type: 'apartment' | 'house' | 'studio' | 'commercial' | 'other';
  listing_type: 'sale' | 'rent';
  year_built?: number;
  has_parking: boolean;
  has_balcony: boolean;
  has_elevator: boolean;
  has_storage: boolean;
  heating_type?: string;
  condition_type?: string;
  images?: string[];
  source_url?: string;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListingsResponse {
  data: Listing[];
  pagination: PaginationMeta;
}
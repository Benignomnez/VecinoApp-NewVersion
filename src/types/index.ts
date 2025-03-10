// User types
export interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Review types
export interface Review {
  id: string;
  user_id: string;
  place_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Collection types
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  places?: CollectionPlace[];
}

export interface CollectionPlace {
  id: string;
  collection_id: string;
  place_id: string;
  added_at: string;
  place_name?: string;
  place_address?: string;
  place_photo?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

// Search types
export interface SearchFilters {
  query: string;
  location: string;
  type?: string;
  rating?: number;
  price?: number;
  openNow?: boolean;
}

// UI types
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

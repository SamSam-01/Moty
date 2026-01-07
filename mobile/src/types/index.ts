import { MovieFilters } from '../services/api/movieApi';

export interface MovieList {
  id: string;
  title: string;
  createdAt: number;
  imageUrl?: string;
  color?: string;
  filters?: MovieFilters;
}

export interface Movie {
  id: string;
  title: string;
  rank: number;
  imageUrl?: string;
  notes?: string;
  // Nouvelles propriétés TMDB
  tmdbId?: string;
  releaseDate?: string;
  voteAverage?: number;
  backdropUrl?: string;
  genres?: { id: number; name: string }[];
}

export interface UserProfile {
  id: string;
  username: string;
  updated_at?: string;
}
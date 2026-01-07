import { MovieFilters } from '../services/api/movieApi';

export interface MovieList {
  id: string;
  title: string;
  createdAt: number;
  imageUrl?: string;
  color?: string;
  filters?: MovieFilters;
  isPinned?: boolean;
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
  is_public?: boolean;
  updated_at?: string;
}

export interface PodiumEntry {
  id: string;
  user_id: string;
  tmdb_id: string;
  movie_data: Movie;
  rank: 1 | 2 | 3;
  created_at: string;
}
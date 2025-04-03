export interface MovieList {
  id: string;
  title: string;
  createdAt: number;
  imageUrl?: string;
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
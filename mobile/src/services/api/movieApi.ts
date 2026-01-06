import axios from 'axios';
import { Movie } from '../../types';
import Constants from 'expo-constants';

// Variables d'environnement via expo-constants ou process.env
const TMDB_API_KEY = Constants.expoConfig?.extra?.TMDB_API_KEY || process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'fr-FR';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  voteAverage: number;
  genres?: { id: number; name: string }[];
}

export interface MovieFilters {
  year?: number;
  minRating?: number;
  genres?: number[];
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
}

/**
 * Service pour interroger directement l'API TMDB
 */
export const movieApi = {
  /**
   * Recherche de films par mot-clé
   */
  async searchMovies(query: string, filters?: MovieFilters): Promise<TMDBMovie[]> {
    try {
      const params: any = {
        api_key: TMDB_API_KEY,
        language: LANGUAGE,
        query,
        include_adult: false,
      };

      // Appliquer les filtres si fournis
      if (filters?.year) {
        params.primary_release_year = filters.year;
      }
      if (filters?.minRating) {
        params['vote_average.gte'] = filters.minRating;
      }

      const response = await axios.get(`${TMDB_API_URL}/search/movie`, {
        params,
      });

      let results = response.data.results;

      // Filtre par genre (côté client car search ne supporte pas with_genres)
      if (filters?.genres && filters.genres.length > 0) {
        results = results.filter((movie: any) =>
          movie.genre_ids?.some((id: number) => filters.genres!.includes(id))
        );
      }

      // Tri des résultats
      if (filters?.sortBy) {
        results = this.sortMovies(results, filters.sortBy);
      }

      return results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : '',
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}` : '',
        voteAverage: movie.vote_average,
        genres: movie.genre_ids?.map((id: number) => ({ id, name: '' })),
      }));
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  },

  /**
   * Découvrir des films avec filtres avancés
   */
  async discoverMovies(filters?: MovieFilters): Promise<TMDBMovie[]> {
    try {
      const params: any = {
        api_key: TMDB_API_KEY,
        language: LANGUAGE,
        include_adult: false,
        sort_by: filters?.sortBy || 'popularity.desc',
      };

      if (filters?.year) {
        params.primary_release_year = filters.year;
      }
      if (filters?.minRating) {
        params['vote_average.gte'] = filters.minRating;
      }
      if (filters?.genres && filters.genres.length > 0) {
        params.with_genres = filters.genres.join(',');
      }

      const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
        params,
      });

      return response.data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : '',
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}` : '',
        voteAverage: movie.vote_average,
        genres: movie.genre_ids?.map((id: number) => ({ id, name: '' })),
      }));
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw new Error('Failed to discover movies');
    }
  },

  /**
   * Films trending du moment
   */
  async getTrendingMovies(): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${TMDB_API_URL}/trending/movie/week`, {
        params: {
          api_key: TMDB_API_KEY,
          language: LANGUAGE,
        },
      });

      return response.data.results.slice(0, 10).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : '',
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}` : '',
        voteAverage: movie.vote_average,
        genres: movie.genre_ids?.map((id: number) => ({ id, name: '' })),
      }));
    } catch (error) {
      console.error('Error getting trending movies:', error);
      throw new Error('Failed to get trending movies');
    }
  },

  /**
   * Liste des genres disponibles
   */
  async getGenres(): Promise<TMDBGenre[]> {
    try {
      const response = await axios.get(`${TMDB_API_URL}/genre/movie/list`, {
        params: {
          api_key: TMDB_API_KEY,
          language: LANGUAGE,
        },
      });

      return response.data.genres;
    } catch (error) {
      console.error('Error getting genres:', error);
      throw new Error('Failed to get genres');
    }
  },

  /**
   * Tri des films
   */
  sortMovies(movies: any[], sortBy: string): any[] {
    const sorted = [...movies];
    switch (sortBy) {
      case 'vote_average.desc':
        return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'release_date.desc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.release_date || 0).getTime();
          const dateB = new Date(b.release_date || 0).getTime();
          return dateB - dateA;
        });
      case 'title.asc':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'popularity.desc':
      default:
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  },

  /**
   * Détails d'un film par ID
   */
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    try {
      const response = await axios.get(`${TMDB_API_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: LANGUAGE,
        },
      });
      const movie = response.data;
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : '',
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}` : '',
        voteAverage: movie.vote_average,
        genres: movie.genres,
      };
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw new Error('Failed to get movie details');
    }
  },

  /**
   * Conversion d'un film TMDB vers le format interne de l'application
   */
  convertToAppMovie(tmdbMovie: TMDBMovie, rank: number): Omit<Movie, 'id'> {
    return {
      title: tmdbMovie.title,
      imageUrl: tmdbMovie.posterUrl,
      notes: tmdbMovie.overview,
      rank,
      tmdbId: tmdbMovie.id.toString(),
      releaseDate: tmdbMovie.releaseDate,
      voteAverage: tmdbMovie.voteAverage,
    };
  },
};


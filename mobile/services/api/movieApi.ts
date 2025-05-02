import axios from 'axios';
import { Movie } from '../../types';
import Constants from 'expo-constants';

// Variables d'environnement via expo-constants ou process.env
const TMDB_API_KEY = Constants.expoConfig?.extra?.TMDB_API_KEY || process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'fr-FR';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

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

/**
 * Service pour interroger directement l'API TMDB
 */
export const movieApi = {
  /**
   * Recherche de films par mot-clé
   */
  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${TMDB_API_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: LANGUAGE,
          query,
          include_adult: false,
        },
      });

      return response.data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : '',
        backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w780${movie.backdrop_path}` : '',
        voteAverage: movie.vote_average,
        genres: movie.genre_ids?.map((id: number) => ({ id, name: '' })), // noms de genres vides si non récupérés
      }));
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
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

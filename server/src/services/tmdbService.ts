import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

export const tmdbService = {
  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query,
          language: 'fr-FR',
        },
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  },

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'fr-FR',
          append_to_response: 'credits,videos',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw new Error('Failed to get movie details');
    }
  },

  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};
import axios from 'axios';
import { Movie } from '../../types';

// Change this line - using localhost won't work on a physical device
// const API_URL = 'http://localhost:3000/api';

// Use your computer's local network IP address instead
const API_URL = 'http://192.168.1.17:3000/api'; // Replace X with your actual IP

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

export const movieApi = {
  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${API_URL}/movies/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  },

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    try {
      const response = await axios.get(`${API_URL}/movies/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw new Error('Failed to get movie details');
    }
  },

  // Convertir un film TMDB en format Movie pour notre application
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
  }
};
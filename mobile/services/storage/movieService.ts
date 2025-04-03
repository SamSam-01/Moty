import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../../types';

export const movieService = {
  getStorageKey(listId: string): string {
    return `@ranking_items_${listId}`;
  },

  async getMovies(listId: string): Promise<Movie[]> {
    try {
      const storageKey = this.getStorageKey(listId);
      const savedItems = await AsyncStorage.getItem(storageKey);
      if (savedItems) {
        return JSON.parse(savedItems);
      }
      return [];
    } catch (e) {
      console.error('Failed to load movies', e);
      throw new Error('Failed to load your ranking list');
    }
  },

  async saveMovies(listId: string, movies: Movie[]): Promise<void> {
    try {
      const storageKey = this.getStorageKey(listId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(movies));
    } catch (e) {
      console.error('Failed to save movies', e);
      throw new Error('Failed to save your changes');
    }
  },

  async addMovie(listId: string, movie: Movie): Promise<Movie[]> {
    const movies = await this.getMovies(listId);
    const newMovies = [...movies, movie];
    await this.saveMovies(listId, newMovies);
    return newMovies;
  },

  async updateMovie(listId: string, updatedMovie: Movie): Promise<Movie[]> {
    const movies = await this.getMovies(listId);
    const newMovies = movies.map(movie => 
      movie.id === updatedMovie.id ? updatedMovie : movie
    );
    await this.saveMovies(listId, newMovies);
    return newMovies;
  },

  async deleteMovie(listId: string, movieId: string): Promise<Movie[]> {
    const movies = await this.getMovies(listId);
    const newMovies = movies.filter(movie => movie.id !== movieId);
    await this.saveMovies(listId, newMovies);
    return newMovies;
  },

  async reorderMovies(listId: string, movies: Movie[]): Promise<Movie[]> {
    // Recalculate ranks
    const sortedMovies = movies.map((movie, index) => ({
      ...movie,
      rank: index + 1
    }));
    await this.saveMovies(listId, sortedMovies);
    return sortedMovies;
  }
};
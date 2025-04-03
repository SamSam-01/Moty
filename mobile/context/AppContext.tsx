import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MovieList, Movie } from '../types';
import { listService } from '../services/storage/listService';
import { movieService } from '../services/storage/movieService';

interface AppContextType {
  lists: MovieList[];
  isLoading: boolean;
  error: string | null;
  refreshLists: () => Promise<void>;
  addList: (list: Omit<MovieList, 'id' | 'createdAt'>) => Promise<void>;
  updateList: (list: MovieList) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  getMovies: (listId: string) => Promise<Movie[]>;
  addMovie: (listId: string, movie: Omit<Movie, 'id' | 'rank'>) => Promise<void>;
  updateMovie: (listId: string, movie: Movie) => Promise<void>;
  deleteMovie: (listId: string, movieId: string) => Promise<void>;
  reorderMovies: (listId: string, movies: Movie[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedLists = await listService.getLists();
      setLists(fetchedLists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLists();
  }, []);

  const addList = async (listData: Omit<MovieList, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newList: MovieList = {
        ...listData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      const updatedLists = await listService.addList(newList);
      setLists(updatedLists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add list');
      throw e;
    }
  };

  const updateList = async (updatedList: MovieList) => {
    try {
      setError(null);
      const updatedLists = await listService.updateList(updatedList);
      setLists(updatedLists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update list');
      throw e;
    }
  };

  const deleteList = async (listId: string) => {
    try {
      setError(null);
      const updatedLists = await listService.deleteList(listId);
      setLists(updatedLists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete list');
      throw e;
    }
  };

  const getMovies = async (listId: string): Promise<Movie[]> => {
    try {
      return await movieService.getMovies(listId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get movies');
      throw e;
    }
  };

  const addMovie = async (listId: string, movieData: Omit<Movie, 'id' | 'rank'>) => {
    try {
      setError(null);
      const movies = await movieService.getMovies(listId);
      const newMovie: Movie = {
        ...movieData,
        id: Date.now().toString(),
        rank: movies.length + 1,
      };
      await movieService.addMovie(listId, newMovie);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add movie');
      throw e;
    }
  };

  const updateMovie = async (listId: string, updatedMovie: Movie) => {
    try {
      setError(null);
      await movieService.updateMovie(listId, updatedMovie);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update movie');
      throw e;
    }
  };

  const deleteMovie = async (listId: string, movieId: string) => {
    try {
      setError(null);
      await movieService.deleteMovie(listId, movieId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete movie');
      throw e;
    }
  };

  const reorderMovies = async (listId: string, movies: Movie[]) => {
    try {
      setError(null);
      const updatedMovies = await movieService.reorderMovies(listId, movies);
      return updatedMovies; // Retourner les films mis à jour
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder movies');
      throw e;
    }
  };

  return (
    <AppContext.Provider
      value={{
        lists,
        isLoading,
        error,
        refreshLists,
        addList,
        updateList,
        deleteList,
        getMovies,
        addMovie,
        updateMovie,
        deleteMovie,
        reorderMovies,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MovieList, Movie } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import Auth from '../components/Auth';
import { listService } from '../services/storage/listService';
import { movieService } from '../services/storage/movieService';

interface AppContextType {
  session: Session | null;
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
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [lists, setLists] = useState<MovieList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false); // Initial load done (auth check)
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const addList = async (listData: Omit<MovieList, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await listService.addList(listData.title);
      await refreshLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add list');
      throw e;
    }
  };

  const updateList = async (updatedList: MovieList) => {
    try {
      setError(null);
      await listService.updateList(updatedList.id, updatedList.title);
      await refreshLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update list');
      throw e;
    }
  };

  const deleteList = async (listId: string) => {
    try {
      setError(null);
      await listService.deleteList(listId);
      await refreshLists();
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
      await movieService.addMovie(listId, movieData);
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
      await movieService.reorderMovies(listId, movies);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder movies');
      throw e;
    }
  };

  const refreshLists = async () => {
    if (!session?.user) return;
    try {
      // setIsLoading(true); // Don't full screen load on refresh
      setError(null);
      // const fetchedLists = await listService.getLists(); // TODO: switch to supabase
      // setLists(fetchedLists);
      const fetchedLists = await listService.getLists();
      setLists(fetchedLists);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshLists();
    } else {
      setLists([]);
    }
  }, [session]);

  if (!session && !isLoading) {
    return <Auth />;
  }

  return (
    <AppContext.Provider
      value={{
        session,
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
        signOut: async () => { await supabase.auth.signOut(); },
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
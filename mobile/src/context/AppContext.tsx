import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MovieList, Movie, UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Auth } from '../features/auth';
import { listService } from '../services/storage/listService';
import { movieService } from '../services/storage/movieService';
import { profileService } from '../services/api/profileService';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface AppContextType {
  session: Session | null;
  lists: MovieList[];
  profile: UserProfile | null;
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

  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createProfile: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const [lists, setLists] = useState<MovieList[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  // Register for Push Notifications
  useEffect(() => {
    if (session?.user?.id) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          profileService.registerPushToken(session.user.id, token);
        }
      });
    }
  }, [session?.user?.id]);

  const addList = async (listData: Omit<MovieList, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      await listService.addList(listData.title, listData.color, listData.filters, listData.isPinned);
      await refreshLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add list');
      throw e;
    }
  };

  const updateList = async (updatedList: MovieList) => {
    try {
      setError(null);
      await listService.updateList(updatedList.id, updatedList.title, updatedList.color, updatedList.filters, updatedList.isPinned);
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
  const getProfile = async (userId: string) => {
    try {
      const data = await profileService.getProfile(userId);
      setProfile(data);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user) return;
    try {
      setError(null);
      await profileService.updateProfile(session.user.id, updates);
      await getProfile(session.user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
      throw e;
    }
  };

  const createProfile = async (username: string) => {
    if (!session?.user) return;
    try {
      setError(null);
      await profileService.createProfile(session.user.id, username);
      await getProfile(session.user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create profile');
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
      getProfile(session.user.id);
    } else {
      setLists([]);
      setProfile(null);
    }
  }, [session]);

  return (
    <AppContext.Provider
      value={{
        session,
        lists,
        profile,
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
        updateProfile,
        createProfile,
        signOut: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) console.error('SignOut Error:', error);
          } catch (e) {
            // console.error('SignOut Exception:', e);
          } finally {
            setSession(null);
            setProfile(null);
            setLists([]);
          }
        },
      }}
    >
      {!session && !isLoading ? <Auth /> : children}
    </AppContext.Provider>
  );
}


async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    // console.log('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.warn('Push Notifications: Project ID not found. Run `eas init` to configure EAS.');
      return;
    }
    const pushTokenString = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;
    return pushTokenString;
  } catch (e) {
    console.warn('Error getting push token:', e);
  }
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
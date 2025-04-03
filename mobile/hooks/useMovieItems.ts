import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Movie } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useMovieItems(listId: string) {
  const { getMovies, addMovie, updateMovie, deleteMovie, reorderMovies } = useAppContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadMovies();
  }, [listId]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const fetchedMovies = await getMovies(listId);
      setMovies(fetchedMovies);
    } catch (error) {
      Alert.alert('Error', 'Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setNotes('');
    setImageUrl(undefined);
    setFormError(null);
    setIsCreating(true);
  };

  const openEditModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setTitle(movie.title);
    setNotes(movie.notes || '');
    setImageUrl(movie.imageUrl);
    setFormError(null);
    setIsEditing(true);
  };

  const closeModals = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentMovie(null);
    setTitle('');
    setNotes('');
    setImageUrl(undefined);
    setFormError(null);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleCreateMovie = async () => {
    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }

    try {
      await addMovie(listId, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        imageUrl: imageUrl,
      });
      await loadMovies();
      closeModals();
    } catch (error) {
      setFormError('Failed to create movie');
    }
  };

  const handleUpdateMovie = async () => {
    if (!currentMovie) return;
    
    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }

    try {
      await updateMovie(listId, {
        ...currentMovie,
        title: title.trim(),
        notes: notes.trim() || undefined,
        imageUrl: imageUrl,
      });
      await loadMovies();
      closeModals();
    } catch (error) {
      setFormError('Failed to update movie');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    Alert.alert(
      'Delete Movie',
      'Are you sure you want to delete this movie? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMovie(listId, movieId);
              await loadMovies();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete movie');
            }
          },
        },
      ]
    );
  };

  const handleReorderMovies = async (fromIndex: number, toIndex: number) => {
    const reorderedMovies = [...movies];
    const [movedItem] = reorderedMovies.splice(fromIndex, 1);
    reorderedMovies.splice(toIndex, 0, movedItem);
    
    // Mettre à jour immédiatement l'état local avec les films réordonnés
    const updatedMovies = reorderedMovies.map((movie, index) => ({
      ...movie,
      rank: index + 1
    }));
    
    setMovies(updatedMovies);
    
    try {
      await reorderMovies(listId, reorderedMovies);
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder movies');
      await loadMovies(); // Reload original order on error
    }
  };

  return {
    movies,
    isLoading,
    isCreating,
    isEditing,
    currentMovie,
    title,
    setTitle,
    notes,
    setNotes,
    imageUrl,
    formError,
    openCreateModal,
    openEditModal,
    closeModals,
    pickImage,
    handleCreateMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    handleReorderMovies,
    refreshMovies: loadMovies,
  };
}
import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { MovieList } from '../../../types';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useMovieLists() {
  const { lists, addList, updateList, deleteList, signOut } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentList, setCurrentList] = useState<MovieList | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setTitle('');
    setImageUrl(undefined);
    setFormError(null);
    setIsCreating(true);
  };

  const openEditModal = (list: MovieList) => {
    setCurrentList(list);
    setTitle(list.title);
    setImageUrl(list.imageUrl);
    setFormError(null);
    setIsEditing(true);
  };

  const closeModals = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentList(null);
    setTitle('');
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
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleCreateList = async () => {
    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }

    try {
      await addList({
        title: title.trim(),
        imageUrl: imageUrl || 'https://reactnative.dev/img/tiny_logo.png',
      });
      closeModals();
    } catch (error) {
      setFormError('Failed to create list');
    }
  };

  const handleUpdateList = async () => {
    if (!currentList) return;

    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }

    try {
      await updateList({
        ...currentList,
        title: title.trim(),
        imageUrl: imageUrl,
      });
      closeModals();
    } catch (error) {
      setFormError('Failed to update list');
    }
  };

  const handleDeleteList = async (listId: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list? This action cannot be undone.',
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
              await deleteList(listId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  return {
    lists,
    isCreating,
    isEditing,
    currentList,
    title,
    setTitle,
    imageUrl,
    formError,
    openCreateModal,
    openEditModal,
    closeModals,
    pickImage,
    handleCreateList,
    handleUpdateList,
    handleDeleteList,
    signOut,
  };
}
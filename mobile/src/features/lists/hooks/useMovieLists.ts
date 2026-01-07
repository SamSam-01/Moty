import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { MovieList } from '../../../types';
import { MovieFilters } from '../../../services/api/movieApi';
import { Alert } from 'react-native';

export function useMovieLists() {
  const { lists, addList, updateList, deleteList, signOut } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentList, setCurrentList] = useState<MovieList | null>(null);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<MovieFilters | undefined>(undefined);
  const [isPinned, setIsPinned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setTitle('');
    setColor(undefined);
    setFilters(undefined);
    setFormError(null);
    setIsCreating(true);
  };

  const openEditModal = (list: MovieList) => {
    setCurrentList(list);
    setTitle(list.title);
    setColor(list.color);
    setFilters(list.filters);
    setIsPinned(!!list.isPinned);
    setFormError(null);
    setIsEditing(true);
  };

  const closeModals = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentList(null);
    setTitle('');
    setColor(undefined);
    setFilters(undefined);
    setFormError(null);
  };

  const handleCreateList = async () => {
    if (!title.trim()) {
      setFormError('Title cannot be empty');
      return;
    }

    try {
      await addList({
        title: title.trim(),
        color,
        filters,
        isPinned,
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
        color,
        filters,
        isPinned,
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
    color,
    setColor,
    filters,
    setFilters,
    isPinned,
    setIsPinned,
    formError,
    openCreateModal,
    openEditModal,
    closeModals,
    handleCreateList,
    handleUpdateList,
    handleDeleteList,
    signOut,
  };
}
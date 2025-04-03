import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import DraggableItem from '../../components/DraggableItem';
import * as ImagePicker from 'expo-image-picker';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

interface RankingItem {
  id: string;
  title: string;
  rank: number;
  imageUrl?: string;
  notes?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListDetailScreen() {
  const { id, title } = useLocalSearchParams();
  const listId = id as string;
  const listTitle = title as string;
  
  const STORAGE_KEY = `@ranking_items_${listId}`;
  
  const [items, setItems] = useState<RankingItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [currentItem, setCurrentItem] = useState<RankingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (e) {
      setError('Failed to load items');
      Alert.alert('Error', 'Failed to load your ranking list');
    }
  };

  const saveItems = async (newItems: RankingItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      setError('Failed to save items');
      Alert.alert('Error', 'Failed to save your changes');
    }
  };

  // Inside ListDetailScreen component
  const pickImage = async () => {
  // Request permissions
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
    if (currentItem) {
      // For editing existing item
      setCurrentItem({
        ...currentItem,
        imageUrl: result.assets[0].uri,
      });
    } else {
      // For new item
      setNewItemImageUrl(result.assets[0].uri);
    }
  }
};

// Add this state variable with the other state declarations
const [newItemImageUrl, setNewItemImageUrl] = useState<string | undefined>(undefined);

// Update the addNewItem function
const addNewItem = async () => {
  if (!newItemTitle.trim()) {
    setError('Title cannot be empty');
    return;
  }

  const newItem: RankingItem = {
    id: Date.now().toString(),
    title: newItemTitle.trim(),
    rank: items.length + 1,
    notes: newItemNotes.trim() || undefined,
    imageUrl: newItemImageUrl || 'https://reactnative.dev/img/tiny_logo.png', // Use selected image or default
  };

  const newItems = [...items, newItem];
  setItems(newItems);
  await saveItems(newItems);
  setModalVisible(false);
  setNewItemTitle('');
  setNewItemNotes('');
  setNewItemImageUrl(undefined);
  setError(null);
};

// Update the updateItem function
const updateItem = async () => {
  if (!currentItem) return;
  
  if (!newItemTitle.trim()) {
    setError('Title cannot be empty');
    return;
  }

  const updatedItem = {
    ...currentItem,
    title: newItemTitle.trim(),
    notes: newItemNotes.trim() || undefined,
  };

  const newItems = items.map(item => 
    item.id === updatedItem.id ? updatedItem : item
  );
  
  setItems(newItems);
  await saveItems(newItems);
  setEditModalVisible(false);
  setNewItemTitle('');
  setNewItemNotes('');
  setCurrentItem(null);
  setError(null);
};

  const deleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newItems = items
              .filter(item => item.id !== itemId)
              .map((item, index) => ({
                ...item,
                rank: index + 1,
              }));
            
            setItems(newItems);
            await saveItems(newItems);
          },
        },
      ]
    );
  };

  const updateItemOrder = async (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    setItems(updatedItems);
    await saveItems(updatedItems);
  };

  const openEditModal = (item: RankingItem) => {
    setCurrentItem(item);
    setNewItemTitle(item.title);
    setNewItemNotes(item.notes || '');
    setEditModalVisible(true);
  };

  const goBack = () => {
    router.back();
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{listTitle}</Text>
        <View style={styles.placeholder} />
      </BlurView>
      
      <View style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No movies in this list yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add movies and drag to rank them
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                index={index}
                onDragEnd={updateItemOrder}
                itemCount={items.length}
                medalEmoji={getMedalEmoji(item.rank)}
                onEdit={() => openEditModal(item)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Add New Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Movie</Text>
            <TextInput
              style={styles.input}
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              placeholder="Enter movie title"
              placeholderTextColor="#a0a0a0"
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newItemNotes}
              onChangeText={setNewItemNotes}
              placeholder="Add notes (optional)"
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewItemTitle('');
                  setNewItemNotes('');
                  setError(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addItemButton]}
                onPress={addNewItem}
              >
                <Text style={[styles.buttonText, styles.addItemButtonText]}>
                  Add Movie
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Movie</Text>
            <TextInput
              style={styles.input}
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              placeholder="Enter movie title"
              placeholderTextColor="#a0a0a0"
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newItemNotes}
              onChangeText={setNewItemNotes}
              placeholder="Add notes (optional)"
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setNewItemTitle('');
                  setNewItemNotes('');
                  setCurrentItem(null);
                  setError(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addItemButton]}
                onPress={updateItem}
              >
                <Text style={[styles.buttonText, styles.addItemButtonText]}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listContainer: {
    paddingBottom: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addItemButton: {
    backgroundColor: '#0A84FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addItemButtonText: {
    color: '#fff',
  },
  errorText: {
    color: '#FF453A',
    marginBottom: 16,
    textAlign: 'center',
  },
  imagePickerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
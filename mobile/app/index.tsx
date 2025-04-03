import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
  Image,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

interface MovieList {
  id: string;
  title: string;
  createdAt: number;
  imageUrl?: string;
}

const LISTS_STORAGE_KEY = '@movie_lists';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (16/9);

export default function HomeScreen() {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [currentList, setCurrentList] = useState<MovieList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newListImageUrl, setNewListImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const savedLists = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (savedLists) {
        setLists(JSON.parse(savedLists));
      }
    } catch (e) {
      setError('Failed to load lists');
      Alert.alert('Error', 'Failed to load your movie lists');
    }
  };

  const saveLists = async (newLists: MovieList[]) => {
    try {
      await AsyncStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(newLists));
    } catch (e) {
      setError('Failed to save lists');
      Alert.alert('Error', 'Failed to save your changes');
    }
  };

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
      aspect: [9, 16],
      quality: 0.8,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (currentList) {
        // For editing existing list
        setCurrentList({
          ...currentList,
          imageUrl: result.assets[0].uri,
        });
      } else {
        // For new list
        setNewListImageUrl(result.assets[0].uri);
      }
    }
  };

  const addNewList = async () => {
    if (!newListTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    const newList: MovieList = {
      id: Date.now().toString(),
      title: newListTitle.trim(),
      createdAt: Date.now(),
      imageUrl: newListImageUrl || 'https://reactnative.dev/img/tiny_logo.png',
    };

    const newLists = [...lists, newList];
    setLists(newLists);
    await saveLists(newLists);
    setModalVisible(false);
    setNewListTitle('');
    setNewListImageUrl(undefined);
    setError(null);
  };

  const updateList = async () => {
    if (!currentList) return;
    
    if (!newListTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    const updatedList = {
      ...currentList,
      title: newListTitle.trim(),
    };

    const newLists = lists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    
    setLists(newLists);
    await saveLists(newLists);
    setEditModalVisible(false);
    setNewListTitle('');
    setCurrentList(null);
    setError(null);
  };

  const deleteList = async (listId: string) => {
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
            const newLists = lists.filter(list => list.id !== listId);
            setLists(newLists);
            await saveLists(newLists);
          },
        },
      ]
    );
  };

  const navigateToList = (listId: string, listTitle: string) => {
    router.push({
      pathname: '/list/[id]',
      params: { id: listId, title: listTitle }
    });
  };

  const openEditModal = (list: MovieList) => {
    setCurrentList(list);
    setNewListTitle(list.title);
    setEditModalVisible(true);
  };

  const renderListItem = ({ item, index }: { item: MovieList, index: number }) => (
    <View style={styles.listItemContainer}>
      <Pressable
        style={styles.listItem}
        onPress={() => navigateToList(item.id, item.title)}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </LinearGradient>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Edit2 color="#fff" size={16} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteList(item.id)}
          >
            <Trash2 color="#fff" size={16} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.header}>
        <Text style={styles.headerTitle}>My Movie Rankings</Text>
      </BlurView>
      
      <View style={styles.content}>
        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any movie lists yet.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first list to start ranking movies!
            </Text>
          </View>
        ) : (
          <FlatList
            data={lists}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Create New List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Keyboard.dismiss();
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create New List</Text>
              
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={pickImage}
              >
                {newListImageUrl ? (
                  <Image 
                    source={{ uri: newListImageUrl }} 
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Tap to add cover image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                value={newListTitle}
                onChangeText={setNewListTitle}
                placeholder="Enter list title (e.g., 2025 Movies)"
                placeholderTextColor="#a0a0a0"
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                    setNewListTitle('');
                    setNewListImageUrl(undefined);
                    setError(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addItemButton]}
                  onPress={addNewList}
                >
                  <Text style={[styles.buttonText, styles.addItemButtonText]}>
                    Create List
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          Keyboard.dismiss();
          setEditModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit List</Text>
              
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={pickImage}
              >
                {currentList && currentList.imageUrl ? (
                  <Image 
                    source={{ uri: currentList.imageUrl }} 
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Tap to add cover image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                value={newListTitle}
                onChangeText={setNewListTitle}
                placeholder="Enter list title"
                placeholderTextColor="#a0a0a0"
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setEditModalVisible(false);
                    setNewListTitle('');
                    setCurrentList(null);
                    setError(null);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addItemButton]}
                  onPress={updateList}
                >
                  <Text style={[styles.buttonText, styles.addItemButtonText]}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  listItemContainer: {
    width: '50%',
    padding: 8,
  },
  listItem: {
    borderRadius: 16,
    overflow: 'hidden',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  listDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
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
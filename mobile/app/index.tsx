import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  BlurView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import DraggableItem from '../components/DraggableItem';

interface RankingItem {
  id: string;
  title: string;
  rank: number;
}

const STORAGE_KEY = '@ranking_items';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RankingList() {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
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

  const addNewItem = async () => {
    if (!newItemTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    const newItem: RankingItem = {
      id: Date.now().toString(),
      title: newItemTitle.trim(),
      rank: items.length + 1,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    await saveItems(newItems);
    setModalVisible(false);
    setNewItemTitle('');
    setError(null);
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

  return (
    <View style={styles.container}>
      <View style={styles.glassBackground}>
        <View style={styles.listContainer}>
          {items.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              index={index}
              onDragEnd={updateItemOrder}
              itemCount={items.length}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="#fff" size={24} />
          <Text style={styles.addButtonText}>Add New Item</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TextInput
              style={styles.input}
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              placeholder="Enter item title"
              placeholderTextColor="#a0a0a0"
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewItemTitle('');
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
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  glassBackground: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    padding: 16,
    borderRadius: 16,
    marginTop: 'auto',
    width: '100%',
    backdropFilter: 'blur(10px)',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 64,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    color: '#1a1a1a',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#1a1a1a',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  addItemButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addItemButtonText: {
    color: '#fff',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit2, Trash2 } from 'lucide-react-native';
import { MovieList } from '../../types';

interface ListCardProps {
  list: MovieList;
  onPress: (listId: string, title: string) => void;
  onEdit: (list: MovieList) => void;
  onDelete: (listId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (16/9);

export default function ListCard({ list, onPress, onEdit, onDelete }: ListCardProps) {
  return (
    <View style={styles.listItemContainer}>
      <Pressable
        style={styles.listItem}
        onPress={() => onPress(list.id, list.title)}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      >
        <Image 
          source={{ uri: list.imageUrl || 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <Text style={styles.listTitle} numberOfLines={2}>{list.title}</Text>
          <Text style={styles.listDate}>
            {new Date(list.createdAt).toLocaleDateString()}
          </Text>
        </LinearGradient>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(list)}
          >
            <Edit2 color="#fff" size={16} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(list.id)}
          >
            <Trash2 color="#fff" size={16} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
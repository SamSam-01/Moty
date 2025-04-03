import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Edit2, Trash2 } from 'lucide-react-native';
import { Movie } from '../../types';

interface MovieItemProps {
  item: Movie;
  index: number;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  itemCount: number;
  medalEmoji?: string | null;
  onEdit?: (item: Movie) => void;
  onDelete?: (itemId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 90;

export default function MovieItem({
  item,
  index,
  onDragEnd,
  itemCount,
  medalEmoji,
  onEdit,
  onDelete,
}: MovieItemProps) {
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      const destination = Math.round(translateY.value / ITEM_HEIGHT);
      const newIndex = Math.max(0, Math.min(index + destination, itemCount - 1));
      
      if (newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex);
      }
      
      translateY.value = withSpring(0);
      isActive.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      zIndex: isActive.value ? 10 : 0,
      shadowOpacity: withSpring(isActive.value ? 0.3 : 0),
      elevation: isActive.value ? 8 : 0,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.itemContainer, animatedStyle]}>
        <View style={styles.rankContainer}>
          {medalEmoji ? (
            <Text style={styles.medalText}>{medalEmoji}</Text>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.contentContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.title}
          </Text>
          {item.notes && (
            <Text style={styles.notesText} numberOfLines={1}>
              {item.notes}
            </Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEdit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit2 color="#fff" size={16} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 color="#fff" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    height: ITEM_HEIGHT,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
  },
  rankContainer: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  medalText: {
    fontSize: 24,
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingRight: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.7)',
  },
});
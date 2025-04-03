import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface DraggableItemProps {
  item: {
    id: string;
    title: string;
    rank: number;
  };
  index: number;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  itemCount: number;
}

const ITEM_HEIGHT = 80;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DraggableItem({
  item,
  index,
  onDragEnd,
  itemCount,
}: DraggableItemProps) {
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
    },
    onActive: (event) => {
      translateY.value = event.translationY;
    },
    onEnd: () => {
      const newIndex = Math.round(
        (translateY.value + index * ITEM_HEIGHT) / ITEM_HEIGHT
      );
      const validIndex = Math.max(0, Math.min(newIndex, itemCount - 1));

      if (validIndex !== index) {
        runOnJS(onDragEnd)(index, validIndex);
      }

      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1);
      isDragging.value = false;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging.value ? 1 : 0,
      shadowOpacity: withSpring(isDragging.value ? 0.3 : 0),
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={[styles.itemContainer, animatedStyle]}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>#{item.rank}</Text>
        </View>
        <Text style={styles.titleText}>{item.title}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    height: ITEM_HEIGHT,
    width: '100%',
    backdropFilter: 'blur(8px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 12,
    elevation: 8,
  },
  rankContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    minWidth: 48,
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  rankText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  titleText: {
    fontSize: 18,
    flex: 1,
    color: '#fff',
    fontWeight: '500',
  },
});
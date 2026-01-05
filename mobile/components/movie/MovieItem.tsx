
import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Edit2, Trash2, GripVertical, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Movie } from '../../types';
import { theme } from '../../constants/theme';
import GlassView from '../ui/GlassView';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

interface MovieItemProps {
  item: Movie;
  index: number; // This comes from renderItem
  drag: () => void; // Provided by draggable-flatlist
  isActive: boolean; // Provided by draggable-flatlist
  medalEmoji?: string | null;
  onEdit?: (item: Movie) => void;
  onDelete?: (itemId: string) => void;
}

const ITEM_HEIGHT = 100;

export default function MovieItem({
  item,
  index,
  drag,
  isActive,
  medalEmoji,
  onEdit,
  onDelete,
}: MovieItemProps) {

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return theme.colors.text.tertiary;
  };

  const rankColor = getRankColor(index + 1); // Use current visual index

  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        activeOpacity={1}
        delayLongPress={200} // Reduce delay for snappier feel
        style={[
          styles.containerWrapper,
          isActive && { opacity: 0.8 },
        ]}
      >
        <View style={styles.itemContainer}>
          <View style={[
            styles.glassContent,
            isActive && styles.activeItem
          ]}>
            {/* Drag Handle */}
            <TouchableOpacity
              style={styles.dragHandle}
              onPressIn={drag} // Drag starts immediately when touching handle
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <GripVertical color={theme.colors.text.tertiary} size={24} />
            </TouchableOpacity>

            {/* Rank */}
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, { color: rankColor }]}>
                {medalEmoji || index + 1}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.mainContent}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}

              <View style={styles.info}>
                <Text style={styles.titleText} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.metaRow}>
                  {item.voteAverage && (
                    <View style={styles.ratingBadge}>
                      <Star size={10} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.ratingText}>{item.voteAverage.toFixed(1)}</Text>
                    </View>
                  )}
                  {item.releaseDate && (
                    <Text style={styles.yearText}>
                      {new Date(item.releaseDate).getFullYear()}
                    </Text>
                  )}
                </View>

                {item.notes && (
                  <Text style={styles.notesText} numberOfLines={1}>
                    {item.notes}
                  </Text>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                >
                  <Edit2 color={theme.colors.text.secondary} size={16} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete(item.id)}
                >
                  <Trash2 color={theme.colors.error} size={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    height: ITEM_HEIGHT,
    marginBottom: theme.spacing.s,
  },
  itemContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.m,
  },
  glassContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
    paddingRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // Increased opacity for readability without blur
  },
  activeItem: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.2)', // Highlight color
  },
  dragHandle: {
    padding: theme.spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 24,
    fontWeight: '800' as const,
    fontStyle: 'italic',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  thumbnail: {
    width: 50,
    height: 75,
    borderRadius: theme.borderRadius.s,
    marginRight: theme.spacing.s,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  info: {
    flex: 1,
    paddingRight: theme.spacing.s,
  },
  titleText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: theme.colors.text.primary, // Ensure high contrast white
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)', // Add shadow for legibility
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    ...theme.typography.small,
    color: '#FBBF24',
    fontWeight: '700' as const,
  },
  yearText: {
    ...theme.typography.small,
    color: theme.colors.text.tertiary,
  },
  notesText: {
    ...theme.typography.small,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.s,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});
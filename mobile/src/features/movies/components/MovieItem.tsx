
import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Edit2, Trash2, GripVertical, Star } from 'lucide-react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { Movie } from '../../../types';
import { theme } from '../../../theme';
import Typography from '../../../components/ui/Typography';

// ... (logic from original MovieItem)

interface MovieItemProps {
    item: Movie;
    index: number;
    drag: () => void;
    isActive: boolean;
    medalEmoji?: string | null;
    onEdit?: (item: Movie) => void;
    onDelete?: (itemId: string) => void;
    readonly?: boolean;
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
    readonly = false,
}: MovieItemProps) {

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return theme.colors.text.tertiary;
    };

    const rankColor = getRankColor(index + 1);

    return (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={readonly ? undefined : drag}
                activeOpacity={readonly ? 1 : 1}
                delayLongPress={200}
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
                        {!readonly && (
                            <TouchableOpacity
                                style={styles.dragHandle}
                                onPressIn={drag}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <GripVertical color={theme.colors.text.tertiary} size={24} />
                            </TouchableOpacity>
                        )}

                        <View style={styles.rankContainer}>
                            <Typography style={[styles.rankText, { color: rankColor }]}>
                                {medalEmoji || index + 1}
                            </Typography>
                        </View>

                        <View style={styles.mainContent}>
                            {item.imageUrl && (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                />
                            )}

                            <View style={styles.info}>
                                <Typography style={styles.titleText} numberOfLines={2}>
                                    {item.title}
                                </Typography>

                                <View style={styles.metaRow}>
                                    {item.voteAverage && (
                                        <View style={styles.ratingBadge}>
                                            <Star size={10} color="#FBBF24" fill="#FBBF24" />
                                            <Typography style={styles.ratingText}>{item.voteAverage.toFixed(1)}</Typography>
                                        </View>
                                    )}
                                    {item.releaseDate && (
                                        <Typography style={styles.yearText}>
                                            {new Date(item.releaseDate).getFullYear()}
                                        </Typography>
                                    )}
                                </View>

                                {item.notes && (
                                    <Typography style={styles.notesText} numberOfLines={1}>
                                        {item.notes}
                                    </Typography>
                                )}
                            </View>
                        </View>

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
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
    },
    activeItem: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
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
        fontWeight: '800',
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
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
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
        color: '#FBBF24',
        fontWeight: '700',
        fontSize: 12,
    },
    yearText: {
        color: theme.colors.text.tertiary,
        fontSize: 12,
    },
    notesText: {
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
        fontSize: 12,
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

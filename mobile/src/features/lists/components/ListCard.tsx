
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    View,
} from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MovieList } from '../../../types';
import { theme } from '../../../theme';
import GlassView from '../../../components/ui/GlassView';
import Typography from '../../../components/ui/Typography';

interface ListCardProps {
    list: MovieList;
    onPress: (listId: string, title: string) => void;
    onEdit: (list: MovieList) => void;
    onDelete: (listId: string) => void;
    index?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_SPACING = theme.spacing.m;
const CARD_WIDTH = (SCREEN_WIDTH - (theme.spacing.m * 3)) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2; // Slightly shorter than before since no image

export default function ListCard({ list, onPress, onEdit, onDelete, index = 0 }: ListCardProps) {
    return (
        <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            style={styles.container}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress(list.id, list.title)}
                style={styles.card}
            >
                <GlassView style={styles.glassContent} intensity={20}>
                    <View style={styles.content}>
                        <Typography variant="h3" style={styles.title} numberOfLines={3}>
                            {list.title}
                        </Typography>
                        <Typography variant="small" style={styles.date}>
                            {new Date(list.createdAt).toLocaleDateString()}
                        </Typography>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => onEdit(list)}
                            hitSlop={10}
                            style={styles.actionIcon}
                        >
                            <Edit2 color={theme.colors.text.secondary} size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(list.id)}
                            hitSlop={10}
                            style={styles.actionIcon}
                        >
                            <Trash2 color={theme.colors.error} size={16} />
                        </TouchableOpacity>
                    </View>
                </GlassView>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginBottom: theme.spacing.m,
    },
    card: {
        height: CARD_HEIGHT,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface, // Fallback
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassContent: {
        flex: 1,
        padding: theme.spacing.m,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing.s,
        color: theme.colors.text.primary,
    },
    date: {
        color: theme.colors.text.secondary,
        opacity: 0.7,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.s,
        marginTop: theme.spacing.s,
    },
    actionIcon: {
        padding: 4,
        opacity: 0.8,
    },
});

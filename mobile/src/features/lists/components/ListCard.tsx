
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
const CARD_HEIGHT = CARD_WIDTH * 1.5;

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
                <ImageBackground
                    source={{ uri: list.imageUrl || 'https://reactnative.dev/img/tiny_logo.png' }}
                    style={styles.imageBackground}
                    imageStyle={styles.image}
                >
                    <LinearGradient
                        colors={['transparent', 'transparent', theme.colors.background]}
                        locations={[0, 0.5, 1]}
                        style={styles.gradient}
                    />

                    <View style={styles.content}>
                        <GlassView style={styles.glassContainer} intensity={40}>
                            <Typography variant="body" style={styles.title} numberOfLines={2}>
                                {list.title}
                            </Typography>
                            <Typography variant="small" style={styles.date}>
                                {new Date(list.createdAt).toLocaleDateString()}
                            </Typography>
                        </GlassView>
                    </View>

                    <View style={styles.actions}>
                        <GlassView style={styles.actionButton} intensity={60}>
                            <TouchableOpacity onPress={() => onEdit(list)} hitSlop={10}>
                                <Edit2 color={theme.colors.text.primary} size={14} />
                            </TouchableOpacity>
                        </GlassView>
                        <GlassView style={styles.actionButton} intensity={60}>
                            <TouchableOpacity onPress={() => onDelete(list.id)} hitSlop={10}>
                                <Trash2 color={theme.colors.error} size={14} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                </ImageBackground>
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
        backgroundColor: theme.colors.surface,
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    image: {
        borderRadius: theme.borderRadius.m,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        padding: theme.spacing.s,
    },
    glassContainer: {
        borderRadius: theme.borderRadius.s,
        padding: theme.spacing.s,
        borderWidth: 0,
    },
    title: {
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    date: {
        color: theme.colors.text.secondary,
    },
    actions: {
        position: 'absolute',
        top: theme.spacing.s,
        right: theme.spacing.s,
        gap: theme.spacing.xs,
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
    },
});

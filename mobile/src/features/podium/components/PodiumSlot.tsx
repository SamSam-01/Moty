import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Plus, Trophy } from 'lucide-react-native';
import { theme } from '../../../theme';
import Typography from '../../../components/ui/Typography';
import GlassView from '../../../components/ui/GlassView';
import { PodiumEntry } from '../../../types';
import { LinearGradient } from 'expo-linear-gradient';

interface PodiumSlotProps {
    rank: 1 | 2 | 3;
    entry?: PodiumEntry;
    editable?: boolean;
    onPress?: () => void;
}

const { width } = Dimensions.get('window');
// Calculate approximate width for 3 columns with margins
const SLOT_WIDTH = (width - 48 - 24) / 3;

// Scale factors for ranks
const HEIGHT_SCALE = {
    1: 1.15,
    2: 0.95,
    3: 0.85,
};

const COLORS = {
    1: ['#FFD700', '#FFA500'], // Gold
    2: ['#C0C0C0', '#A9A9A9'], // Silver
    3: ['#CD7F32', '#8B4513'], // Bronze
};

export default function PodiumSlot({ rank, entry, editable, onPress }: PodiumSlotProps) {
    // Standard Poster Ratio 2:3
    const baseHeight = SLOT_WIDTH * 1.5;
    const height = baseHeight * HEIGHT_SCALE[rank];
    const width = SLOT_WIDTH * (rank === 1 ? 1.1 : 0.95); // Slight width diff

    const imageUrl = entry?.movie_data?.imageUrl;

    const renderContent = () => {
        if (entry && imageUrl) {
            return (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w500${imageUrl}` }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    />
                    <View style={styles.rankBadge}>
                        <LinearGradient
                            colors={COLORS[rank]}
                            style={styles.rankGradient}
                        >
                            <Typography variant="h3" style={styles.rankText}>{rank}</Typography>
                        </LinearGradient>
                    </View>
                </View>
            );
        }

        if (editable) {
            return (
                <View style={[styles.emptyContainer, { height }]}>
                    <Plus color="rgba(255,255,255,0.3)" size={32} />
                    <Typography variant="caption" style={styles.addText}>Add</Typography>
                </View>
            );
        }

        return (
            <View style={[styles.emptyContainer, { height }]}>
                <Trophy color="rgba(255,255,255,0.1)" size={24} />
            </View>
        );
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!editable && !entry}
            style={[
                styles.container,
                { width }
            ]}
        >
            <GlassView intensity={20} style={[styles.card, { height, width }]}>
                {renderContent()}
            </GlassView>
            {/* Podium Step Visual */}
            <View style={[
                styles.step,
                {
                    height: (3 - rank + 1) * 10, // 30, 20, 10
                    backgroundColor: COLORS[rank][0],
                    opacity: 0.3,
                    width: width,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                }
            ]} />

            {entry && (
                <Typography
                    variant="caption"
                    style={[styles.movieTitle, rank === 1 && styles.winnerTitle]}
                    numberOfLines={1}
                >
                    {entry.movie_data.title}
                </Typography>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end', // Ensure content aligns to bottom of container
    },
    card: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginBottom: 8, // Space between poster and text/step
    },
    imageContainer: {
        width: '100%',
        height: '100%',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    emptyContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    addText: {
        color: 'rgba(255,255,255,0.3)',
    },
    rankBadge: {
        position: 'absolute',
        top: -5,
        left: -5, // Move badge to top-left or keep bottom-right? 
        // Design typically puts rank clearly visible.
        // User said "format affiche".
        // Let's keep it but make it sleek.
        bottom: undefined,
        right: undefined,
        width: 24,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    rankGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    movieTitle: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        fontSize: 10,
        marginTop: 4,
        maxWidth: '100%',
    },
    winnerTitle: {
        color: theme.colors.text.primary,
        fontWeight: '600',
        fontSize: 12,
    },
    step: {
        marginTop: 4,
        marginBottom: 4,
    }
});

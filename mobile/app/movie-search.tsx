import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import Input from '../src/components/ui/Input';
import { movieApi, TMDBMovie } from '../src/services/api/movieApi';
import { podiumService } from '../src/services/api/podiumService';
import { Movie } from '../src/types';

export default function MovieSearchScreen() {
    const { rank } = useLocalSearchParams<{ rank: string }>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TMDBMovie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else if (query.length === 0) {
                // Could load trending if empty
                loadTrending();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Load trending on mount
    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        setIsLoading(true);
        try {
            const movies = await movieApi.getTrendingMovies();
            setResults(movies);
        } catch (error) {
            console.error('Error loading trending:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const performSearch = async (text: string) => {
        setIsLoading(true);
        try {
            const movies = await movieApi.searchMovies(text);
            setResults(movies);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectMovie = async (tmdbMovie: TMDBMovie) => {
        if (!rank) return;
        setIsSaving(true);
        try {
            const movie: Movie = {
                id: tmdbMovie.id.toString(), // Internal ID will be TMDB ID for podium
                tmdbId: tmdbMovie.id.toString(),
                rank: parseInt(rank, 10),
                title: tmdbMovie.title,
                imageUrl: tmdbMovie.posterUrl.replace('https://image.tmdb.org/t/p/w500', ''), // Store relative path for consistency with some parts, or full url?
                // Actually podiumService expects Movie object.
                // PodioumSlot uses "https://image.tmdb.org/t/p/w500${imageUrl}" so we should store just the path.
                // But movieApi returns full URL "https://image.tmdb.org/t/p/w500/..."
                // checks convertToAppMovie in movieApi: posterUrl: tmdbMovie.posterUrl
                // Let's store the path to be safe if that's what the UI expects.
                // But wait, convertToAppMovie sets posterUrl to full URL "https://image.tmdb.org/t/p/w500/..."
                // PodiumSlot code: `source={{ uri: https://image.tmdb.org/t/p/w500${imageUrl} }}`
                // This means PodiumSlot expects a relative path starting with /
                // So if I save a full URL, it will break.
                // I should strip the base URL if present.
            };

            // Fix image URL for storage
            // tmdbMovie.posterUrl is full URL.
            // We want path "/path.jpg".
            const path = tmdbMovie.posterUrl.replace('https://image.tmdb.org/t/p/w500', '');
            movie.imageUrl = path;

            await podiumService.updatePodium(parseInt(rank, 10), movie);
            router.back();
        } catch (error) {
            console.error('Error updating podium:', error);
            Alert.alert('Error', 'Failed to update podium');
            setIsSaving(false);
        }
    };

    const renderItem = ({ item }: { item: TMDBMovie }) => (
        <TouchableOpacity
            onPress={() => handleSelectMovie(item)}
            style={styles.resultItem}
            disabled={isSaving}
        >
            <GlassView intensity={20} style={styles.resultCard}>
                <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                <View style={styles.movieInfo}>
                    <Typography variant="body" style={[styles.title, { fontWeight: 'bold' }]} numberOfLines={2}>{item.title}</Typography>
                    <Typography variant="caption" style={styles.year}>
                        {new Date(item.releaseDate).getFullYear() || 'Unknown'}
                    </Typography>
                </View>
                <View style={styles.addButton}>
                    <Plus color="#fff" size={20} />
                </View>
            </GlassView>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <GlassView intensity={50} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={20}
                    >
                        <ArrowLeft color={theme.colors.text.primary} size={24} />
                    </TouchableOpacity>
                    <Typography variant="h3" style={styles.headerTitle}>Select Movie</Typography>
                    <View style={styles.headerRight} />
                </View>

                <View style={styles.searchContainer}>
                    <Input
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search movies..."
                        style={styles.searchInput}
                        icon={<Search color={theme.colors.text.secondary} size={20} />}
                        autoFocus
                    />
                </View>
            </GlassView>

            <View style={styles.content}>
                {isLoading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
                )}

                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query.length >= 2 && !isLoading ? (
                            <Typography variant="body" style={styles.emptyText}>No movies found</Typography>
                        ) : null
                    }
                />
            </View>
            {isSaving && (
                <View style={styles.savingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        color: theme.colors.text.primary,
    },
    headerRight: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.m,
    },
    searchInput: {
        marginBottom: 0,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    loader: {
        marginTop: theme.spacing.l,
    },
    resultItem: {
        marginBottom: theme.spacing.m,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        gap: theme.spacing.m,
    },
    poster: {
        width: 50,
        height: 75,
        borderRadius: 4,
    },
    movieInfo: {
        flex: 1,
    },
    title: {
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    year: {
        color: theme.colors.text.secondary,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xl,
    },
    savingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    }
});

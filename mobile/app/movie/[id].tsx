import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Star, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import Typography from '../../src/components/ui/Typography';
import GlassView from '../../src/components/ui/GlassView';
import { movieApi } from '../../src/services/api/movieApi';
import { supabase } from '../../src/lib/supabase';

const { width, height } = Dimensions.get('window');

// API TMDB type fallback if properties are deeply nested
type TMDBDetail = any; 

export default function MovieDetailScreen() {
    // id is tmdbId
    const { id, localId, listId } = useLocalSearchParams<{ id: string; localId?: string; listId?: string }>();
    
    const [movie, setMovie] = useState<TMDBDetail | null>(null);
    const [personalNotes, setPersonalNotes] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch full TMDB Details
                const response = await movieApi.getMovieDetails(parseInt(id));
                setMovie(response);

                // Fetch Personal Notes if a local movie was clicked
                if (localId) {
                    const { data, error: sbError } = await supabase
                        .from('movies')
                        .select('notes')
                        .eq('id', localId)
                        .single();
                        
                    if (data?.notes) {
                        setPersonalNotes(data.notes);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch movie details", err);
                setError("Unable to load movie details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id, localId]);

    const renderGenres = () => {
        if (!movie?.genres) return null;
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresRow}>
                {movie.genres.map((g: any) => (
                    <View key={g.id} style={styles.genreBadge}>
                        <Typography style={styles.genreText}>{g.name}</Typography>
                    </View>
                ))}
            </ScrollView>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error || !movie) {
        return (
            <View style={styles.centerContainer}>
                <Typography variant="h3" style={{ color: theme.colors.error }}>{error || 'Movie not found'}</Typography>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Typography style={{ color: theme.colors.primary }}>Go Back</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    // Format Data
    const backdropUri = movie.backdropUrl || movie.posterUrl;
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';
    const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Header Banner */}
                <View style={styles.bannerContainer}>
                    {backdropUri ? (
                        <Image source={{ uri: backdropUri }} style={styles.bannerImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.bannerImage, { backgroundColor: theme.colors.surface }]} />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent', theme.colors.background]}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <GlassView intensity={30} style={styles.backButtonGlass}>
                            <ArrowLeft color={theme.colors.white} size={24} />
                        </GlassView>
                    </TouchableOpacity>

                    {/* Meta overlay at the bottom of the banner */}
                    <View style={styles.bannerMeta}>
                        <Typography variant="h1" style={styles.movieTitle}>{movie.title}</Typography>
                        
                        <View style={styles.metaRow}>
                            <View style={styles.metaPill}>
                                <Calendar color={theme.colors.primary} size={14} />
                                <Typography style={styles.metaPillText}>{year}</Typography>
                            </View>
                            <View style={[styles.metaPill, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                                <Star color="#FBBF24" fill="#FBBF24" size={14} />
                                <Typography style={[styles.metaPillText, { color: '#FBBF24' }]}>{rating}</Typography>
                            </View>
                            {movie.runtime > 0 && (
                                <View style={styles.metaPill}>
                                    <Typography style={styles.metaPillText}>{movie.runtime} min</Typography>
                                </View>
                            )}
                        </View>
                        {renderGenres()}
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    
                    {/* Personal Notes (if loaded via local DB) */}
                    {personalNotes && (
                        <GlassView intensity={15} style={styles.notesContainer}>
                            <Typography variant="h3" style={styles.sectionTitle}>Notes personelles</Typography>
                            <Typography style={styles.notesText}>{personalNotes}</Typography>
                        </GlassView>
                    )}

                    {/* Overview */}
                    <View style={styles.section}>
                        <Typography variant="h3" style={styles.sectionTitle}>Synopsis</Typography>
                        <Typography style={styles.overviewText}>
                            {movie.overview || "Aucun synopsis disponible."}
                        </Typography>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerContainer: {
        width: '100%',
        height: height * 0.55,
        justifyContent: 'flex-end',
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
    },
    backButtonGlass: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerMeta: {
        padding: 24,
        paddingBottom: 32, // Extra padding before content blends
    },
    movieTitle: {
        color: theme.colors.white,
        fontSize: 32,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    metaPillText: {
        color: theme.colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    genresRow: {
        flexDirection: 'row',
    },
    genreBadge: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    genreText: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    content: {
        padding: 24,
        paddingTop: 0,
        gap: 24,
    },
    notesContainer: {
        padding: 20,
        borderRadius: 16,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    notesText: {
        color: theme.colors.text.primary,
        fontSize: 15,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: '700',
    },
    overviewText: {
        color: theme.colors.text.secondary,
        fontSize: 16,
        lineHeight: 24,
    },
});

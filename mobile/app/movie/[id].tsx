import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Star, Calendar, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import Typography from '../../src/components/ui/Typography';
import GlassView from '../../src/components/ui/GlassView';
import { movieApi } from '../../src/services/api/movieApi';
import { supabase } from '../../src/lib/supabase';

import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const BANNER_HEIGHT = height * 0.60;

type TMDBDetail = any;

export default function MovieDetailScreen() {
    const { id, localId, listId } = useLocalSearchParams<{ id: string; localId?: string; listId?: string }>();

    const [movie, setMovie] = useState<TMDBDetail | null>(null);
    const [personalNotes, setPersonalNotes] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await movieApi.getMovieDetails(parseInt(id));
                setMovie(response);

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

    const animatedBannerStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            [-BANNER_HEIGHT, 0],
            [2, 1],               // Outputs : Échelle x2, échelle normale
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale: scale }],
        };
    });

    const renderGenres = () => {
        if (!movie?.genres) return null;
        return (
            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresRow} contentContainerStyle={styles.genresContent}>
                {movie.genres.map((g: any) => (
                    <View key={g.id} style={styles.genreBadge}>
                        <Typography style={styles.genreText}>{g.name}</Typography>
                    </View>
                ))}
            </Animated.ScrollView>
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
                <TouchableOpacity onPress={() => router.back()} style={styles.errorBackButton}>
                    <Typography style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Retour</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    const backdropUri = movie.backdropUrl || movie.posterUrl;
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';
    const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <LinearGradient colors={[theme.colors.background, '#110F24']} style={StyleSheet.absoluteFill} />

            {/* Bouton Retour Fixe */}
            <TouchableOpacity style={styles.fixedBackButton} onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                <GlassView intensity={40} style={styles.backButtonGlass}>
                    <ArrowLeft color={theme.colors.white} size={22} />
                </GlassView>
            </TouchableOpacity>

            <Animated.ScrollView
                style={styles.scrollView}
                bounces={true}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                <View style={styles.bannerContainer}>
                    <Animated.View style={[StyleSheet.absoluteFill, animatedBannerStyle]}>
                        {backdropUri ? (
                            <Image
                                source={{ uri: backdropUri }}
                                style={StyleSheet.absoluteFill}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.surface }]} />
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', theme.colors.background]}
                            locations={[0, 0.4, 0.8, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>

                    <View style={styles.bannerMeta}>
                        <Typography variant="h1" style={styles.movieTitle}>{movie.title}</Typography>
                        <View style={styles.metaRow}>
                            <View style={styles.metaPill}><Calendar color={theme.colors.white} opacity={0.8} size={14} /><Typography style={styles.metaPillText}>{year}</Typography></View>
                            <View style={[styles.metaPill, styles.ratingPill]}><Star color="#FBBF24" fill="#FBBF24" size={14} /><Typography style={[styles.metaPillText, { color: '#FBBF24', fontWeight: 'bold' }]}>{rating}</Typography></View>
                            {movie.runtime > 0 && (<View style={styles.metaPill}><Clock color={theme.colors.white} opacity={0.8} size={14} /><Typography style={styles.metaPillText}>{movie.runtime} min</Typography></View>)}
                        </View>
                        {renderGenres()}
                    </View>
                </View>

                {/* Contenu principal */}
                <View style={styles.content}>
                    {/* Notes Personnelles */}
                    {personalNotes && personalNotes !== movie.overview && (
                        <View style={styles.notesWrapper}>
                            <GlassView intensity={20} style={styles.notesContainer}>
                                <View style={styles.notesHeader}><Typography variant="h3" style={styles.sectionTitle}>Notes personnelles</Typography></View>
                                <Typography style={styles.notesText}>{personalNotes}</Typography>
                            </GlassView>
                        </View>
                    )}
                    {/* Synopsis */}
                    <View style={styles.section}><Typography variant="h3" style={styles.sectionTitle}>Synopsis</Typography><Typography style={styles.overviewText}>{movie.overview || "Aucun synopsis disponible pour ce film."}</Typography></View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centerContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
    errorBackButton: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    scrollView: { flex: 1 },
    fixedBackButton: { position: 'absolute', top: 50, left: 20, zIndex: 100, elevation: 5 },
    backButtonGlass: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    bannerContainer: { width: '100%', height: BANNER_HEIGHT, justifyContent: 'flex-end' }, // Utilise la constante
    bannerMeta: { padding: 24, paddingBottom: 24 },
    movieTitle: { color: theme.colors.white, fontSize: 34, fontWeight: '900', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8, marginBottom: 16 },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    ratingPill: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.3)' },
    metaPillText: { color: theme.colors.white, fontSize: 13, fontWeight: '600' },
    genresRow: { flexDirection: 'row', marginBottom: 8 },
    genresContent: { gap: 8 },
    genreBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
    genreText: { color: '#E2E8F0', fontSize: 12, fontWeight: '500' },
    content: { padding: 24, paddingTop: 10, gap: 32 },
    notesWrapper: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
    notesContainer: { padding: 20, borderRadius: 20, borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, backgroundColor: 'rgba(99, 102, 241, 0.08)' },
    notesHeader: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(99, 102, 241, 0.2)', paddingBottom: 8 },
    notesText: { color: theme.colors.white, fontSize: 15, lineHeight: 24, fontStyle: 'italic', opacity: 0.9 },
    section: { gap: 16 },
    sectionTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
    overviewText: { color: '#CBD5E1', fontSize: 16, lineHeight: 26, fontWeight: '400' },
});
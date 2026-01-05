
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MovieFilters, TMDBGenre } from '../../../services/api/movieApi';
import { theme } from '../../../theme';
import { X, Check } from 'lucide-react-native';
import GlassView from '../../../components/ui/GlassView';
import Typography from '../../../components/ui/Typography';
import * as Haptics from 'expo-haptics';

interface SearchFiltersProps {
    filters: MovieFilters;
    genres: TMDBGenre[];
    onFiltersChange: (filters: MovieFilters) => void;
    onClose: () => void;
}

const SORT_OPTIONS = [
    { value: 'popularity.desc' as const, label: '🔥 Popularité' },
    { value: 'vote_average.desc' as const, label: '⭐ Note' },
    { value: 'release_date.desc' as const, label: '📅 Récents' },
    { value: 'title.asc' as const, label: '🔤 Titre (A-Z)' },
];

const RATING_OPTIONS = [
    { value: undefined, label: 'Toutes' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
    { value: 9, label: '9+' },
];

const POPULAR_GENRES = [28, 35, 18, 878, 27, 10749]; // Action, Comedy, Drama, Sci-Fi, Horror, Romance

export default function SearchFilters({
    filters,
    genres,
    onFiltersChange,
    onClose,
}: SearchFiltersProps) {
    const toggleGenre = (genreId: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const currentGenres = filters.genres || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter((id) => id !== genreId)
            : [...currentGenres, genreId];
        onFiltersChange({ ...filters, genres: newGenres });
    };

    const setRating = (rating: number | undefined) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({ ...filters, minRating: rating });
    };

    const setSortBy = (sortBy: MovieFilters['sortBy']) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onFiltersChange({ ...filters, sortBy });
    };

    const clearFilters = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onFiltersChange({});
    };

    const popularGenres = genres.filter((g) => POPULAR_GENRES.includes(g.id));
    const hasActiveFilters = (filters.genres && filters.genres.length > 0) || filters.minRating || filters.sortBy !== 'popularity.desc';

    return (
        <View style={styles.container}>
            <GlassView intensity={60} style={styles.header}>
                <Typography variant="h2" style={styles.headerTitle}>Filtres de recherche</Typography>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
            </GlassView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sort By */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Trier par</Typography>
                    <View style={styles.chipsRow}>
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.chip,
                                    (filters.sortBy || 'popularity.desc') === option.value && styles.chipActive,
                                ]}
                                onPress={() => setSortBy(option.value)}
                            >
                                <Typography
                                    style={[
                                        styles.chipText,
                                        (filters.sortBy || 'popularity.desc') === option.value && styles.chipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Rating */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Note minimale</Typography>
                    <View style={styles.chipsRow}>
                        {RATING_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                style={[
                                    styles.chip,
                                    filters.minRating === option.value && styles.chipActive,
                                ]}
                                onPress={() => setRating(option.value)}
                            >
                                <Typography
                                    style={[
                                        styles.chipText,
                                        filters.minRating === option.value && styles.chipTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Genres */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Genres populaires</Typography>
                    <View style={styles.chipsRow}>
                        {popularGenres.map((genre) => {
                            const isSelected = filters.genres?.includes(genre.id);
                            return (
                                <TouchableOpacity
                                    key={genre.id}
                                    style={[styles.chip, isSelected && styles.chipActive]}
                                    onPress={() => toggleGenre(genre.id)}
                                >
                                    {isSelected && (
                                        <Check size={14} color={theme.colors.white} style={styles.checkIcon} />
                                    )}
                                    <Typography style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                        {genre.name}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <GlassView intensity={60} style={styles.footer}>
                {hasActiveFilters && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Typography style={styles.clearButtonText}>Réinitialiser</Typography>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                    <Typography style={styles.applyButtonText}>Appliquer</Typography>
                </TouchableOpacity>
            </GlassView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: theme.colors.text.primary,
    },
    closeButton: {
        padding: theme.spacing.s,
    },
    content: {
        flex: 1,
        padding: theme.spacing.m,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.l,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    checkIcon: {
        marginRight: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: theme.spacing.m,
        gap: theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    clearButton: {
        flex: 1,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    clearButtonText: {
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        color: theme.colors.white,
        fontWeight: '700',
    },
});

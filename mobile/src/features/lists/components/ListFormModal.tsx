
import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { theme } from '../../../theme';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';
import { ScrollView, TouchableOpacity } from 'react-native';
import { MovieFilters, movieApi, TMDBGenre } from '../../../services/api/movieApi';
import { useState, useEffect } from 'react';

interface ListFormModalProps {
    visible: boolean;
    title: string;
    value: string;
    error: string | null;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isEditing?: boolean;
    color?: string;
    setColor: (color: string | undefined) => void;
    filters?: MovieFilters;
    setFilters: (filters: MovieFilters | undefined) => void;
}

const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
];

export default function ListFormModal({
    visible,
    title,
    value,
    error,
    onChangeText,
    onSubmit,
    onCancel,
    isEditing = false,
    color,
    setColor,
    filters,
    setFilters,
}: ListFormModalProps) {
    const [genres, setGenres] = useState<TMDBGenre[]>([]);

    useEffect(() => {
        movieApi.getGenres().then(setGenres).catch(console.error);
    }, []);

    const toggleGenre = (genreId: number) => {
        const currentGenres = filters?.genres || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter(id => id !== genreId)
            : [...currentGenres, genreId];

        setFilters({
            ...filters,
            genres: newGenres.length > 0 ? newGenres : undefined
        });
    };
    return (
        <Modal
            visible={visible}
            onClose={onCancel}
            title={title}
        >
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <Input
                    label="List Title"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="e.g., Top 2024 Movies"
                    error={error || undefined}
                />

                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Color Theme</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                        <View style={styles.colorContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.colorOption,
                                    !color && styles.selectedColorOption,
                                    { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.text.secondary }
                                ]}
                                onPress={() => setColor(undefined)}
                            >
                                {!color && <View style={styles.selectedDot} />}
                            </TouchableOpacity>
                            {COLORS.map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    style={[
                                        styles.colorOption,
                                        color === c && styles.selectedColorOption,
                                        { backgroundColor: c }
                                    ]}
                                    onPress={() => setColor(c)}
                                >
                                    {color === c && <View style={styles.selectedDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Impose Search Filters</Typography>
                    <Typography variant="caption" style={styles.sectionSubtitle}>
                        Movies added to this list will be filtered by these rules.
                    </Typography>

                    <Input
                        label="Release Year"
                        value={filters?.year?.toString() || ''}
                        onChangeText={(text) => {
                            const year = parseInt(text);
                            setFilters({
                                ...filters,
                                year: isNaN(year) ? undefined : year
                            });
                        }}
                        placeholder="e.g. 2025"
                        keyboardType="numeric"
                    />

                    <Typography variant="body" style={styles.label}>Genres</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                        {genres.map((genre) => {
                            const isSelected = filters?.genres?.includes(genre.id);
                            return (
                                <TouchableOpacity
                                    key={genre.id}
                                    style={[
                                        styles.genreChip,
                                        isSelected && styles.selectedGenreChip
                                    ]}
                                    onPress={() => toggleGenre(genre.id)}
                                >
                                    <Typography
                                        style={[
                                            styles.genreText,
                                            isSelected && styles.selectedGenreText
                                        ]}
                                    >
                                        {genre.name}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <Button
                title={isEditing ? 'Update List' : 'Create List'}
                onPress={onSubmit}
                style={styles.submitButton}
                variant="primary"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        maxHeight: 500,
    },
    section: {
        marginTop: theme.spacing.m,
    },
    sectionTitle: {
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.s,
    },
    sectionSubtitle: {
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.s,
    },
    colorScroll: {
        marginHorizontal: -theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
    },
    colorContainer: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        paddingVertical: 4,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorOption: {
        borderWidth: 2,
        borderColor: theme.colors.white,
        transform: [{ scale: 1.1 }],
    },
    selectedDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.white,
    },
    genreScroll: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    label: {
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
        marginLeft: 4,
    },
    genreChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedGenreChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    genreText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    selectedGenreText: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: theme.spacing.s,
    },
});

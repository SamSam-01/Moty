import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { movieApi, TMDBMovie, MovieFilters, TMDBGenre } from '../../services/api/movieApi';
import { X, Search as SearchIcon, Star, TrendingUp, Filter } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import GlassView from '../ui/GlassView';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import SearchFilters from './SearchFilters';

interface MovieSearchProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  onClose: () => void;
}

export default function MovieSearch({ onSelectMovie, onClose }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MovieFilters>({});
  const [sortBy, setSortBy] = useState<MovieFilters['sortBy']>('popularity.desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load trending movies and genres on mount
  useEffect(() => {
    loadTrendingMovies();
    loadGenres();
  }, []);

  const loadTrendingMovies = async () => {
    try {
      const trending = await movieApi.getTrendingMovies();
      setTrendingMovies(trending);
    } catch (err) {
      console.error('Failed to load trending movies', err);
    }
  };

  const loadGenres = async () => {
    try {
      const genreList = await movieApi.getGenres();
      setGenres(genreList);
    } catch (err) {
      console.error('Failed to load genres', err);
    }
  };

  // Search with debounce
  useEffect(() => {
    const searchMovies = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const movies = await movieApi.searchMovies(query, { ...filters, sortBy });
        setResults(movies);
      } catch (err) {
        setError('Unable to search for movies');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounce);
  }, [query, filters, sortBy]);

  const handleSelectMovie = (movie: TMDBMovie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectMovie(movie);
  };

  const renderMovieCard = ({ item }: { item: TMDBMovie }) => {
    const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : '';
    const rating = item.voteAverage ? item.voteAverage.toFixed(1) : 'N/A';

    return (
      <TouchableOpacity
        style={styles.resultItemWrapper}
        onPress={() => handleSelectMovie(item)}
        activeOpacity={0.7}
      >
        <GlassView intensity={20} style={styles.resultItem}>
          {item.posterUrl ? (
            <Image source={{ uri: item.posterUrl }} style={styles.poster} />
          ) : (
            <View style={styles.noPoster}>
              <Text style={styles.noPosterText}>No Image</Text>
            </View>
          )}
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.metaRow}>
              {year && (
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{year}</Text>
                </View>
              )}
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>

            <Text style={styles.overview} numberOfLines={3}>
              {item.overview || 'No description available'}
            </Text>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  const renderTrendingCard = ({ item }: { item: TMDBMovie }) => (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={() => handleSelectMovie(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.trendingPoster} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.trendingGradient}
      >
        <View style={styles.trendingBadge}>
          <TrendingUp size={12} color={theme.colors.accent} />
          <Text style={styles.trendingText}>Trending</Text>
        </View>
        <Text style={styles.trendingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.trendingRating}>
          <Star size={10} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.trendingRatingText}>
            {item.voteAverage?.toFixed(1)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const showTrending = query.trim().length < 2 && !isLoading;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <GlassView intensity={50} style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SearchIcon color={theme.colors.text.tertiary} size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un film..."
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
              selectionColor={theme.colors.primary}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <X color={theme.colors.text.tertiary} size={18} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowFilters(true);
            }}
            style={styles.filterButton}
          >
            <Filter color={theme.colors.primary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={theme.colors.text.secondary} size={22} />
          </TouchableOpacity>
        </View>
      </GlassView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Recherche en cours...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : showTrending ? (
          <View style={styles.trendingContainer}>
            <Text style={styles.sectionTitle}>🔥 Films du moment</Text>
            <FlatList
              data={trendingMovies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTrendingCard}
              numColumns={2}
              columnWrapperStyle={styles.trendingRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.trendingGrid}
            />
          </View>
        ) : results.length === 0 && query.trim().length >= 2 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noResults}>Aucun résultat trouvé</Text>
            <Text style={styles.noResultsSubtext}>Essayez avec un autre terme</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMovieCard}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>

      {/* Filters Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <SearchFilters
          filters={{ ...filters, sortBy }}
          genres={genres}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            if (newFilters.sortBy) {
              setSortBy(newFilters.sortBy);
            }
          }}
          onClose={() => setShowFilters(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 56,
    paddingBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  searchIcon: {
    marginRight: theme.spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.m,
  },
  resultsList: {
    padding: theme.spacing.m,
  },
  resultItemWrapper: {
    marginBottom: theme.spacing.m,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  poster: {
    width: 90,
    height: 135,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  noPoster: {
    width: 90,
    height: 135,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    ...theme.typography.small,
    color: theme.colors.text.tertiary,
  },
  movieInfo: {
    flex: 1,
    padding: theme.spacing.m,
    justifyContent: 'center',
  },
  movieTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 8,
    fontWeight: '700' as const,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  yearText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontWeight: '600' as const,
    fontSize: 11,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    ...theme.typography.small,
    color: '#FBBF24',
    fontWeight: '700' as const,
    fontSize: 11,
  },
  overview: {
    ...theme.typography.small,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
  noResults: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  noResultsSubtext: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  // Trending section
  trendingContainer: {
    flex: 1,
    paddingTop: theme.spacing.l,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 24,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    fontWeight: '700' as const,
  },
  trendingGrid: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  trendingRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  trendingCard: {
    width: '48%',
    aspectRatio: 2 / 3,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
  },
  trendingPoster: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceHighlight,
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.s,
    paddingTop: theme.spacing.l,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  trendingText: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontWeight: '600' as const,
    fontSize: 9,
  },
  trendingTitle: {
    ...theme.typography.body,
    fontSize: 13,
    color: theme.colors.white,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendingRatingText: {
    ...theme.typography.small,
    color: '#FBBF24',
    fontWeight: '600' as const,
    fontSize: 11,
  },
});

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
} from 'react-native';
import { movieApi, TMDBMovie } from '../../services/api/movieApi';
import { X, Search as SearchIcon } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import GlassView from '../ui/GlassView';
import { LinearGradient } from 'expo-linear-gradient';

interface MovieSearchProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  onClose: () => void;
}

export default function MovieSearch({ onSelectMovie, onClose }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const movies = await movieApi.searchMovies(query);
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
  }, [query]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      <GlassView intensity={50} style={styles.header}>
        <View style={styles.searchBar}>
          <SearchIcon color={theme.colors.text.tertiary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a movie..."
            placeholderTextColor={theme.colors.text.tertiary}
            autoFocus
            selectionColor={theme.colors.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color={theme.colors.text.tertiary} size={20} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </GlassView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : results.length === 0 && query.trim().length >= 2 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noResults}>No results found</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItemWrapper}
                onPress={() => onSelectMovie(item)}
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
                    <Text style={styles.movieTitle}>{item.title}</Text>
                    {item.releaseDate && (
                      <Text style={styles.releaseDate}>
                        {new Date(item.releaseDate).getFullYear()}
                      </Text>
                    )}
                    <Text style={styles.overview} numberOfLines={2}>
                      {item.overview || 'No description available'}
                    </Text>
                  </View>
                </GlassView>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
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
    paddingBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    height: 48,
    marginRight: theme.spacing.m,
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
  cancelButton: {
    padding: theme.spacing.s,
  },
  cancelText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: theme.spacing.m,
  },
  resultItemWrapper: {
    marginBottom: theme.spacing.m,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  poster: {
    width: 80,
    height: 120,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  noPoster: {
    width: 80,
    height: 120,
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
    fontSize: 18,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  releaseDate: {
    ...theme.typography.small,
    color: theme.colors.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  overview: {
    ...theme.typography.small,
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  noResults: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});
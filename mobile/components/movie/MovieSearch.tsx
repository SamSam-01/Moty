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
} from 'react-native';
import { movieApi, TMDBMovie } from '../../services/api/movieApi';
import { COLORS } from '../../constants';
import { X } from 'lucide-react-native';

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
      <View style={styles.header}>
        <Text style={styles.title}>Search for a movie</Text> {/* Changed from French */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Movie title..." /* Changed from French */
        placeholderTextColor={COLORS.placeholder}
        autoFocus
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : results.length === 0 && query.trim().length >= 2 ? (
        <Text style={styles.noResults}>No results found</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => onSelectMovie(item)}
            >
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
                  {item.overview || 'No description available'} {/* Changed from French */}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  poster: {
    width: 80,
    height: 120,
  },
  noPoster: {
    width: 80,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  movieInfo: {
    flex: 1,
    padding: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  overview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: COLORS.notification,
    textAlign: 'center',
    marginTop: 40,
  },
  noResults: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 40,
  },
});
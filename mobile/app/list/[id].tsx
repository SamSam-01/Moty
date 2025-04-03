import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useMovieItems } from '../../hooks/useMovieItems';
import MovieItem from '../../components/movie/MovieItem';
import MovieFormModal from '../../components/movie/MovieFormModal';

export default function ListDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  
  const {
    movies,
    isLoading,
    isCreating,
    isEditing,
    currentMovie,
    title: movieTitle,
    setTitle: setMovieTitle,
    notes,
    setNotes,
    imageUrl,
    formError,
    openCreateModal,
    openEditModal,
    closeModals,
    pickImage,
    handleCreateMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    handleReorderMovies,
  } = useMovieItems(id);

  const getMedalEmoji = (rank: number): string | null => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </BlurView>
      
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0A84FF" style={styles.loader} />
        ) : movies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              This list is empty.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first movie to start ranking!
            </Text>
          </View>
        ) : (
          <FlatList
            data={movies}
            renderItem={({ item, index }) => (
              <MovieItem
                item={item}
                index={index}
                onDragEnd={handleReorderMovies}
                itemCount={movies.length}
                medalEmoji={getMedalEmoji(item.rank)}
                onEdit={openEditModal}
                onDelete={handleDeleteMovie}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Create New Movie Modal */}
      <MovieFormModal
        visible={isCreating}
        title="Add New Movie"
        value={movieTitle}
        notes={notes}
        imageUrl={imageUrl}
        error={formError}
        onChangeTitle={setMovieTitle}
        onChangeNotes={setNotes}
        onSubmit={handleCreateMovie}
        onCancel={closeModals}
        onPickImage={pickImage}
      />

      {/* Edit Movie Modal */}
      <MovieFormModal
        visible={isEditing}
        title="Edit Movie"
        value={movieTitle}
        notes={notes}
        imageUrl={imageUrl}
        error={formError}
        onChangeTitle={setMovieTitle}
        onChangeNotes={setNotes}
        onSubmit={handleUpdateMovie}
        onCancel={closeModals}
        onPickImage={pickImage}
        isEditing
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
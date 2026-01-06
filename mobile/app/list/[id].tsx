
import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMovieItems, MovieItem, MovieFormModal, MovieSearch } from '../../src/features/movies';
import { theme } from '../../src/theme';
import GlassView from '../../src/components/ui/GlassView';
import Typography from '../../src/components/ui/Typography';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Movie } from '../../src/types';

// Pure function to get medal emoji based on rank
const getMedalEmoji = (rank: number): string | null => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export default function ListDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();

  const {
    movies,
    isLoading,
    isCreating,
    isEditing,
    isSearching,
    currentMovie,
    title: movieTitle,
    setTitle: setMovieTitle,
    notes,
    setNotes,
    imageUrl,
    formError,
    openCreateModal,
    openSearchModal,
    openEditModal,
    closeModals,

    handleCreateMovie,
    handleSelectTMDBMovie,
    handleUpdateMovie,
    handleDeleteMovie,
    handleReorderMovies,
  } = useMovieItems(id);

  const renderItem = useCallback(({ item, getIndex, drag, isActive }: RenderItemParams<Movie>) => {
    const index = getIndex();
    const medal = getMedalEmoji(item.rank);

    return (
      <MovieItem
        item={item}
        index={(item.rank || 1) - 1}
        drag={drag}
        isActive={isActive}
        medalEmoji={medal}
        onEdit={openEditModal}
        onDelete={handleDeleteMovie}
      />
    );
  }, [openEditModal, handleDeleteMovie]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.background, '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      <GlassView intensity={50} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={20}
          >
            <ArrowLeft color={theme.colors.text.primary} size={24} />
          </TouchableOpacity>
          <Typography variant="h3" style={styles.headerTitle} numberOfLines={1}>
            {Array.isArray(title) ? title[0] : (title || 'List Details')}
          </Typography>
          <View style={styles.headerRight} />
        </View>
      </GlassView>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : movies.length === 0 ? (
          <View style={styles.centerContainer}>
            <GlassView intensity={20} style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyStateText}>
                No movies yet
              </Typography>
              <Typography variant="body" style={styles.emptyStateSubtext}>
                Tap the + button to start ranking!
              </Typography>
            </GlassView>
          </View>
        ) : (
          <DraggableFlatList
            data={movies}
            onDragEnd={({ data, from, to }) => {
              handleReorderMovies(from, to, data);
            }}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fabWrapper}
            onPress={openSearchModal}
            activeOpacity={0.8}
          >
            <GlassView intensity={40} style={[styles.fab, styles.searchFab]}>
              <Search color={theme.colors.white} size={24} />
            </GlassView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabWrapper}
            onPress={openCreateModal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.fabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus color={theme.colors.white} size={28} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
        isEditing
      />

      {/* Search Movie Modal */}
      {isSearching && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={isSearching}
          onRequestClose={closeModals}
        >
          <MovieSearch
            onSelectMovie={handleSelectTMDBMovie}
            onClose={closeModals}
          />
        </Modal>
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
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
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
    textAlign: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.m,
  },
  headerRight: {
    width: 40,
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
  listContainer: {
    paddingTop: theme.spacing.m,
    paddingBottom: 120, // Space for FABs
  },
  emptyState: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateText: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  emptyStateSubtext: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    gap: 16,
    alignItems: 'center',
  },
  fabWrapper: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFab: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)', // Cyan with opacity
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
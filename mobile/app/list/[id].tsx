
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
import { ArrowLeft, Plus, Search, Settings, Check, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMovieItems, MovieItem, MovieFormModal, MovieSearch } from '../../src/features/movies';
import { useMovieLists, ListFormModal } from '../../src/features/lists';
import { theme } from '../../src/theme';
import { useAppContext } from '../../src/context/AppContext';
import GlassView from '../../src/components/ui/GlassView';
import Typography from '../../src/components/ui/Typography';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Movie, PodiumEntry } from '../../src/types';
import Podium from '../../src/features/podium/components/Podium';

// Pure function to get medal emoji based on rank
const getMedalEmoji = (rank: number): string | null => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export default function ListDetailScreen() {
  const { id, title, readonly, isPinned: paramIsPinned } = useLocalSearchParams<{ id: string; title: string, readonly?: string, isPinned?: string }>();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const isStrictlyReadOnly = readonly === 'true';
  const isCurrentlyReadOnly = isStrictlyReadOnly || !isEditMode;
  const canEdit = !isStrictlyReadOnly;

  const { lists } = useAppContext();
  const currentList = lists.find(list => list.id === id);
  const isPinnedList = paramIsPinned === 'true' || currentList?.isPinned;
  const showPodium = isCurrentlyReadOnly;

  const {
    isEditing: isListFormEditing,
    title: listFormTitle,
    setTitle: setListFormTitle,
    color,
    setColor,
    filters,
    setFilters,
    isPinned,
    setIsPinned,
    formError: listFormError,
    openEditModal: openListEditModal,
    closeModals: closeListModals,
    handleUpdateList,
  } = useMovieLists();

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
        onEdit={isCurrentlyReadOnly ? undefined : openEditModal}
        onDelete={isCurrentlyReadOnly ? undefined : handleDeleteMovie}
        readonly={isCurrentlyReadOnly}
      />
    );
  }, [openEditModal, handleDeleteMovie, isCurrentlyReadOnly]);

  const displayMovies = showPodium ? movies.slice(3) : movies;
  const podiumEntries: PodiumEntry[] = (showPodium ? movies.slice(0, 3) : []).map((m, i) => ({
    id: m.id,
    user_id: '',
    tmdb_id: m.tmdbId || '',
    movie_data: m,
    rank: (m.rank || i + 1) as 1 | 2 | 3,
    created_at: new Date().toISOString()
  }));

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
          <View style={styles.headerRight}>
            {canEdit && isEditMode && currentList && (
              <TouchableOpacity onPress={() => openListEditModal(currentList)} style={{ padding: 8 }}>
                <Pencil color={theme.colors.text.primary} size={20} />
              </TouchableOpacity>
            )}
          </View>
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
            data={displayMovies}
            onDragEnd={({ data, from, to }) => {
              handleReorderMovies(from, to, data);
            }}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={showPodium && podiumEntries.length > 0 ? <Podium entries={podiumEntries} /> : null}
          />
        )}

        {canEdit && !isEditMode && (
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.fabWrapper}
              onPress={() => setIsEditMode(true)}
              activeOpacity={0.8}
            >
              <GlassView intensity={40} style={[styles.fab, styles.searchFab]}>
                <Settings color={theme.colors.white} size={24} />
              </GlassView>
            </TouchableOpacity>
          </View>
        )}

        {canEdit && isEditMode && (
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.fabWrapper}
              onPress={() => setIsEditMode(false)}
              activeOpacity={0.8}
            >
              <GlassView intensity={40} style={[styles.fab, styles.checkFab]}>
                <Check color={theme.colors.white} size={24} />
              </GlassView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabWrapper}
              onPress={openSearchModal}
              activeOpacity={0.8}
            >
              <GlassView intensity={40} style={[styles.fab, styles.searchFab]}>
                <Search color={theme.colors.white} size={24} />
              </GlassView>
            </TouchableOpacity>

          </View>
        )}
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
            imposedFilters={currentList?.filters}
          />
        </Modal>
      )}

      {/* Edit List Settings Modal */}
      <ListFormModal
        visible={isListFormEditing}
        title="Edit List"
        value={listFormTitle}
        error={listFormError}
        onChangeText={setListFormTitle}
        onSubmit={async () => {
          await handleUpdateList();
          router.setParams({ title: listFormTitle });
        }}
        onCancel={closeListModals}
        isEditing={true}
        color={color}
        setColor={setColor}
        filters={filters}
        setFilters={setFilters}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />
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
  checkFab: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald green with opacity
    borderColor: '#10b981',
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

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Plus, User, Search, Bell } from 'lucide-react-native';
import { useMovieLists, ListCard, ListFormModal } from '../src/features/lists';
import { relationshipService } from '../src/services/api/relationshipService';
import { podiumService } from '../src/services/api/podiumService';
import { useAppContext } from '../src/context/AppContext';
import { theme } from '../src/theme';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import Podium from '../src/features/podium/components/Podium';
import { PodiumEntry } from '../src/types';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function HomeScreen() {
  const {
    lists,
    isCreating,
    isEditing,
    title,
    setTitle,
    color,
    setColor,
    filters,
    setFilters,
    isPinned,
    setIsPinned,

    formError,
    openCreateModal,
    openEditModal,
    closeModals,

    handleCreateList,
    handleUpdateList,
    handleDeleteList,
  } = useMovieLists();
  const { session } = useAppContext();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [podium, setPodium] = React.useState<PodiumEntry[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (session?.user?.id) {
        // Load Podium
        podiumService.getPodium(session.user.id)
          .then(setPodium)
          .catch(console.error);

        // Load Notifications
        relationshipService.getUnreadCount(session.user.id)
          .then(count => setUnreadCount(count))
          .catch(console.error);
      }
    }, [session?.user?.id])
  );

  const handlePodiumPress = (rank: 1 | 2 | 3) => {
    router.push(`/movie-search?rank=${rank}`);
  };


  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolate.CLAMP),
    };
  });

  const navigateToList = (listId: string, listTitle: string) => {
    router.push({
      pathname: '/list/[id]',
      params: { id: listId, title: listTitle }
    });
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={[theme.colors.background, '#1e1b4b']} // Darker indigo bottom
        style={StyleSheet.absoluteFill}
      />

      {/* Sticky Header (Glass) */}
      <Animated.View style={[styles.stickyHeader, headerStyle]}>
        <GlassView intensity={80} style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <Typography variant="h3" style={styles.headerTitleSmall}>My Rankings</Typography>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconButton}>
              <View style={styles.bellContainer}>
                <Bell color={theme.colors.text.primary} size={20} />
                {unreadCount > 0 && <View style={styles.badge} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconButton}>
              <Search color={theme.colors.text.primary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToProfile} style={styles.iconButton}>
              <User color={theme.colors.text.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <AnimatedFlatList
        data={lists}
        renderItem={({ item, index }: { item: any, index: number }) => (
          <ListCard
            list={item}
            index={index}
            onPress={navigateToList}
            onEdit={openEditModal}
            onDelete={handleDeleteList}
          />
        )}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.largeHeader}>
            <View style={styles.largeHeaderTop}>
              <View>
                <Typography variant="caption" style={styles.greeting}>Welcome back</Typography>
                <Typography variant="h1" style={styles.headerTitleLarge}>My Rankings</Typography>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.actionButton}>
                  <View style={styles.bellContainer}>
                    <Bell color={theme.colors.text.secondary} size={24} />
                    {unreadCount > 0 && <View style={styles.badgeLarge} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/search')} style={styles.actionButton}>
                  <Search color={theme.colors.text.secondary} size={24} />
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToProfile} style={styles.actionButton}>
                  <User color={theme.colors.text.secondary} size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: theme.spacing.xl }}>
              <Podium entries={podium} editable={true} onPressSlot={handlePodiumPress} />
            </View>
            <Typography variant="body" style={styles.subtitle}>
              {lists.length} {lists.length === 1 ? 'Collection' : 'Collections'}
            </Typography>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="h3" style={styles.emptyStateText}>Start your collection</Typography>
            <Typography variant="body" style={styles.emptyStateSubtext}>
              Create your first list to start ranking movies!
            </Typography>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus color="#fff" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      <ListFormModal
        visible={isCreating || isEditing}
        title={isEditing ? "Edit List" : "New Collection"}
        value={title}
        error={formError}
        onChangeText={setTitle}
        onSubmit={isEditing ? handleUpdateList : handleCreateList}
        onCancel={closeModals}
        isEditing={isEditing}
        color={color}
        setColor={setColor}
        filters={filters}
        setFilters={setFilters}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    paddingTop: 60, // Space for large header
    paddingBottom: 100,
    paddingHorizontal: theme.spacing.m,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 100,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.m,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center', // Title centered
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  headerTitleSmall: {
    color: theme.colors.text.primary,
  },
  iconButton: {
    padding: 8,
  },
  largeHeader: {
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.s,
  },
  largeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  actionButton: {
    padding: theme.spacing.s,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.round,
  },
  headerRight: {
    flexDirection: 'row',
    position: 'absolute',
    right: theme.spacing.l,
    gap: theme.spacing.m,
  },
  greeting: {
    color: theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  headerTitleLarge: {
    color: theme.colors.text.primary,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.l,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyStateText: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  emptyStateSubtext: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  bellContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444', // Hardcoded red to ensure visibility
    borderWidth: 2,
    borderColor: '#1e1b4b',
    zIndex: 10,
  },
  badgeLarge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444', // Hardcoded red
    borderWidth: 2,
    borderColor: '#1e1b4b',
    zIndex: 10,
  }
});
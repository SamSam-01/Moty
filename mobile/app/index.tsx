
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, LogOut } from 'lucide-react-native';
import { useMovieLists } from '../hooks/useMovieLists';
import ListCard from '../components/list/ListCard';
import ListFormModal from '../components/list/ListFormModal';
import { theme } from '../constants/theme';
import GlassView from '../components/ui/GlassView';
import { LinearGradient } from 'expo-linear-gradient';
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
    imageUrl,
    formError,
    openCreateModal,
    openEditModal,
    closeModals,
    pickImage,
    handleCreateList,
    handleUpdateList,
    handleDeleteList,
    signOut,
  } = useMovieLists();

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
          <Text style={styles.headerTitleSmall}>My Rankings</Text>
          <TouchableOpacity onPress={signOut} style={styles.iconButton}>
            <LogOut color={theme.colors.text.primary} size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <AnimatedFlatList
        data={lists}
        renderItem={({ item, index }) => (
          <ListCard
            list={item}
            index={index}
            onPress={navigateToList}
            onEdit={openEditModal}
            onDelete={handleDeleteList}
          />
        )}
        keyExtractor={(item) => item.id}
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
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.headerTitleLarge}>My Rankings</Text>
              </View>
              <TouchableOpacity onPress={signOut} style={styles.logoutButtonLarge}>
                <LogOut color={theme.colors.text.secondary} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {lists.length} {lists.length === 1 ? 'Collection' : 'Collections'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Start your collection</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first list to start ranking movies!
            </Text>
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
        imageUrl={imageUrl}
        error={formError}
        onChangeText={setTitle}
        onSubmit={isEditing ? handleUpdateList : handleCreateList}
        onCancel={closeModals}
        onPickImage={pickImage}
        isEditing={isEditing}
      />
    </View>
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
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  iconButton: {
    position: 'absolute',
    right: theme.spacing.l,
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
  logoutButtonLarge: {
    padding: theme.spacing.s,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.round,
  },
  greeting: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  headerTitleLarge: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.body,
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
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  emptyStateSubtext: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
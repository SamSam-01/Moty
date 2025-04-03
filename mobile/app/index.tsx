import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useMovieLists } from '../hooks/useMovieLists';
import ListCard from '../components/list/ListCard';
import ListFormModal from '../components/list/ListFormModal';

export default function HomeScreen() {
  const {
    lists,
    isCreating,
    isEditing,
    currentList,
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
  } = useMovieLists();

  const navigateToList = (listId: string, listTitle: string) => {
    router.push({
      pathname: '/list/[id]',
      params: { id: listId, title: listTitle }
    });
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.header}>
        <Text style={styles.headerTitle}>My Movie Rankings</Text>
      </BlurView>
      
      <View style={styles.content}>
        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any movie lists yet.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first list to start ranking movies!
            </Text>
          </View>
        ) : (
          <FlatList
            data={lists}
            renderItem={({ item }) => (
              <ListCard
                list={item}
                onPress={navigateToList}
                onEdit={openEditModal}
                onDelete={handleDeleteList}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            numColumns={2}
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

      {/* Create New List Modal */}
      <ListFormModal
        visible={isCreating}
        title="Create New List"
        value={title}
        imageUrl={imageUrl}
        error={formError}
        onChangeText={setTitle}
        onSubmit={handleCreateList}
        onCancel={closeModals}
        onPickImage={pickImage}
      />

      {/* Edit List Modal */}
      <ListFormModal
        visible={isEditing}
        title="Edit List"
        value={title}
        imageUrl={imageUrl}
        error={formError}
        onChangeText={setTitle}
        onSubmit={handleUpdateList}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
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
});
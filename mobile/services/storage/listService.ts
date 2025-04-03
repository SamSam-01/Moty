import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieList } from '../../types';

const LISTS_STORAGE_KEY = '@movie_lists';

export const listService = {
  async getLists(): Promise<MovieList[]> {
    try {
      const savedLists = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (savedLists) {
        return JSON.parse(savedLists);
      }
      return [];
    } catch (e) {
      console.error('Failed to load lists', e);
      throw new Error('Failed to load movie lists');
    }
  },

  async saveLists(lists: MovieList[]): Promise<void> {
    try {
      await AsyncStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    } catch (e) {
      console.error('Failed to save lists', e);
      throw new Error('Failed to save your changes');
    }
  },

  async addList(list: MovieList): Promise<MovieList[]> {
    const lists = await this.getLists();
    const newLists = [...lists, list];
    await this.saveLists(newLists);
    return newLists;
  },

  async updateList(updatedList: MovieList): Promise<MovieList[]> {
    const lists = await this.getLists();
    const newLists = lists.map(list => 
      list.id === updatedList.id ? updatedList : list
    );
    await this.saveLists(newLists);
    return newLists;
  },

  async deleteList(listId: string): Promise<MovieList[]> {
    const lists = await this.getLists();
    const newLists = lists.filter(list => list.id !== listId);
    await this.saveLists(newLists);
    return newLists;
  }
};
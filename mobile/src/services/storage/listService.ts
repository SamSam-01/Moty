
import { supabase } from '../../lib/supabase';
import { MovieList } from '../../types';
import { MovieFilters } from '../api/movieApi';

export const listService = {
  async getLists(): Promise<MovieList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id.toString(),
      title: item.name, // Map 'name' from DB to 'title' in app
      imageUrl: item.image_url,
      color: item.color,
      filters: item.filters,
      createdAt: new Date(item.created_at).getTime(),
    }));
  },

  async addList(title: string, color?: string, filters?: MovieFilters): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    const { error } = await supabase
      .from('lists')
      .insert({
        name: title, // Use 'name' column
        user_id: user.id,
        color,
        filters,
      });

    if (error) throw error;
  },

  async updateList(id: string, title: string, color?: string, filters?: MovieFilters): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({
        name: title, // Use 'name' column
        color,
        filters,
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
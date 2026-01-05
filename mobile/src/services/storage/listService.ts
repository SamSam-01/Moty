
import { supabase } from '../../lib/supabase';
import { MovieList } from '../../types';

export const listService = {
  async getLists(): Promise<MovieList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      title: item.name, // Map 'name' from DB to 'title' in app
      imageUrl: item.image_url,
      createdAt: new Date(item.created_at).getTime(),
    }));
  },

  async addList(title: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    const { error } = await supabase
      .from('lists')
      .insert({
        name: title, // Use 'name' column
        user_id: user.id,
      });

    if (error) throw error;
  },

  async updateList(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ name: title }) // Use 'name' column
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
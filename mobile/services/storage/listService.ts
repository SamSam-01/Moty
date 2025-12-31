
import { supabase } from '../../lib/supabase';
import { MovieList } from '../../types';

export const listService = {
  async getLists(): Promise<MovieList[]> {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lists:', error);
      throw new Error(error.message);
    }

    return data.map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      createdAt: new Date(item.created_at).getTime(),
    }));
  },

  async addList(title: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not logged in');

    const { error } = await supabase
      .from('lists')
      .insert({
        name: title,
        user_id: user.id,
      });

    if (error) throw new Error(error.message);
  },

  async updateList(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .update({ name: title })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};
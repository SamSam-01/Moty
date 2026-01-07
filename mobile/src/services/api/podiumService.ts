import { supabase } from '../../lib/supabase';
import { PodiumEntry, Movie } from '../../types';

export const podiumService = {
    /**
     * Get user's podium
     */
    async getPodium(userId: string): Promise<PodiumEntry[]> {
        const { data, error } = await supabase
            .from('podium')
            .select('*')
            .eq('user_id', userId)
            .order('rank', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Update/Set a movie in a specific rank position
     */
    async updatePodium(rank: number, movie: Movie): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('podium')
            .upsert({
                user_id: user.id,
                rank: rank,
                tmdb_id: movie.tmdbId || movie.id,
                movie_data: movie,
            }, {
                onConflict: 'user_id,rank'
            });

        if (error) throw error;
    },

    /**
     * Remove a movie from the podium
     */
    async removeFromPodium(rank: number): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('podium')
            .delete()
            .eq('user_id', user.id)
            .eq('rank', rank);

        if (error) throw error;
    }
};

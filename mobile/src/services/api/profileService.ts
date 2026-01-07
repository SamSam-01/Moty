import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export const profileService = {
    /**
     * Get user profile by ID
     */
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Ignore error if row doesn't exist yet (e.g. first login)
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    /**
     * Check if a username is available
     * Returns true if available, false if taken
     */
    async checkUsernameAvailability(username: string): Promise<boolean> {
        if (username.length < 3) return false;

        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        // If we found a row, the username is taken
        if (data) return false;

        // If error is "row not found" (PGRST116), then username is available
        if (error && error.code === 'PGRST116') return true;

        // Other errors imply we can't verify, so assume unsafe
        if (error) {
            console.error('Error checking username:', error);
            return false;
        }

        return false;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });

        if (error) {
            throw error;
        }
    },

    /**
     * Create profile for new user
     */
    async createProfile(userId: string, username: string): Promise<void> {
        const available = await this.checkUsernameAvailability(username);
        if (!available) {
            throw new Error('Username is already taken');
        }

        const { error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username,
                is_public: true, // Default to public
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;
    },

    /**
     * Search users by username
     */
    async searchUsers(query: string): Promise<UserProfile[]> {
        if (!query || query.length < 2) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query}%`)
            .limit(10);

        if (error) throw error;
        return data || [];
        if (error) throw error;
        return data || [];
    },

    /**
     * Update Push Token for user
     */
    async registerPushToken(userId: string, token: string): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({ push_token: token })
            .eq('id', userId);

        if (error) {
            console.error('Error updating push token:', error);
            // Don't throw, just log. Not critical.
        }
    }
};

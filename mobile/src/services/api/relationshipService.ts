import { supabase } from '../../lib/supabase';

export interface FollowStats {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}

export const relationshipService = {
    /**
     * Follow a user
     */
    async followUser(followerId: string, followingId: string): Promise<void> {
        const { error } = await supabase
            .from('relationships')
            .insert({
                follower_id: followerId,
                following_id: followingId,
            });

        if (error) throw error;
    },

    /**
     * Unfollow a user
     */
    async unfollowUser(followerId: string, followingId: string): Promise<void> {
        const { error } = await supabase
            .from('relationships')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;
    },

    /**
     * Get follow stats (followers, following, isFollowing status)
     */
    async getFollowStats(userId: string, currentUserId?: string): Promise<FollowStats> {
        // Get Followers Count
        const { count: followersCount, error: followersError } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        if (followersError) throw followersError;

        // Get Following Count
        const { count: followingCount, error: followingError } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

        if (followingError) throw followingError;

        // Check if current user is following target user
        let isFollowing = false;
        if (currentUserId) {
            const { data, error } = await supabase
                .from('relationships')
                .select('*')
                .eq('follower_id', currentUserId)
                .eq('following_id', userId)
                .single();

            // PGRST116 means no row found, which is fine (not following)
            if (!error && data) {
                isFollowing = true;
            }
        }

        return {
            followersCount: followersCount || 0,
            followingCount: followingCount || 0,
            isFollowing,
        };
    }
};

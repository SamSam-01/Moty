import { supabase } from '../../lib/supabase';

export interface FollowStats {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isPending: boolean;
}

export interface PendingRequest {
    id: string; // relationship id
    follower: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
    created_at: string;
}

export const relationshipService = {
    /**
     * Follow a user
     */
    async followUser(followerId: string, followingId: string): Promise<void> {
        // 1. Check if target user is public
        const { data: targetProfile, error: profileError } = await supabase
            .from('profiles')
            .select('is_public')
            .eq('id', followingId)
            .single();

        if (profileError) throw profileError;

        const status = targetProfile?.is_public ? 'accepted' : 'pending';

        // 2. Insert relationship
        const { error } = await supabase
            .from('relationships')
            .insert({
                follower_id: followerId,
                following_id: followingId,
                status: status
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
            .eq('following_id', userId)
            .eq('status', 'accepted');

        if (followersError) {
            console.error('Error fetching followers count:', followersError);
            throw followersError;
        }
        // Get Following Count
        const { count: followingCount, error: followingError } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId)
            .eq('status', 'accepted');

        if (followingError) throw followingError;

        // Check if current user is following target user
        let isFollowing = false;
        let isPending = false;

        if (currentUserId) {
            const { data, error } = await supabase
                .from('relationships')
                .select('status')
                .eq('follower_id', currentUserId)
                .eq('following_id', userId)
                .single();

            if (!error && data) {
                if (data.status === 'accepted') {
                    isFollowing = true;
                } else if (data.status === 'pending') {
                    isPending = true;
                }
            }
        }

        return {
            followersCount: followersCount || 0,
            followingCount: followingCount || 0,
            isFollowing,
            isPending
        };
    },

    /**
     * Get pending follow requests for the current user (where current user is the target/following_id)
     */
    async getPendingRequests(userId: string): Promise<PendingRequest[]> {
        const { data, error } = await supabase
            .from('relationships')
            .select(`
                id,
                created_at,
                follower:profiles!follower_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('following_id', userId)
            .eq('status', 'pending');

        if (error) throw error;

        // Map correct type from join
        return (data || []).map((item: any) => ({
            id: item.id,
            created_at: item.created_at,
            follower: {
                id: item.follower.id,
                username: item.follower.username,
                avatar_url: item.follower.avatar_url,
            }
        }));
    },

    async acceptRequest(requestId: string): Promise<void> {
        const { error } = await supabase
            .from('relationships')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        if (error) throw error;
    },

    async declineRequest(requestId: string): Promise<void> {
        const { error } = await supabase
            .from('relationships')
            .delete()
            .eq('id', requestId);

        if (error) throw error;
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId)
            .eq('status', 'pending');

        if (error) throw error;
        if (error) throw error;

        // Count unseen accepted followers
        const { count: followersCount, error: followersError } = await supabase
            .from('relationships')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId)
            .eq('status', 'accepted')
            .eq('is_seen', false);

        if (followersError) throw followersError;

        return (count || 0) + (followersCount || 0);
    },

    async getRecentFollowers(userId: string): Promise<PendingRequest[]> {
        const { data, error } = await supabase
            .from('relationships')
            .select(`
                id,
                created_at,
                follower:profiles!follower_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('following_id', userId)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Map correct type from join (reusing PendingRequest structure for simplicity as it fits)
        return (data || []).map((item: any) => ({
            id: item.id,
            created_at: item.created_at,
            follower: {
                id: item.follower.id,
                username: item.follower.username,
                avatar_url: item.follower.avatar_url,
            }
        }));
    },

    async markNotificationsAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('relationships')
            .update({ is_seen: true })
            .eq('following_id', userId)
            .eq('status', 'accepted')
            .eq('is_seen', false);

        if (error) throw error;
    },

    async getFollowers(userId: string): Promise<PendingRequest[]> {
        const { data, error } = await supabase
            .from('relationships')
            .select(`
                id,
                created_at,
                follower:profiles!follower_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('following_id', userId)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: any) => ({
            id: item.id,
            created_at: item.created_at,
            follower: {
                id: item.follower.id,
                username: item.follower.username,
                avatar_url: item.follower.avatar_url,
            }
        }));
    },

    async getFollowing(userId: string): Promise<PendingRequest[]> {
        const { data, error } = await supabase
            .from('relationships')
            .select(`
                id,
                created_at,
                following:profiles!following_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('follower_id', userId)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to same structure but use 'following' as the user object
        return (data || []).map((item: any) => ({
            id: item.id,
            created_at: item.created_at,
            follower: { // reusing 'follower' key for generic 'user' display in UI to keep type simple
                id: item.following.id,
                username: item.following.username,
                avatar_url: item.following.avatar_url,
            }
        }));
    }
};

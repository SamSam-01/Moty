import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import GlassView from '../../../components/ui/GlassView';
import Typography from '../../../components/ui/Typography';
import { MovieList, UserProfile } from '../../../types';
import { ListCard } from '../../lists';

interface PublicProfileViewProps {
    profile: UserProfile | null;
    lists?: MovieList[]; // Expected to be already filtered for pinned lists
    isOwner?: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    stats?: {
        followers: number;
        following: number;
        isFollowing: boolean;
    };
}

export default function PublicProfileView({
    profile,
    lists = [],
    isOwner = false,
    onFollow,
    onUnfollow,
    stats,
}: PublicProfileViewProps) {
    const isPublic = profile?.is_public ?? true;
    const canViewLists = isPublic || stats?.isFollowing || isOwner;

    if (!isPublic && !stats?.isFollowing && !isOwner) {
        return (
            <GlassView intensity={20} style={styles.profileCard}>
                <View style={styles.privateContainer}>
                    <Lock color={theme.colors.text.secondary} size={48} />
                    <Typography variant="h3" style={styles.privateText}>This profile is private</Typography>
                </View>
            </GlassView>
        );
    }

    return (
        <View>
            <GlassView intensity={20} style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.avatar}
                    >
                        <Typography variant="h1" style={styles.avatarText}>
                            {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </Typography>
                    </LinearGradient>
                    <Typography variant="h2" style={styles.usernameTitle}>
                        {profile?.username || 'User'}
                    </Typography>
                </View>

                {/* Stats & Actions */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Typography variant="h3" style={styles.statValue}>{stats?.followers || 0}</Typography>
                        <Typography variant="caption" style={styles.statLabel}>Followers</Typography>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Typography variant="h3" style={styles.statValue}>{stats?.following || 0}</Typography>
                        <Typography variant="caption" style={styles.statLabel}>Following</Typography>
                    </View>
                </View>

                {!isOwner && (
                    <TouchableOpacity
                        style={[styles.followButton, stats?.isFollowing && styles.followingButton]}
                        onPress={stats?.isFollowing ? onUnfollow : onFollow}
                    >
                        <Typography
                            variant="body"
                            style={[styles.followButtonText, stats?.isFollowing && styles.followingButtonText]}
                        >
                            {stats?.isFollowing ? 'Following' : 'Follow'}
                        </Typography>
                    </TouchableOpacity>
                )}
            </GlassView>

            {/* Pinned Lists Section */}
            {canViewLists && lists.length > 0 && (
                <View style={styles.pinnedSection}>
                    <View style={styles.pinnedHeader}>
                        <Pin color={theme.colors.primary} size={20} style={{ transform: [{ rotate: '45deg' }] }} />
                        <Typography variant="h3" style={styles.sectionTitle}>Pinned Lists</Typography>
                    </View>
                    <View style={styles.pinnedListContainer}>
                        {lists.map((list, index) => (
                            <ListCard
                                key={list.id}
                                list={list}
                                index={index}
                                onPress={() => { }} // Navigate to list details (if implemented)
                                onEdit={() => { }}
                                onDelete={() => { }}
                                readonly={true}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.xl,
    },
    privateContainer: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.m,
    },
    privateText: {
        color: theme.colors.text.secondary,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
    },
    usernameTitle: {
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    pinnedSection: {
        marginBottom: theme.spacing.xl,
    },
    pinnedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
        color: theme.colors.text.primary,
    },
    pinnedListContainer: {
        gap: theme.spacing.m,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.xl,
        marginVertical: theme.spacing.m,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    followButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginTop: theme.spacing.s,
        alignSelf: 'center',
    },
    followingButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    followingButtonText: {
        color: theme.colors.text.secondary,
    },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import GlassView from '../../../components/ui/GlassView';
import Typography from '../../../components/ui/Typography';
import { MovieList, UserProfile } from '../../../types';
import { ListCard } from '../../lists';
import Podium from '../../podium/components/Podium';
import { PodiumEntry } from '../../../types';
import { ScrollView } from 'react-native-gesture-handler';

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
        isPending: boolean;
    };
    onFollowersPress?: () => void;
    onFollowingPress?: () => void;
    podium?: PodiumEntry[];
    onPodiumPress?: (rank: 1 | 2 | 3) => void;
}

export default function PublicProfileView({
    profile,
    lists = [],
    isOwner = false,
    onFollow,
    onUnfollow,
    stats,
    onFollowersPress,
    onFollowingPress,
    podium = [],
    onPodiumPress,
}: PublicProfileViewProps) {
    const isPublic = profile?.is_public ?? true;
    const canViewLists = isPublic || stats?.isFollowing || isOwner;

    return (
        <View>
            <ScrollView>
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
                        <TouchableOpacity
                            onPress={canViewLists ? onFollowersPress : undefined}
                            style={styles.statItem}
                            activeOpacity={canViewLists ? 0.7 : 1}
                        >
                            <Typography variant="h3" style={styles.statValue}>{stats?.followers || 0}</Typography>
                            <Typography variant="caption" style={styles.statLabel}>Followers</Typography>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity
                            onPress={canViewLists ? onFollowingPress : undefined}
                            style={styles.statItem}
                            activeOpacity={canViewLists ? 0.7 : 1}
                        >
                            <Typography variant="h3" style={styles.statValue}>{stats?.following || 0}</Typography>
                            <Typography variant="caption" style={styles.statLabel}>Following</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Private Content Placeholder */}
                    {!canViewLists ? (
                        <View style={styles.privateContainer}>
                            <Lock color={theme.colors.text.secondary} size={48} />
                            <Typography variant="h3" style={styles.privateText}>This profile is private</Typography>

                            {!isOwner && (
                                <TouchableOpacity
                                    style={[
                                        styles.followButton,
                                        stats?.isFollowing && styles.followingButton,
                                        stats?.isPending && styles.pendingButton
                                    ]}
                                    onPress={stats?.isFollowing ? onUnfollow : (stats?.isPending ? () => { } : onFollow)}
                                    disabled={stats?.isPending}
                                >
                                    <Typography
                                        variant="body"
                                        style={[
                                            styles.followButtonText,
                                            (stats?.isFollowing || stats?.isPending) && styles.followingButtonText
                                        ]}
                                    >
                                        {stats?.isFollowing ? 'Following' : (stats?.isPending ? 'Requested' : 'Follow')}
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <>
                            {!isOwner && (
                                <TouchableOpacity
                                    style={[
                                        styles.followButton,
                                        stats?.isFollowing && styles.followingButton,
                                        stats?.isPending && styles.pendingButton
                                    ]}
                                    onPress={stats?.isFollowing ? onUnfollow : (stats?.isPending ? () => { } : onFollow)}
                                    disabled={stats?.isPending}
                                >
                                    <Typography
                                        variant="body"
                                        style={[
                                            styles.followButtonText,
                                            (stats?.isFollowing || stats?.isPending) && styles.followingButtonText
                                        ]}
                                    >
                                        {stats?.isFollowing ? 'Following' : (stats?.isPending ? 'Requested' : 'Follow')}
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </GlassView>

                {/* Podium Section */}
                {canViewLists && podium.length > 0 && (
                    <View style={{ marginBottom: theme.spacing.l, paddingHorizontal: theme.spacing.m }}>
                        <Typography variant="h3" style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.s, textAlign: 'center' }}>Top 3</Typography>
                        <Podium
                            entries={podium}
                            editable={!!onPodiumPress}
                            onPressSlot={onPodiumPress}
                        />
                    </View>
                )}

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
            </ScrollView>
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
    pendingButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    followingButtonText: {
        color: theme.colors.text.secondary,
    },
});

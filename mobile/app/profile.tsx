import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../src/context/AppContext';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import { theme } from '../src/theme';
import Button from '../src/components/ui/Button';
import PublicProfileView from '../src/features/profile/components/PublicProfileView';

import { relationshipService, FollowStats, PendingRequest } from '../src/services/api/relationshipService';
import { UserCheck, UserX } from 'lucide-react-native';

export default function ProfileScreen() {
    const { profile, lists, session } = useAppContext();
    const [followStats, setFollowStats] = React.useState<FollowStats | null>(null);
    const [requests, setRequests] = React.useState<PendingRequest[]>([]);

    const loadData = () => {
        if (session?.user?.id) {
            relationshipService.getFollowStats(session.user.id)
                .then(setFollowStats)
                .catch(console.error);

            relationshipService.getPendingRequests(session.user.id)
                .then(setRequests)
                .catch(console.error);
        }
    };

    React.useEffect(() => {
        loadData();
    }, [session?.user?.id]);

    const handleAccept = async (requestId: string) => {
        try {
            await relationshipService.acceptRequest(requestId);
            loadData(); // Refresh both requests and stats
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request');
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await relationshipService.declineRequest(requestId);
            loadData();
        } catch (error) {
            console.error('Error declining request:', error);
            alert('Failed to decline request');
        }
    };

    // Filter pinned lists
    const pinnedLists = lists.filter(list => list.isPinned);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <GlassView intensity={50} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={20}
                    >
                        <ArrowLeft color={theme.colors.text.primary} size={24} />
                    </TouchableOpacity>
                    <Typography variant="h3" style={styles.headerTitle}>Profile</Typography>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => router.push('/edit-profile')}
                        hitSlop={20}
                    >
                        <Settings color={theme.colors.text.primary} size={24} />
                    </TouchableOpacity>
                </View>
            </GlassView>

            <ScrollView contentContainerStyle={styles.content}>
                <PublicProfileView
                    profile={profile}
                    lists={pinnedLists}
                    isOwner={true}
                    stats={followStats ? {
                        followers: followStats.followersCount,
                        following: followStats.followingCount,
                        isFollowing: false // Not relevant for owner
                    } : undefined}
                />

                {/* Friend Requests Section */}
                {requests.length > 0 && (
                    <View style={styles.requestsSection}>
                        <Typography variant="h3" style={styles.sectionTitle}>Follow Requests</Typography>
                        {requests.map((req) => (
                            <GlassView key={req.id} intensity={20} style={styles.requestCard}>
                                <View style={styles.requestInfo}>
                                    <LinearGradient
                                        colors={[theme.colors.primary, theme.colors.secondary]}
                                        style={styles.requestAvatar}
                                    >
                                        <Typography variant="h3" style={{ color: '#fff' }}>
                                            {req.follower.username[0].toUpperCase()}
                                        </Typography>
                                    </LinearGradient>
                                    <Typography variant="body" style={styles.requestName}>
                                        {req.follower.username}
                                    </Typography>
                                </View>
                                <View style={styles.requestActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.acceptButton]}
                                        onPress={() => handleAccept(req.id)}
                                    >
                                        <UserCheck color="#fff" size={20} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.declineButton]}
                                        onPress={() => handleDecline(req.id)}
                                    >
                                        <UserX color="#fff" size={20} />
                                    </TouchableOpacity>
                                </View>
                            </GlassView>
                        ))}
                    </View>
                )}

                <Button
                    title="Edit Profile & Settings"
                    onPress={() => router.push('/edit-profile')}
                    variant="outline"
                    style={{ marginTop: theme.spacing.m }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        color: theme.colors.text.primary,
    },
    content: {
        padding: theme.spacing.m,
        paddingTop: theme.spacing.xl,
    },
    requestsSection: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.xs,
    },
    requestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.s,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    requestAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestName: {
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    requestActions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: theme.colors.primary,
    },
    declineButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});

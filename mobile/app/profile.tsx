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

import { relationshipService, FollowStats } from '../src/services/api/relationshipService';
import { podiumService } from '../src/services/api/podiumService';
import Podium from '../src/features/podium/components/Podium';
import { PodiumEntry } from '../src/types';

export default function ProfileScreen() {
    const { profile, lists, session } = useAppContext();
    const [followStats, setFollowStats] = React.useState<FollowStats | null>(null);
    const [podium, setPodium] = React.useState<PodiumEntry[]>([]);

    React.useEffect(() => {
        if (session?.user?.id) {
            // Load Podium
            podiumService.getPodium(session.user.id)
                .then(setPodium)
                .catch(console.error);

            relationshipService.getFollowStats(session.user.id)
                .then(setFollowStats)
                .catch(console.error);
        }
    }, [session?.user?.id]);

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

            <ScrollView contentContainerStyle={styles.content} style={{ flex: 1 }}>
                <PublicProfileView
                    profile={profile}
                    lists={pinnedLists}
                    isOwner={true}
                    stats={followStats ? {
                        followers: followStats.followersCount,
                        following: followStats.followingCount,
                        isFollowing: false,
                        isPending: false
                    } : undefined}
                    onFollowersPress={() => router.push(`/user/${session?.user?.id}/network?type=followers`)}
                    onFollowingPress={() => router.push(`/user/${session?.user?.id}/network?type=following`)}
                    podium={podium}
                    onPodiumPress={(rank) => router.push(`/movie-search?rank=${rank}`)}
                />


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
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../src/theme';
import GlassView from '../../../src/components/ui/GlassView';
import Typography from '../../../src/components/ui/Typography';
import { relationshipService, PendingRequest } from '../../../src/services/api/relationshipService';
import { useAppContext } from '../../../src/context/AppContext';

export default function NetworkScreen() {
    const { id, type } = useLocalSearchParams<{ id: string; type?: 'followers' | 'following' }>();
    const { session } = useAppContext();
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type || 'followers');
    const [users, setUsers] = useState<PendingRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            let data: PendingRequest[] = [];
            if (activeTab === 'followers') {
                data = await relationshipService.getFollowers(id);
            } else {
                data = await relationshipService.getFollowing(id);
            }
            setUsers(data);
        } catch (error) {
            console.error('Error loading network:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, activeTab]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [id, activeTab]);

    const navigateToUser = (userId: string) => {
        if (userId === session?.user?.id) {
            router.push('/profile');
        } else {
            router.push(`/user/${userId}`);
        }
    };

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
                    <Typography variant="h3" style={styles.headerTitle}>Network</Typography>
                    <View style={styles.headerRight} />
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
                        onPress={() => setActiveTab('followers')}
                    >
                        <Typography
                            variant="body"
                            style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}
                        >
                            Followers
                        </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'following' && styles.activeTab]}
                        onPress={() => setActiveTab('following')}
                    >
                        <Typography
                            variant="body"
                            style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}
                        >
                            Following
                        </Typography>
                    </TouchableOpacity>
                </View>
            </GlassView>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                {users.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <Typography variant="body" style={styles.emptyText}>
                            No {activeTab} yet
                        </Typography>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {users.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => navigateToUser(item.follower.id)}
                            >
                                <GlassView intensity={10} style={styles.userCard}>
                                    <View style={styles.userInfo}>
                                        <LinearGradient
                                            colors={[theme.colors.primary, theme.colors.secondary]}
                                            style={styles.avatar}
                                        >
                                            <Typography variant="h3" style={{ color: '#fff' }}>
                                                {item.follower.username[0]?.toUpperCase() || 'U'}
                                            </Typography>
                                        </LinearGradient>
                                        <Typography variant="body" style={styles.username}>
                                            {item.follower.username}
                                        </Typography>
                                    </View>
                                </GlassView>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
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
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    backButton: {
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
    headerRight: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: theme.colors.text.primary,
    },
    content: {
        padding: theme.spacing.m,
        paddingBottom: 40,
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.secondary,
    },
    listContainer: {
        gap: theme.spacing.m,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
});

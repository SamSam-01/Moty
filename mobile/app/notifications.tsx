import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, UserCheck, UserX, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import { relationshipService, PendingRequest } from '../src/services/api/relationshipService';
import { useAppContext } from '../src/context/AppContext';

export default function NotificationsScreen() {
    const { session } = useAppContext();
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [newFollowers, setNewFollowers] = useState<PendingRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!session?.user?.id) return;
        try {
            const [pendingData, followersData] = await Promise.all([
                relationshipService.getPendingRequests(session.user.id),
                relationshipService.getRecentFollowers(session.user.id)
            ]);
            setRequests(pendingData);
            setNewFollowers(followersData);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, [session?.user?.id]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleAccept = async (requestId: string) => {
        try {
            await relationshipService.acceptRequest(requestId);
            loadData();
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
                    <Typography variant="h3" style={styles.headerTitle}>Notifications</Typography>
                    <View style={styles.headerRight} />
                </View>
            </GlassView>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                {requests.length === 0 && newFollowers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Bell color={theme.colors.text.secondary} size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <Typography variant="h3" style={styles.emptyText}>No new notifications</Typography>
                        <Typography variant="body" style={styles.emptySubtext}>
                            You're all caught up!
                        </Typography>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {requests.length > 0 && (
                            <View style={styles.section}>
                                <Typography variant="caption" style={styles.sectionTitle}>Follow Requests</Typography>
                                {requests.map((req) => (
                                    <GlassView key={req.id} intensity={20} style={styles.requestCard}>
                                        <View style={styles.requestInfo}>
                                            <LinearGradient
                                                colors={[theme.colors.primary, theme.colors.secondary]}
                                                style={styles.avatar}
                                            >
                                                <Typography variant="h3" style={{ color: '#fff' }}>
                                                    {req.follower.username[0]?.toUpperCase() || 'U'}
                                                </Typography>
                                            </LinearGradient>
                                            <View>
                                                <Typography variant="body" style={styles.username}>
                                                    {req.follower.username}
                                                </Typography>
                                                <Typography variant="caption" style={styles.actionText}>
                                                    wants to follow you
                                                </Typography>
                                            </View>
                                        </View>
                                        <View style={styles.actions}>
                                            <TouchableOpacity
                                                style={[styles.button, styles.acceptButton]}
                                                onPress={() => handleAccept(req.id)}
                                            >
                                                <UserCheck color="#fff" size={20} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.button, styles.declineButton]}
                                                onPress={() => handleDecline(req.id)}
                                            >
                                                <UserX color="#fff" size={20} />
                                            </TouchableOpacity>
                                        </View>
                                    </GlassView>
                                ))}
                            </View>
                        )}

                        {newFollowers.length > 0 && (
                            <View style={styles.section}>
                                <Typography variant="caption" style={styles.sectionTitle}>New Followers</Typography>
                                {newFollowers.map((req) => (
                                    <GlassView key={req.id} intensity={10} style={styles.requestCard}>
                                        <View style={styles.requestInfo}>
                                            <LinearGradient
                                                colors={[theme.colors.secondary, theme.colors.primary]} // Inverted gradient for visual distinction
                                                style={styles.avatar}
                                            >
                                                <Typography variant="h3" style={{ color: '#fff' }}>
                                                    {req.follower.username[0]?.toUpperCase() || 'U'}
                                                </Typography>
                                            </LinearGradient>
                                            <View>
                                                <Typography variant="body" style={styles.username}>
                                                    {req.follower.username}
                                                </Typography>
                                                <Typography variant="caption" style={styles.actionText}>
                                                    started following you
                                                </Typography>
                                            </View>
                                        </View>
                                    </GlassView>
                                ))}
                            </View>
                        )}
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
    headerTitle: {
        color: theme.colors.text.primary,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.m,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    emptySubtext: {
        color: theme.colors.text.secondary,
    },
    listContainer: {
        marginTop: theme.spacing.m,
        gap: theme.spacing.xl,
    },
    section: {
        gap: theme.spacing.s,
    },
    sectionTitle: {
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    requestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        color: theme.colors.text.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionText: {
        color: theme.colors.text.tertiary,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
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

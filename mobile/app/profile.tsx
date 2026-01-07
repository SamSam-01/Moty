import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Calendar, Key, LogOut, Pin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../src/context/AppContext';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import { theme } from '../src/theme';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';
import { ListCard } from '../src/features/lists';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
    const { session, signOut, profile, updateProfile, lists } = useAppContext();
    const user = session?.user;
    const [isEditing, setIsEditing] = useState(false);

    // Filter pinned lists
    const pinnedLists = lists.filter(list => list.isPinned);
    const [newUsername, setNewUsername] = useState(profile?.username || '');

    useEffect(() => {
        if (profile?.username) {
            setNewUsername(profile.username);
        }
    }, [profile]);

    const handleUpdateUsername = async () => {
        if (newUsername.length < 3) {
            alert('Username must be at least 3 characters');
            return;
        }
        try {
            await updateProfile({ username: newUsername });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update username. It might be taken.');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                    <Typography variant="h3" style={styles.headerTitle}>Profile</Typography>
                    <View style={styles.headerRight} />
                </View>
            </GlassView>

            <ScrollView contentContainerStyle={styles.content}>
                <GlassView intensity={20} style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.avatar}
                        >
                            <Typography variant="h1" style={styles.avatarText}>
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </Typography>
                        </LinearGradient>
                        <Typography variant="h2" style={styles.emailTitle}>
                            {user?.email?.split('@')[0]}
                        </Typography>
                        <Typography variant="body" style={styles.emailSubtitle}>
                            {user?.email}
                        </Typography>
                    </View>

                    <View style={styles.infoSection}>
                        {/* Username */}
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Key color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Username</Typography>
                                {isEditing ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Input
                                            value={newUsername}
                                            onChangeText={setNewUsername}
                                            style={{ flex: 1, marginBottom: 0 }}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity onPress={handleUpdateUsername}>
                                            <Typography variant="body" color={theme.colors.primary}>Save</Typography>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { setIsEditing(false); setNewUsername(profile?.username || ''); }}>
                                            <Typography variant="body" color={theme.colors.error}>Cancel</Typography>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h3" style={styles.value}>
                                            {profile?.username || 'No username set'}
                                        </Typography>
                                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                                            <Typography variant="body" color={theme.colors.primary}>Edit</Typography>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Mail color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Email</Typography>
                                <Typography variant="body" style={styles.value}>{user?.email}</Typography>
                            </View>
                        </View>

                        {/* User ID */}
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Key color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>User ID</Typography>
                                <Typography variant="small" style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                                    {user?.id}
                                </Typography>
                            </View>
                        </View>

                        {/* Last Sign In */}
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Calendar color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Last Sign In</Typography>
                                <Typography variant="body" style={styles.value}>
                                    {formatDate(user?.last_sign_in_at)}
                                </Typography>
                            </View>
                        </View>
                    </View>
                </GlassView>

                {/* Pinned Lists Section */}
                {pinnedLists.length > 0 && (
                    <View style={styles.pinnedSection}>
                        <View style={styles.pinnedHeader}>
                            <Pin color={theme.colors.primary} size={20} style={{ transform: [{ rotate: '45deg' }] }} />
                            <Typography variant="h3" style={styles.sectionTitle}>Pinned Lists</Typography>
                        </View>
                        <View style={styles.pinnedListContainer}>
                            {pinnedLists.map((list, index) => (
                                <ListCard
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    onPress={(id, title) => router.push({ pathname: '/list/[id]', params: { id, title } })}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                    readonly
                                />
                            ))}
                        </View>
                    </View>
                )}

                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    style={styles.signOutButton}
                    icon={<LogOut size={20} color={theme.colors.error} />}
                    textStyle={{ color: theme.colors.error }}
                />

                <Typography variant="small" style={styles.versionText}>
                    Version 1.0.0
                </Typography>
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
        padding: theme.spacing.m,
        paddingTop: theme.spacing.xl,
    },
    profileCard: {
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
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
    emailTitle: {
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    emailSubtitle: {
        color: theme.colors.text.secondary,
    },
    infoSection: {
        gap: theme.spacing.l,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    label: {
        color: theme.colors.text.secondary,
        marginBottom: 2,
    },
    value: {
        color: theme.colors.text.primary,
    },
    signOutButton: {
        borderColor: theme.colors.error,
        marginBottom: theme.spacing.l,
    },
    versionText: {
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        opacity: 0.5,
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
});

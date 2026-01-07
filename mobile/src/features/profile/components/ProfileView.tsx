import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Mail, Calendar, Key, Pin, Lock, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import GlassView from '../../../components/ui/GlassView';
import Typography from '../../../components/ui/Typography';
import { MovieList, UserProfile } from '../../../types';
import { ListCard } from '../../lists';
import Input from '../../../components/ui/Input';

interface ProfileViewProps {
    profile: UserProfile | null;
    email?: string;
    userId: string;
    lastSignInAt?: string;
    isOwner: boolean;
    lists?: MovieList[]; // All lists for owner, public lists for visitor
    onEdit?: () => void;
    onTogglePrivacy?: (isPublic: boolean) => void;
    isEditing?: boolean;
    // Editing props
    newUsername?: string;
    setNewUsername?: (username: string) => void;
    onSaveUsername?: () => void;
    onCancelEdit?: () => void;
}

export default function ProfileView({
    profile,
    email,
    userId,
    lastSignInAt,
    isOwner,
    lists = [],
    onEdit,
    onTogglePrivacy,
    isEditing,
    newUsername,
    setNewUsername,
    onSaveUsername,
    onCancelEdit,
}: ProfileViewProps) {

    // Filter pinned lists - for owner we might show all, but logic asks for pinned to be special
    // For this view, we'll assume `lists` passed in are the ones to display (e.g. pinned ones)
    // Or we can filter here. Let's filter here for consistency if we pass all lists.
    const pinnedLists = lists.filter(list => list.isPinned);

    // Determine if we show details (Public or Owner)
    // If not public and not owner, show "Private Profile"
    const isPublic = profile?.is_public ?? true; // Default to true if undefined
    const canViewDetails = isPublic || isOwner;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!canViewDetails) {
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
                            {profile?.username?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'U'}
                        </Typography>
                    </LinearGradient>
                    <Typography variant="h2" style={styles.usernameTitle}>
                        {profile?.username || 'User'}
                    </Typography>
                    {isOwner && email && (
                        <Typography variant="body" style={styles.emailSubtitle}>
                            {email}
                        </Typography>
                    )}
                </View>

                <View style={styles.infoSection}>
                    {/* Privacy Toggle (Owner Only) */}
                    {isOwner && onTogglePrivacy && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                {isPublic ? <Globe color={theme.colors.primary} size={20} /> : <Lock color={theme.colors.error} size={20} />}
                            </View>
                            <View style={[styles.infoContent, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <View>
                                    <Typography variant="caption" style={styles.label}>Profile Privacy</Typography>
                                    <Typography variant="body" style={styles.value}>{isPublic ? 'Public' : 'Private'}</Typography>
                                </View>
                                <Switch
                                    value={isPublic}
                                    onValueChange={onTogglePrivacy}
                                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primary }}
                                    thumbColor={theme.colors.white}
                                />
                            </View>
                        </View>
                    )}

                    {/* Username */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                            <Key color={theme.colors.text.secondary} size={20} />
                        </View>
                        <View style={styles.infoContent}>
                            <Typography variant="caption" style={styles.label}>Username</Typography>
                            {isOwner && isEditing ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Input
                                        value={newUsername}
                                        onChangeText={setNewUsername}
                                        style={{ flex: 1, marginBottom: 0 }}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={onSaveUsername}>
                                        <Typography variant="body" color={theme.colors.primary}>Save</Typography>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onCancelEdit}>
                                        <Typography variant="body" color={theme.colors.error}>Cancel</Typography>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h3" style={styles.value}>
                                        {profile?.username || 'No username set'}
                                    </Typography>
                                    {isOwner && onEdit && (
                                        <TouchableOpacity onPress={onEdit}>
                                            <Typography variant="body" color={theme.colors.primary}>Edit</Typography>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                            {/* Special handling for Edit mode passed down or handled by parent swapping this view? 
                                Actually, `app/profile.tsx` had inline editing. 
                                To keep this clean, let's just show the display value here. 
                                And let the parent handle the "Edit Mode" UI separate or handle it here.
                                For now, complex editing logic inside a reusable view might be messy.
                                Let's simplify: Owner sees "Edit" button. Clicking it turns simple text into Input.
                            */}
                        </View>
                    </View>

                    {/* Email (Owner Only) */}
                    {isOwner && email && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Mail color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Email</Typography>
                                <Typography variant="body" style={styles.value}>{email}</Typography>
                            </View>
                        </View>
                    )}

                    {/* User ID (Owner Only?? Or Public? Usually Public IDs are fine but maybe keep it owner only for debug) */}
                    {isOwner && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Key color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>User ID</Typography>
                                <Typography variant="small" style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                                    {userId}
                                </Typography>
                            </View>
                        </View>
                    )}

                    {/* Last Sign In (Owner Only) */}
                    {isOwner && lastSignInAt && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Calendar color={theme.colors.text.secondary} size={20} />
                            </View>
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Last Sign In</Typography>
                                <Typography variant="body" style={styles.value}>
                                    {formatDate(lastSignInAt)}
                                </Typography>
                            </View>
                        </View>
                    )}
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
                                onPress={() => { }} // Navigate to list details
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
    usernameTitle: {
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

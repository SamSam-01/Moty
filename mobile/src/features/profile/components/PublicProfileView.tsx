import React from 'react';
import { View, StyleSheet } from 'react-native';
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
}

export default function PublicProfileView({
    profile,
    lists = [],
}: PublicProfileViewProps) {
    const isPublic = profile?.is_public ?? true;

    if (!isPublic) {
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
            </GlassView>

            {/* Pinned Lists Section */}
            {lists.length > 0 && (
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
});

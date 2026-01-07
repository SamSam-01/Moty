import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';
import GlassView from '../../src/components/ui/GlassView';
import Typography from '../../src/components/ui/Typography';
import PublicProfileView from '../../src/features/profile/components/PublicProfileView';
import { profileService } from '../../src/services/api/profileService';
import { UserProfile, MovieList } from '../../src/types';
import { supabase } from '../../src/lib/supabase';

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [lists, setLists] = useState<MovieList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch Profile
            const userProfile = await profileService.getProfile(id);
            setProfile(userProfile);

            // 2. Fetch User's Public/Pinned Lists w/ Supabase directly for now
            // Or create a service method "getPublicLists(userId)"
            // For now, let's just query lists table where user_id = id AND is_pinned = true
            // Assuming "Pinned" implies public for now as per previous task
            // Ideally we stick to service layer.

            const { data, error: listError } = await supabase
                .from('lists')
                .select('*')
                .eq('user_id', id)
                .is('is_pinned', true)
                .order('created_at', { ascending: false });

            if (listError) throw listError;

            const mappedLists: MovieList[] = (data || []).map(item => ({
                id: item.id.toString(),
                title: item.name,
                imageUrl: item.image_url,
                color: item.color,
                filters: item.filters,
                isPinned: item.is_pinned,
                createdAt: new Date(item.created_at).getTime(),
            }));

            setLists(mappedLists);

        } catch (e) {
            console.error('Error loading public profile:', e);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[theme.colors.background, '#1e1b4b']}
                    style={StyleSheet.absoluteFill}
                />
                <GlassView intensity={50} style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            hitSlop={20}
                        >
                            <ArrowLeft color={theme.colors.text.primary} size={24} />
                        </TouchableOpacity>
                        <Typography variant="h3" style={styles.headerTitle}>User Not Found</Typography>
                        <View style={styles.headerRight} />
                    </View>
                </GlassView>
                <View style={styles.center}>
                    <Typography variant="body" style={{ color: theme.colors.text.secondary }}>
                        User not found or profile is hidden.
                    </Typography>
                </View>
            </View>
        );
    }

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
                    <Typography variant="h3" style={styles.headerTitle}>
                        {profile?.username || 'Profile'}
                    </Typography>
                    <View style={styles.headerRight} />
                </View>
            </GlassView>

            <ScrollView contentContainerStyle={styles.content}>
                <PublicProfileView
                    profile={profile}
                    lists={lists}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});

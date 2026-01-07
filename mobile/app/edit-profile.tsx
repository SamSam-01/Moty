import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Calendar, Key, LogOut, Lock, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../src/context/AppContext';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import { theme } from '../src/theme';
import Button from '../src/components/ui/Button';
import Input from '../src/components/ui/Input';

export default function EditProfileScreen() {
    const { session, signOut, profile, updateProfile } = useAppContext();
    const user = session?.user;

    const [username, setUsername] = useState(profile?.username || '');
    const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setIsPublic(profile.is_public ?? true);
        }
    }, [profile]);

    const handleSave = async () => {
        if (username.length < 3) {
            Alert.alert('Error', 'Username must be at least 3 characters');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                username,
                is_public: isPublic
            });
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Username might be taken.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
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
                    <Typography variant="h3" style={styles.headerTitle}>Edit Profile</Typography>
                    <View style={styles.headerRight} />
                </View>
            </GlassView>

            <ScrollView contentContainerStyle={styles.content}>
                <GlassView intensity={20} style={styles.card}>
                    <View style={styles.section}>
                        <Typography variant="h3" style={styles.sectionTitle}>Public Info</Typography>

                        <View style={styles.inputGroup}>
                            <Typography variant="caption" style={styles.label}>Username</Typography>
                            <Input
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter username"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h4" style={styles.rowTitle}>Profile Privacy</Typography>
                                <Typography variant="caption" style={styles.rowSubtitle}>
                                    {isPublic ? 'Everyone can see your pinned lists' : 'Only you can see your profile'}
                                </Typography>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primary }}
                                thumbColor={theme.colors.white}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Typography variant="h3" style={styles.sectionTitle}>Private Info</Typography>

                        <View style={styles.infoRow}>
                            <Mail color={theme.colors.text.secondary} size={20} />
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Email</Typography>
                                <Typography variant="body" style={styles.value}>{user?.email}</Typography>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Key color={theme.colors.text.secondary} size={20} />
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>User ID</Typography>
                                <Typography variant="small" style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                                    {user?.id}
                                </Typography>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Calendar color={theme.colors.text.secondary} size={20} />
                            <View style={styles.infoContent}>
                                <Typography variant="caption" style={styles.label}>Last Sign In</Typography>
                                <Typography variant="body" style={styles.value}>
                                    {formatDate(user?.last_sign_in_at)}
                                </Typography>
                            </View>
                        </View>
                    </View>
                </GlassView>

                <Button
                    title={isLoading ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    disabled={isLoading}
                    style={styles.saveButton}
                />

                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    style={styles.signOutButton}
                    icon={<LogOut size={20} color={theme.colors.error} />}
                    textStyle={{ color: theme.colors.error }}
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
    card: {
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        marginBottom: theme.spacing.xl,
    },
    section: {
        gap: theme.spacing.m,
    },
    sectionTitle: {
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    inputGroup: {
        marginBottom: theme.spacing.s,
    },
    label: {
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.s,
    },
    rowTitle: {
        color: theme.colors.text.primary,
    },
    rowSubtitle: {
        color: theme.colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: theme.spacing.l,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        paddingVertical: theme.spacing.s,
    },
    infoContent: {
        flex: 1,
    },
    value: {
        color: theme.colors.text.primary,
    },
    saveButton: {
        marginBottom: theme.spacing.l,
    },
    signOutButton: {
        borderColor: theme.colors.error,
    },
});

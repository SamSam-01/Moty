import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';
import GlassView from '../src/components/ui/GlassView';
import Typography from '../src/components/ui/Typography';
import Input from '../src/components/ui/Input';
import { profileService } from '../src/services/api/profileService';
import { UserProfile } from '../src/types';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async (text: string) => {
        setIsLoading(true);
        try {
            const users = await profileService.searchUsers(text);
            setResults(users);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: { item: UserProfile }) => (
        <TouchableOpacity
            onPress={() => router.push(`/user/${item.id}`)}
            style={styles.resultItem}
        >
            <GlassView intensity={20} style={styles.resultCard}>
                <View style={styles.avatarPlaceholder}>
                    <User color={theme.colors.text.primary} size={20} />
                </View>
                <View style={styles.userInfo}>
                    <Typography variant="h3" style={styles.username}>{item.username}</Typography>
                    <Typography variant="caption" style={styles.userId}>User</Typography>
                </View>
            </GlassView>
        </TouchableOpacity>
    );

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
                    <Typography variant="h3" style={styles.headerTitle}>Find People</Typography>
                    <View style={styles.headerRight} />
                </View>

                <View style={styles.searchContainer}>
                    <Input
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search by username..."
                        style={styles.searchInput}
                        icon={<Search color={theme.colors.text.secondary} size={20} />}
                    />
                </View>
            </GlassView>

            <View style={styles.content}>
                {isLoading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
                )}

                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query.length >= 2 && !isLoading ? (
                            <Typography variant="body" style={styles.emptyText}>No users found</Typography>
                        ) : null
                    }
                />
            </View>
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
    searchContainer: {
        paddingHorizontal: theme.spacing.m,
    },
    searchInput: {
        marginBottom: 0,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: theme.spacing.m,
    },
    loader: {
        marginTop: theme.spacing.l,
    },
    resultItem: {
        marginBottom: theme.spacing.m,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        gap: theme.spacing.m,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    userId: {
        color: theme.colors.text.secondary,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xl,
    },
});


import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAppContext } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../../theme';
import Typography from '../../../components/ui/Typography';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function Auth() {
    const { createProfile } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        if (!email || !password || !username) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (username.length < 3) {
            Alert.alert('Error', 'Username must be at least 3 characters');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            try {
                // Try creating the profile immediately
                await createProfile(username);
                Alert.alert('Success', 'Account created! Please verify your email if required.');
            } catch (profileError) {
                // If profile creation fails (e.g. username taken), we might want to warn the user
                // but the auth account is created. For now, treat as error.
                const message = profileError instanceof Error ? profileError.message : 'Failed to set username';
                Alert.alert('Error', message);
            }
        }

        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.card}>
                <Typography variant="h1" style={styles.title}>Moty</Typography>
                <Typography variant="body" color={theme.colors.text.secondary} style={styles.subtitle}>
                    Rank your movies
                </Typography>

                <Input
                    label="Email"
                    onChangeText={setEmail}
                    value={email}
                    placeholder="hello@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                {!isLogin && (
                    <Input
                        label="Username"
                        onChangeText={setUsername}
                        value={username}
                        placeholder="Choose a unique username"
                        autoCapitalize="none"
                    />
                )}

                <Input
                    label="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    placeholder="••••••"
                    autoCapitalize="none"
                />

                <Button
                    title={isLogin ? 'Sign In' : 'Sign Up'}
                    onPress={isLogin ? signInWithEmail : signUpWithEmail}
                    loading={loading}
                    style={styles.buttonWrapper}
                />

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                    <Typography variant="body" color={theme.colors.text.secondary}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Typography variant="body" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                            {isLogin ? "Sign Up" : "Sign In"}
                        </Typography>
                    </Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
    },
    title: {
        fontSize: 42,
        color: theme.colors.white,
        marginBottom: theme.spacing.xs,
        letterSpacing: 2,
    },
    subtitle: {
        marginBottom: theme.spacing.xl,
    },
    buttonWrapper: {
        marginTop: theme.spacing.m,
        width: '100%',
    },
    switchButton: {
        marginTop: theme.spacing.l,
        padding: theme.spacing.s,
    },
});

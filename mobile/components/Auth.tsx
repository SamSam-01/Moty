
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import GlassView from './ui/GlassView';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Please check your inbox for email verification!');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.card}>
                <Text style={styles.title}>Moty</Text>
                <Text style={styles.subtitle}>Rank your movies</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="hello@example.com"
                        placeholderTextColor={theme.colors.text.tertiary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="••••••"
                        placeholderTextColor={theme.colors.text.tertiary}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={styles.buttonWrapper}
                    onPress={isLogin ? signInWithEmail : signUpWithEmail}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <View style={styles.button}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                    <Text style={styles.switchText}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Text style={styles.switchTextBold}>{isLogin ? "Sign Up" : "Sign In"}</Text>
                    </Text>
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
        ...theme.typography.h1,
        fontSize: 42, // Larger header
        color: theme.colors.white,
        marginBottom: theme.spacing.xs,
        letterSpacing: 2,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xl,
    },
    inputContainer: {
        width: '100%',
        marginBottom: theme.spacing.m,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: 15,
        color: theme.colors.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonWrapper: {
        width: '100%',
        marginTop: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    button: {
        width: '100%',
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.m,
    },
    buttonText: {
        ...theme.typography.h3,
        color: theme.colors.white,
        fontWeight: '700' as const,
    },
    switchButton: {
        marginTop: theme.spacing.l,
        padding: theme.spacing.s,
    },
    switchText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    switchTextBold: {
        color: theme.colors.primary,
        fontWeight: '700' as const,
    },
});


import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../theme';
import Typography from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    style,
    ...props
}: InputProps) {
    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="caption" color={theme.colors.text.secondary} style={styles.label}>
                    {label}
                </Typography>
            )}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : {},
                    style
                ]}
                placeholderTextColor={theme.colors.text.tertiary}
                {...props}
            />
            {error && (
                <Typography variant="small" color={theme.colors.error} style={styles.error}>
                    {error}
                </Typography>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
        width: '100%',
    },
    label: {
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
    inputError: {
        borderColor: theme.colors.error,
    },
    error: {
        marginTop: 4,
        marginLeft: 4,
    },
});

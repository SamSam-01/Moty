
import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../theme';
import Typography from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    style,
    icon,
    ...props
}: InputProps) {
    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="caption" color={theme.colors.text.secondary} style={styles.label}>
                    {label}
                </Typography>
            )}
            <View style={[styles.inputContainer, error ? styles.inputError : {}, style]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, icon && { paddingLeft: 40 }]}
                    placeholderTextColor={theme.colors.text.tertiary}
                    {...props}
                />
            </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 50,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        color: theme.colors.white,
        fontSize: 16,
    },
    iconContainer: {
        position: 'absolute',
        left: 10,
        zIndex: 1,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    error: {
        marginTop: 4,
        marginLeft: 4,
    },
});

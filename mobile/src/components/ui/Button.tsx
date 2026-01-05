
import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';
import Typography from './Typography';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export default function Button({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}: ButtonProps) {
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.surfaceHighlight;
        switch (variant) {
            case 'primary': return theme.colors.primary;
            case 'secondary': return theme.colors.secondary;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'danger': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.text.tertiary;
        switch (variant) {
            case 'primary': return theme.colors.white;
            case 'secondary': return theme.colors.white;
            case 'outline': return theme.colors.primary;
            case 'ghost': return theme.colors.text.secondary;
            case 'danger': return theme.colors.white;
            default: return theme.colors.white;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: theme.colors.primary };
        return {};
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Typography
                        variant="h3"
                        color={getTextColor()}
                        style={[styles.text, icon ? { marginLeft: 8 } : {}, textStyle]}
                    >
                        {title}
                    </Typography>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: theme.borderRadius.m,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
    },
    text: {
        fontWeight: '700',
    },
});


import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
    color?: string;
    children: React.ReactNode;
}

export default function Typography({
    variant = 'body',
    color = theme.colors.text.primary,
    style,
    children,
    ...props
}: TypographyProps) {
    const textStyle = {
        ...theme.typography[variant],
        color,
    } as TextStyle;

    return (
        <Text style={[textStyle, style]} {...props}>
            {children}
        </Text>
    );
}

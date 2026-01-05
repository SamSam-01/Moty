
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import { theme } from '../../theme';

interface GlassViewProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: BlurViewProps['tint'];
}

export default function GlassView({
    children,
    style,
    intensity = 30,
    tint = 'dark'
}: GlassViewProps) {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 41, 59, 0.4)', // Fallback / Base tint
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    },
});

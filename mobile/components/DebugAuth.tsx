import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugAuth() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>DEBUG: Auth Screen Loaded!</Text>
            <Text style={styles.text}>If you see this, rendering works.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 18,
        marginBottom: 10,
    },
});

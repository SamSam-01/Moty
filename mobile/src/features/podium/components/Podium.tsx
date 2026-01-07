import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { PodiumEntry } from '../../../types';
import PodiumSlot from './PodiumSlot';

interface PodiumProps {
    entries: PodiumEntry[];
    editable?: boolean;
    onPressSlot?: (rank: 1 | 2 | 3) => void;
}

export default function Podium({ entries, editable, onPressSlot }: PodiumProps) {
    const getEntry = (rank: 1 | 2 | 3) => entries.find(e => e.rank === rank);

    return (
        <View style={styles.container}>
            <View style={styles.columns}>
                {/* 2nd Place */}
                <View style={styles.column}>
                    <PodiumSlot
                        rank={2}
                        entry={getEntry(2)}
                        editable={editable}
                        onPress={() => onPressSlot?.(2)}
                    />
                </View>

                {/* 1st Place */}
                <View style={styles.column}>
                    <PodiumSlot
                        rank={1}
                        entry={getEntry(1)}
                        editable={editable}
                        onPress={() => onPressSlot?.(1)}
                    />
                </View>

                {/* 3rd Place */}
                <View style={styles.column}>
                    <PodiumSlot
                        rank={3}
                        entry={getEntry(3)}
                        editable={editable}
                        onPress={() => onPressSlot?.(3)}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.m,
        marginBottom: theme.spacing.xl,
    },
    columns: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end', // Align bottom to simulate podium levels height diff from bottom? 
        // Actually PodiumSlot handles height, let's align bottom so they sit on a line?
        // Layout: 2 (Left), 1 (Center, Higher), 3 (Right)
        // If we align flex-end, smaller ones sit at bottom. 
        // But design wise, maybe centered vertically relative to each other?
        // Let's try alignItems: 'flex-end' and specific margins in Slot.
        gap: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
    },
    column: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
});

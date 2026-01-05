
import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, StyleSheet, ModalProps } from 'react-native';
import { theme } from '../../theme';
import GlassView from './GlassView';
import Typography from './Typography';
import { X } from 'lucide-react-native';

interface CustomModalProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({
    visible,
    onClose,
    title,
    children,
    ...props
}: CustomModalProps) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            {...props}
        >
            <View style={styles.overlay}>
                {/* Backdrop with blur attempt or just dimming */}
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
                    <View style={styles.backdrop} />
                </TouchableOpacity>

                <GlassView style={styles.modalContainer} intensity={40}>
                    {title && (
                        <View style={styles.header}>
                            <Typography variant="h3">{title}</Typography>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X color={theme.colors.text.secondary} size={24} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.content}>
                        {children}
                    </View>
                </GlassView>
            </View>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '100%',
        maxWidth: 500,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: theme.spacing.l,
    },
});

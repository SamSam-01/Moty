
import React from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { theme } from '../../../theme';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';

interface ListFormModalProps {
    visible: boolean;
    title: string;
    value: string;
    imageUrl?: string;
    error: string | null;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onPickImage: () => void;
    isEditing?: boolean;
}

export default function ListFormModal({
    visible,
    title,
    value,
    imageUrl,
    error,
    onChangeText,
    onSubmit,
    onCancel,
    onPickImage,
    isEditing = false,
}: ListFormModalProps) {
    return (
        <Modal
            visible={visible}
            onClose={onCancel}
            title={title}
        >
            <TouchableOpacity
                style={styles.imagePicker}
                onPress={onPickImage}
                activeOpacity={0.8}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholder}>
                        <Typography style={styles.placeholderText}>Tap to add cover</Typography>
                    </View>
                )}
                <View style={styles.imageOverlay}>
                    <Typography variant="small" style={styles.imageEditLabel}>Edit Cover</Typography>
                </View>
            </TouchableOpacity>

            <Input
                label="List Title"
                value={value}
                onChangeText={onChangeText}
                placeholder="e.g., Top 2024 Movies"
                error={error || undefined}
            />

            <Button
                title={isEditing ? 'Update List' : 'Create List'}
                onPress={onSubmit}
                style={styles.submitButton}
                variant="primary"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    imagePicker: {
        height: 150,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.l,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        borderRadius: theme.borderRadius.m,
    },
    placeholderText: {
        color: theme.colors.text.secondary,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        alignItems: 'center',
    },
    imageEditLabel: {
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    submitButton: {
        marginTop: theme.spacing.s,
    },
});

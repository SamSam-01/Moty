
import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { theme } from '../../../theme';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

interface ListFormModalProps {
    visible: boolean;
    title: string;
    value: string;
    error: string | null;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export default function ListFormModal({
    visible,
    title,
    value,
    error,
    onChangeText,
    onSubmit,
    onCancel,
    isEditing = false,
}: ListFormModalProps) {
    return (
        <Modal
            visible={visible}
            onClose={onCancel}
            title={title}
        >
            <View style={styles.formContainer}>
                <Input
                    label="List Title"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="e.g., Top 2024 Movies"
                    error={error || undefined}
                />
            </View>

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
    formContainer: {
        marginBottom: theme.spacing.m,
    },
    submitButton: {
        marginTop: theme.spacing.s,
    },
});

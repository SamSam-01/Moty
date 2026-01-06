
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    ScrollView,
    TextInput,
} from 'react-native';
import { theme } from '../../../theme';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Typography from '../../../components/ui/Typography';

interface MovieFormModalProps {
    visible: boolean;
    title: string;
    value: string;
    notes: string;
    imageUrl?: string;
    error: string | null;
    onChangeTitle: (text: string) => void;
    onChangeNotes: (text: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export default function MovieFormModal({
    visible,
    title,
    value,
    notes,
    imageUrl,
    error,
    onChangeTitle,
    onChangeNotes,
    onSubmit,
    onCancel,
    isEditing = false,
}: MovieFormModalProps) {
    return (
        <Modal
            visible={visible}
            onClose={onCancel}
            title={title}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Only show image if it exists (e.g. from TMDB) */}
                {imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                    </View>
                )}

                <Input
                    label="Movie Title"
                    value={value}
                    onChangeText={onChangeTitle}
                    placeholder="Enter movie title"
                />

                <View style={styles.formGroup}>
                    <Typography variant="caption" color={theme.colors.text.secondary} style={styles.label}>
                        Notes (Optional)
                    </Typography>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={onChangeNotes}
                        placeholder="Why do you like this movie?"
                        placeholderTextColor={theme.colors.text.tertiary}
                        selectionColor={theme.colors.primary}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {error && (
                    <Typography variant="small" color={theme.colors.error} style={styles.errorText}>
                        {error}
                    </Typography>
                )}

                <Button
                    title={isEditing ? 'Update Movie' : 'Add Movie'}
                    onPress={onSubmit}
                    style={styles.submitButton}
                />
                <View style={{ height: 20 }} />
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        height: 180,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        marginBottom: theme.spacing.l,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 120,
        alignSelf: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    formGroup: {
        marginBottom: theme.spacing.m,
        width: '100%',
    },
    label: {
        marginBottom: theme.spacing.xs,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: theme.colors.text.primary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textArea: {
        minHeight: 100,
    },
    errorText: {
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    submitButton: {
        marginTop: theme.spacing.s,
    },
});


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import GlassView from '../ui/GlassView';

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
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <GlassView intensity={40} style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                  <X color={theme.colors.text.secondary} size={24} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.imagePicker}
                onPress={onPickImage}
                activeOpacity={0.8}
              >
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>Tap to add cover</Text>
                  </View>
                )}
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageEditLabel}>Edit Cover</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.formGroup}>
                <Text style={styles.label}>List Title</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChangeText}
                  placeholder="e.g., Top 2024 Movies"
                  placeholderTextColor={theme.colors.text.tertiary}
                  selectionColor={theme.colors.primary}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>
                    {isEditing ? 'Update List' : 'Create List'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.l,
    backgroundColor: 'rgba(30, 41, 59, 0.9)', // Darker background for legibility
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
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
    ...theme.typography.body,
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
    ...theme.typography.small,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    color: theme.colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  submitText: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
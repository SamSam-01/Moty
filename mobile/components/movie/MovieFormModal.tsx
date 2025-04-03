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
  ScrollView,
} from 'react-native';

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
  onPickImage: () => void;
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
  onPickImage,
  isEditing = false,
}: MovieFormModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Keyboard.dismiss();
        onCancel();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{title}</Text>
              
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={onPickImage}
              >
                {imageUrl ? (
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Tap to add movie image</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeTitle}
                placeholder="Enter movie title"
                placeholderTextColor="#a0a0a0"
              />
              
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={onChangeNotes}
                placeholder="Add notes (optional)"
                placeholderTextColor="#a0a0a0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    onCancel();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={onSubmit}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    {isEditing ? 'Update' : 'Add Movie'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  notesInput: {
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    backgroundColor: '#0A84FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonText: {
    color: '#fff',
  },
  errorText: {
    color: '#FF453A',
    marginBottom: 16,
    textAlign: 'center',
  },
  imagePickerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
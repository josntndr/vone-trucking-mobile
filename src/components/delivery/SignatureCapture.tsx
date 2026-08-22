/**
 * Signature Capture Component
 * 
 * React Native signature pad for capturing digital signatures with:
 * - Touch-based signature drawing
 * - Clear/redo functionality
 * - Export as base64 image
 * - Signer name input
 * - Preview before saving
 * - Responsive canvas
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SignatureCanvas from 'react-native-signature-canvas';

interface SignatureCaptureProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureData: string, signerName: string) => void;
  initialSignerName?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  visible,
  onClose,
  onSave,
  initialSignerName = '',
}) => {
  const signatureRef = useRef<any>(null);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  /**
   * Handle signature end (drawing complete)
   */
  const handleSignatureEnd = () => {
    setIsEmpty(false);
    signatureRef.current?.readSignature();
  };

  /**
   * Handle signature data capture
   */
  const handleSignatureOK = (signature: string) => {
    setSignatureData(signature);
  };

  /**
   * Clear signature
   */
  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSignatureData(null);
    setIsEmpty(true);
  };

  /**
   * Save signature
   */
  const handleSave = () => {
    if (!signerName.trim()) {
      Alert.alert('Error', 'Please enter the signer\'s name');
      return;
    }

    if (isEmpty || !signatureData) {
      Alert.alert('Error', 'Please provide a signature');
      return;
    }

    onSave(signatureData, signerName.trim());
    handleClose();
  };

  /**
   * Close modal
   */
  const handleClose = () => {
    handleClear();
    setSignerName(initialSignerName);
    onClose();
  };

  /**
   * Confirm close if signature exists
   */
  const handleConfirmClose = () => {
    if (!isEmpty) {
      Alert.alert(
        'Discard Signature',
        'Are you sure you want to discard this signature?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: handleClose },
        ]
      );
    } else {
      handleClose();
    }
  };

  // Signature canvas style configuration
  const webStyle = `.m-signature-pad {
    box-shadow: none;
    border: none;
    margin: 0;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body,html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleConfirmClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleConfirmClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Signature</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.instructionsText}>
            Sign in the box below using your finger or stylus
          </Text>
        </View>

        {/* Signer Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Signer's Name *</Text>
          <TextInput
            style={styles.input}
            value={signerName}
            onChangeText={setSignerName}
            placeholder="Enter full name"
            autoCapitalize="words"
          />
        </View>

        {/* Signature Canvas */}
        <View style={styles.canvasContainer}>
          <View style={styles.canvasWrapper}>
            <SignatureCanvas
              ref={signatureRef}
              onEnd={handleSignatureEnd}
              onOK={handleSignatureOK}
              webStyle={webStyle}
              autoClear={false}
              descriptionText=""
              backgroundColor="#FFFFFF"
              penColor="#000000"
              minWidth={1}
              maxWidth={3}
            />
            {isEmpty && (
              <View style={styles.canvasPlaceholder}>
                <Ionicons name="create-outline" size={48} color="#D1D5DB" />
                <Text style={styles.canvasPlaceholderText}>
                  Sign here
                </Text>
              </View>
            )}
          </View>
          
          {/* Canvas Border */}
          <View style={styles.canvasBorder} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            disabled={isEmpty}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isEmpty ? '#D1D5DB' : '#EF4444'}
            />
            <Text
              style={[
                styles.clearButtonText,
                isEmpty && styles.clearButtonTextDisabled,
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isEmpty && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isEmpty}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Signature</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            This signature confirms receipt of the delivery items
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    position: 'relative',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  canvasPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  canvasPlaceholderText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginTop: 8,
  },
  canvasBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
  clearButtonTextDisabled: {
    color: '#D1D5DB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
    flex: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  helpSection: {
    padding: 16,
    paddingTop: 0,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

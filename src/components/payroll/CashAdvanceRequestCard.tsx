/**
 * Cash Advance Request Card Component (Employee)
 * 
 * Employee interface for requesting cash advances with amount, purpose,
 * supporting document upload, and eligibility checking.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { CashAdvanceRequest, EligibilityCheck } from '../../types/payroll.types';
import { cashAdvanceManagementService } from '../../services/payroll/CashAdvanceManagementService';

interface CashAdvanceRequestCardProps {
  employeeId: string;
  employeeName: string;
  employmentStartDate: string;
  onRequestSubmitted?: (request: CashAdvanceRequest) => void;
}

export const CashAdvanceRequestCard: React.FC<CashAdvanceRequestCardProps> = ({
  employeeId,
  employeeName,
  employmentStartDate,
  onRequestSubmitted,
}) => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [supportingDocumentUri, setSupportingDocumentUri] = useState<string | null>(null);
  const [supportingDocumentName, setSupportingDocumentName] = useState<string | null>(null);
  const [supportingDocumentType, setSupportingDocumentType] = useState<'image' | 'document' | null>(null);
  
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [balance, setBalance] = useState<{ current_balance: number; active_advances: any[] } | null>(null);
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Load eligibility and balance on mount
   */
  useEffect(() => {
    loadEligibilityAndBalance();
  }, []);

  const loadEligibilityAndBalance = async () => {
    try {
      setIsLoadingEligibility(true);
      
      // Check eligibility with a sample amount
      const eligibilityCheck = await cashAdvanceManagementService.checkEligibility(
        employeeId,
        employmentStartDate,
        1000 // Sample amount for initial check
      );
      setEligibility(eligibilityCheck);

      // Get current balance
      const balanceData = await cashAdvanceManagementService.getEmployeeBalance(employeeId);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load eligibility:', error);
      Alert.alert('Error', 'Failed to load eligibility information');
    } finally {
      setIsLoadingEligibility(false);
    }
  };

  /**
   * Handle amount change and re-check eligibility
   */
  const handleAmountChange = async (value: string) => {
    setAmount(value);
    
    const numAmount = parseFloat(value);
    if (numAmount > 0) {
      try {
        const eligibilityCheck = await cashAdvanceManagementService.checkEligibility(
          employeeId,
          employmentStartDate,
          numAmount
        );
        setEligibility(eligibilityCheck);
      } catch (error) {
        console.error('Failed to check eligibility:', error);
      }
    }
  };

  /**
   * Pick supporting document photo from gallery
   */
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed to upload documents');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSupportingDocumentUri(result.assets[0].uri);
      setSupportingDocumentName(result.assets[0].fileName || 'photo.jpg');
      setSupportingDocumentType('image');
    }
  };

  /**
   * Take supporting document photo with camera
   */
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSupportingDocumentUri(result.assets[0].uri);
      setSupportingDocumentName(result.assets[0].fileName || 'photo.jpg');
      setSupportingDocumentType('image');
    }
  };

  /**
   * Pick document file
   */
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSupportingDocumentUri(result.assets[0].uri);
        setSupportingDocumentName(result.assets[0].name);
        setSupportingDocumentType('document');
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  /**
   * Submit cash advance request
   */
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero');
        return;
      }

      if (!purpose || purpose.trim().length < 10) {
        Alert.alert('Purpose Required', 'Please provide a detailed purpose (minimum 10 characters)');
        return;
      }

      // Check eligibility
      if (!eligibility?.is_eligible) {
        Alert.alert(
          'Not Eligible',
          eligibility?.reasons?.join('\n') || 'You are not eligible for a cash advance at this time'
        );
        return;
      }

      setIsSubmitting(true);

      // Create request
      const request = await cashAdvanceManagementService.createRequest(
        employeeId,
        employeeName,
        parseFloat(amount),
        purpose,
        new Date().toISOString(),
        notes || undefined,
        supportingDocumentUri || undefined
      );

      Alert.alert(
        'Request Submitted',
        `Your cash advance request for $${parseFloat(amount).toFixed(2)} has been submitted for approval.\n\nRepayment will be deducted from your payroll over ${request.repayment_terms.number_of_installments} installments.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onRequestSubmitted) onRequestSubmitted(request);
              clearForm();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to submit cash advance request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Clear form
   */
  const clearForm = () => {
    setAmount('');
    setPurpose('');
    setNotes('');
    setSupportingDocumentUri(null);
    setSupportingDocumentName(null);
    setSupportingDocumentType(null);
    loadEligibilityAndBalance();
  };

  /**
   * Render eligibility status
   */
  const renderEligibilityStatus = () => {
    if (isLoadingEligibility) {
      return (
        <View style={styles.eligibilityCard}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.eligibilityLoadingText}>Checking eligibility...</Text>
        </View>
      );
    }

    if (!eligibility) {
      return null;
    }

    return (
      <View style={[
        styles.eligibilityCard,
        eligibility.is_eligible ? styles.eligibilityEligible : styles.eligibilityNotEligible
      ]}>
        <View style={styles.eligibilityHeader}>
          <Ionicons
            name={eligibility.is_eligible ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={eligibility.is_eligible ? '#10B981' : '#EF4444'}
          />
          <Text style={[
            styles.eligibilityTitle,
            eligibility.is_eligible ? styles.eligibilityTitleEligible : styles.eligibilityTitleNotEligible
          ]}>
            {eligibility.is_eligible ? 'Eligible for Cash Advance' : 'Not Eligible'}
          </Text>
        </View>

        {eligibility.max_eligible_amount && eligibility.is_eligible && (
          <View style={styles.eligibilityDetail}>
            <Text style={styles.eligibilityLabel}>Maximum Amount:</Text>
            <Text style={styles.eligibilityValue}>
              ${eligibility.max_eligible_amount.toFixed(2)}
            </Text>
          </View>
        )}

        {eligibility.reasons && eligibility.reasons.length > 0 && (
          <View style={styles.eligibilityReasons}>
            {eligibility.reasons.map((reason, index) => (
              <View key={index} style={styles.eligibilityReason}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.eligibilityReasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  /**
   * Render current balance
   */
  const renderCurrentBalance = () => {
    if (!balance) {
      return null;
    }

    return (
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={20} color="#1F2937" />
          <Text style={styles.balanceTitle}>Current Cash Advance Balance</Text>
        </View>
        
        <View style={styles.balanceAmount}>
          <Text style={styles.balanceLabel}>Outstanding Balance:</Text>
          <Text style={[
            styles.balanceValue,
            balance.current_balance > 0 ? styles.balanceValueOwed : styles.balanceValueClear
          ]}>
            ${Math.abs(balance.current_balance).toFixed(2)}
          </Text>
        </View>

        {balance.active_advances.length > 0 && (
          <View style={styles.activeAdvances}>
            <Text style={styles.activeAdvancesTitle}>
              Active Advances: {balance.active_advances.length}
            </Text>
            {balance.active_advances.map((advance, index) => (
              <View key={index} style={styles.activeAdvanceItem}>
                <Text style={styles.activeAdvanceAmount}>
                  ${advance.amount.toFixed(2)}
                </Text>
                <Text style={styles.activeAdvanceDate}>
                  {new Date(advance.request_date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cash" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Request Cash Advance</Text>
      </View>

      {/* Eligibility Status */}
      {renderEligibilityStatus()}

      {/* Current Balance */}
      {renderCurrentBalance()}

      {/* Amount */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advance Amount</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount ($) *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              editable={!isSubmitting}
            />
          </View>
          {eligibility?.max_eligible_amount && (
            <Text style={styles.helpText}>
              Maximum eligible amount: ${eligibility.max_eligible_amount.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Purpose */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purpose & Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Purpose *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Please provide a detailed explanation for this cash advance request (minimum 10 characters)..."
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
          />
          <Text style={styles.helpText}>
            {purpose.length}/10 characters minimum
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes or context..."
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>
      </View>

      {/* Supporting Document */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supporting Document</Text>
        <Text style={styles.sectionSubtitle}>
          Optional: Upload any supporting documents (e.g., medical bills, receipts, etc.)
        </Text>
        
        {!supportingDocumentUri ? (
          <View style={styles.documentButtons}>
            <TouchableOpacity 
              style={styles.documentButton} 
              onPress={handleTakePhoto}
              disabled={isSubmitting}
            >
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text style={styles.documentButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.documentButton} 
              onPress={handlePickPhoto}
              disabled={isSubmitting}
            >
              <Ionicons name="images" size={24} color="#3B82F6" />
              <Text style={styles.documentButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.documentButton} 
              onPress={handlePickDocument}
              disabled={isSubmitting}
            >
              <Ionicons name="document" size={24} color="#3B82F6" />
              <Text style={styles.documentButtonText}>Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentPreview}>
            {supportingDocumentType === 'image' ? (
              <Image source={{ uri: supportingDocumentUri }} style={styles.documentImage} />
            ) : (
              <View style={styles.documentFile}>
                <Ionicons name="document-text" size={48} color="#6B7280" />
                <Text style={styles.documentFileName}>{supportingDocumentName}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.documentRemove}
              onPress={() => {
                setSupportingDocumentUri(null);
                setSupportingDocumentName(null);
                setSupportingDocumentType(null);
              }}
              disabled={isSubmitting}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Repayment Information */}
      {amount && parseFloat(amount) > 0 && eligibility?.is_eligible && (
        <View style={styles.section}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>Repayment Information</Text>
          </View>
          <Text style={styles.infoText}>
            If approved, this advance will be automatically deducted from your future payroll.
          </Text>
          <Text style={styles.infoText}>
            • Repayment will be spread over multiple pay periods
          </Text>
          <Text style={styles.infoText}>
            • Deductions will not exceed the maximum allowed percentage of your pay
          </Text>
          <Text style={styles.infoText}>
            • Your net pay will always meet the minimum required amount
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!eligibility?.is_eligible || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!eligibility?.is_eligible || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>

        {!eligibility?.is_eligible && !isLoadingEligibility && (
          <Text style={styles.submitDisabledText}>
            You must be eligible to submit a cash advance request
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  
  // Eligibility Status
  eligibilityCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  eligibilityEligible: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  eligibilityNotEligible: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eligibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  eligibilityTitleEligible: {
    color: '#065F46',
  },
  eligibilityTitleNotEligible: {
    color: '#991B1B',
  },
  eligibilityLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  eligibilityDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  eligibilityLabel: {
    fontSize: 14,
    color: '#374151',
  },
  eligibilityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  eligibilityReasons: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  eligibilityReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  eligibilityReasonText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  balanceAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  balanceValueOwed: {
    color: '#EF4444',
  },
  balanceValueClear: {
    color: '#10B981',
  },
  activeAdvances: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  activeAdvancesTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  activeAdvanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeAdvanceAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activeAdvanceDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    paddingLeft: 12,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // Documents
  documentButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  documentButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  documentButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 6,
    textAlign: 'center',
  },
  documentPreview: {
    position: 'relative',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  documentFile: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: '100%',
  },
  documentFileName: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  documentRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },

  // Info Section
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 6,
    lineHeight: 18,
  },

  // Actions
  actions: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitDisabledText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

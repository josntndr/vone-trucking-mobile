/**
 * Fuel Budget Calculator Card Component
 * 
 * Operator interface for generating fuel budget estimates,
 * reviewing calculations, making adjustments, and approving budgets.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  FuelBudgetInput,
  FuelBudgetCalculation,
  FuelBudgetAdjustment,
} from '../../types/fuel.types';
import { fuelBudgetCalculator } from '../../services/fuel/FuelBudgetCalculator';

interface FuelBudgetCalculatorCardProps {
  tripId: string;
  truckId: string;
  origin: string;
  destination: string;
  routeDistanceKm?: number;
  truckEfficiencyKmpl?: number;
  onCalculated?: (calculation: FuelBudgetCalculation) => void;
  onApproved?: (calculation: FuelBudgetCalculation) => void;
  operatorId: string;
}

export const FuelBudgetCalculatorCard: React.FC<FuelBudgetCalculatorCardProps> = ({
  tripId,
  truckId,
  origin,
  destination,
  routeDistanceKm = 0,
  truckEfficiencyKmpl = 5.0,
  onCalculated,
  onApproved,
  operatorId,
}) => {
  // Form state
  const [distance, setDistance] = useState(routeDistanceKm.toString());
  const [returnDistance, setReturnDistance] = useState('');
  const [numberOfTrips, setNumberOfTrips] = useState('1');
  const [efficiency, setEfficiency] = useState(truckEfficiencyKmpl.toString());
  const [fuelPrice, setFuelPrice] = useState('1.50');
  const [trafficAllowance, setTrafficAllowance] = useState('10');
  const [idlingAllowance, setIdlingAllowance] = useState('5');

  // Calculation state
  const [calculation, setCalculation] = useState<FuelBudgetCalculation | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Adjustment state
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Release state
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  /**
   * Generate fuel budget calculation
   */
  const handleGenerate = () => {
    try {
      const input: FuelBudgetInput = {
        trip_id: tripId,
        origin,
        destination,
        route_distance_km: parseFloat(distance),
        return_distance_km: returnDistance ? parseFloat(returnDistance) : undefined,
        number_of_trips: parseInt(numberOfTrips, 10),
        truck_id: truckId,
        truck_efficiency_kmpl: parseFloat(efficiency),
        current_fuel_price: parseFloat(fuelPrice),
        traffic_allowance_percent: parseFloat(trafficAllowance),
        idling_allowance_percent: parseFloat(idlingAllowance),
      };

      const newCalculation = fuelBudgetCalculator.calculate(input);
      setCalculation(newCalculation);
      setShowBreakdown(true);

      if (onCalculated) {
        onCalculated(newCalculation);
      }
    } catch (error) {
      Alert.alert(
        'Calculation Error',
        error instanceof Error ? error.message : 'Invalid input values'
      );
    }
  };

  /**
   * Add operator adjustment
   */
  const handleAddAdjustment = () => {
    if (!calculation) return;

    try {
      const amount = parseFloat(adjustmentAmount);
      
      if (!adjustmentReason || adjustmentReason.trim().length < 10) {
        Alert.alert('Error', 'Please provide a detailed reason (at least 10 characters)');
        return;
      }

      const updated = fuelBudgetCalculator.addAdjustment(
        calculation,
        adjustmentType,
        amount,
        adjustmentReason,
        operatorId
      );

      setCalculation(updated);
      setShowAdjustmentForm(false);
      setAdjustmentAmount('');
      setAdjustmentReason('');
    } catch (error) {
      Alert.alert(
        'Adjustment Error',
        error instanceof Error ? error.message : 'Failed to add adjustment'
      );
    }
  };

  /**
   * Remove adjustment
   */
  const handleRemoveAdjustment = (index: number) => {
    if (!calculation) return;

    try {
      const updated = fuelBudgetCalculator.removeAdjustment(calculation, index);
      setCalculation(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove adjustment');
    }
  };

  /**
   * Review calculation
   */
  const handleReview = () => {
    if (!calculation) return;

    try {
      const reviewed = fuelBudgetCalculator.markAsReviewed(calculation, operatorId);
      setCalculation(reviewed);
      Alert.alert('Success', 'Budget marked as reviewed');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Review failed');
    }
  };

  /**
   * Approve calculation
   */
  const handleApprove = () => {
    if (!calculation) return;

    Alert.alert(
      'Approve Budget',
      `Approve fuel budget of $${calculation.final_budget_amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            try {
              const approved = fuelBudgetCalculator.approve(calculation, operatorId);
              setCalculation(approved);
              
              if (onApproved) {
                onApproved(approved);
              }

              Alert.alert('Success', 'Budget approved successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Approval failed');
            }
          },
        },
      ]
    );
  };

  /**
   * Record amount released
   */
  const handleRelease = () => {
    if (!calculation) return;

    try {
      const amount = parseFloat(releaseAmount);
      
      const released = fuelBudgetCalculator.recordRelease(
        calculation,
        amount,
        operatorId,
        releaseNotes || undefined
      );

      setCalculation(released);
      setShowReleaseForm(false);
      setReleaseAmount('');
      setReleaseNotes('');

      Alert.alert('Success', `$${amount.toFixed(2)} released to driver`);
    } catch (error) {
      Alert.alert(
        'Release Error',
        error instanceof Error ? error.message : 'Failed to record release'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calculator" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Fuel Budget Calculator</Text>
      </View>

      {/* Route Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route Information</Text>
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            <Text style={styles.label}>Origin:</Text> {origin}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#6B7280" />
          <Text style={styles.routeText}>
            <Text style={styles.label}>Destination:</Text> {destination}
          </Text>
        </View>
      </View>

      {/* Input Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distance & Efficiency</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Route Distance (km)</Text>
          <TextInput
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Return Distance (km) - Optional</Text>
          <TextInput
            style={styles.input}
            value={returnDistance}
            onChangeText={setReturnDistance}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Number of Trips</Text>
          <TextInput
            style={styles.input}
            value={numberOfTrips}
            onChangeText={setNumberOfTrips}
            keyboardType="number-pad"
            placeholder="1"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Truck Efficiency (km/L)</Text>
          <TextInput
            style={styles.input}
            value={efficiency}
            onChangeText={setEfficiency}
            keyboardType="decimal-pad"
            placeholder="5.0"
          />
        </View>
      </View>

      {/* Fuel Price & Allowances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fuel Price & Allowances</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Current Fuel Price ($/L)</Text>
          <TextInput
            style={styles.input}
            value={fuelPrice}
            onChangeText={setFuelPrice}
            keyboardType="decimal-pad"
            placeholder="1.50"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Traffic Allowance (%)</Text>
          <TextInput
            style={styles.input}
            value={trafficAllowance}
            onChangeText={setTrafficAllowance}
            keyboardType="decimal-pad"
            placeholder="10"
          />
          <Text style={styles.helpText}>
            Additional fuel for traffic congestion
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Idling Allowance (%)</Text>
          <TextInput
            style={styles.input}
            value={idlingAllowance}
            onChangeText={setIdlingAllowance}
            keyboardType="decimal-pad"
            placeholder="5"
          />
          <Text style={styles.helpText}>
            Additional fuel for idling time
          </Text>
        </View>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerate}
        accessibilityRole="button"
        accessibilityLabel="Generate fuel budget"
      >
        <Ionicons name="calculator-outline" size={20} color="#FFFFFF" />
        <Text style={styles.generateButtonText}>Generate Estimate</Text>
      </TouchableOpacity>

      {/* Calculation Result */}
      {calculation && (
        <>
          {/* Summary */}
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Calculation Result</Text>
              <TouchableOpacity
                onPress={() => setShowBreakdown(!showBreakdown)}
                style={styles.breakdownToggle}
              >
                <Text style={styles.breakdownToggleText}>
                  {showBreakdown ? 'Hide' : 'Show'} Breakdown
                </Text>
                <Ionicons
                  name={showBreakdown ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#3B82F6"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.resultSummary}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Estimated Litres:</Text>
                <Text style={styles.resultValue}>
                  {calculation.estimated_litres.toFixed(2)} L
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Estimated Cost:</Text>
                <Text style={styles.resultValue}>
                  ${calculation.estimated_fuel_cost.toFixed(2)}
                </Text>
              </View>
              {calculation.adjustments.length > 0 && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Final Budget:</Text>
                  <Text style={[styles.resultValue, styles.finalBudget]}>
                    ${calculation.final_budget_amount.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {calculation.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Breakdown */}
          {showBreakdown && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Calculation Breakdown</Text>
              {fuelBudgetCalculator.getCalculationBreakdown(calculation).map((item, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>{item.formatted}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Adjustments */}
          {calculation.adjustments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operator Adjustments</Text>
              {calculation.adjustments.map((adj, index) => (
                <View key={index} style={styles.adjustmentItem}>
                  <View style={styles.adjustmentHeader}>
                    <Text style={styles.adjustmentType}>
                      {adj.adjustment_type === 'increase' ? '+' : '-'}$
                      {adj.adjustment_amount.toFixed(2)}
                    </Text>
                    {calculation.status === 'draft' && (
                      <TouchableOpacity onPress={() => handleRemoveAdjustment(index)}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.adjustmentReason}>{adj.adjustment_reason}</Text>
                  <Text style={styles.adjustmentMeta}>
                    By: {adj.adjusted_by} • {new Date(adj.adjusted_at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Add Adjustment Button */}
          {calculation.status !== 'approved' && !showAdjustmentForm && (
            <TouchableOpacity
              style={styles.addAdjustmentButton}
              onPress={() => setShowAdjustmentForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.addAdjustmentButtonText}>Add Adjustment</Text>
            </TouchableOpacity>
          )}

          {/* Adjustment Form */}
          {showAdjustmentForm && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Adjustment</Text>

              <View style={styles.adjustmentTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.adjustmentTypeButton,
                    adjustmentType === 'increase' && styles.adjustmentTypeButtonActive,
                  ]}
                  onPress={() => setAdjustmentType('increase')}
                >
                  <Text
                    style={[
                      styles.adjustmentTypeButtonText,
                      adjustmentType === 'increase' && styles.adjustmentTypeButtonTextActive,
                    ]}
                  >
                    Increase
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.adjustmentTypeButton,
                    adjustmentType === 'decrease' && styles.adjustmentTypeButtonActive,
                  ]}
                  onPress={() => setAdjustmentType('decrease')}
                >
                  <Text
                    style={[
                      styles.adjustmentTypeButtonText,
                      adjustmentType === 'decrease' && styles.adjustmentTypeButtonTextActive,
                    ]}
                  >
                    Decrease
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  value={adjustmentAmount}
                  onChangeText={setAdjustmentAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason (required)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={adjustmentReason}
                  onChangeText={setAdjustmentReason}
                  placeholder="Explain the reason for this adjustment..."
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.helpText}>
                  Minimum 10 characters required
                </Text>
              </View>

              <View style={styles.adjustmentFormButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAdjustmentForm(false);
                    setAdjustmentAmount('');
                    setAdjustmentReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddAdjustment}
                >
                  <Text style={styles.confirmButtonText}>Add Adjustment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {calculation.status === 'draft' && (
              <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
                <Text style={styles.reviewButtonText}>Mark as Reviewed</Text>
              </TouchableOpacity>
            )}

            {(calculation.status === 'reviewed' || calculation.status === 'draft') && (
              <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve Budget</Text>
              </TouchableOpacity>
            )}

            {calculation.status === 'approved' && !calculation.amount_released && (
              <>
                {!showReleaseForm && (
                  <TouchableOpacity
                    style={styles.releaseButton}
                    onPress={() => {
                      setReleaseAmount(calculation.final_budget_amount.toFixed(2));
                      setShowReleaseForm(true);
                    }}
                  >
                    <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.releaseButtonText}>Record Amount Released</Text>
                  </TouchableOpacity>
                )}

                {showReleaseForm && (
                  <View style={styles.releaseForm}>
                    <Text style={styles.sectionTitle}>Record Release</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Amount Released ($)</Text>
                      <TextInput
                        style={styles.input}
                        value={releaseAmount}
                        onChangeText={setReleaseAmount}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Notes (optional)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={releaseNotes}
                        onChangeText={setReleaseNotes}
                        placeholder="Any notes about the release..."
                        multiline
                        numberOfLines={2}
                      />
                    </View>

                    <View style={styles.adjustmentFormButtons}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setShowReleaseForm(false);
                          setReleaseAmount('');
                          setReleaseNotes('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleRelease}
                      >
                        <Text style={styles.confirmButtonText}>Confirm Release</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {calculation.amount_released && (
              <View style={styles.releasedInfo}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.releasedText}>
                  ${calculation.amount_released.toFixed(2)} released to driver
                </Text>
              </View>
            )}
          </View>
        </>
      )}
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
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  label: {
    fontWeight: '600',
    color: '#6B7280',
  },
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
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownToggleText: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 4,
  },
  resultSummary: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  finalBudget: {
    fontSize: 16,
    color: '#3B82F6',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  adjustmentItem: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  adjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  adjustmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  adjustmentReason: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 6,
  },
  adjustmentMeta: {
    fontSize: 12,
    color: '#92400E',
  },
  addAdjustmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  addAdjustmentButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  adjustmentTypeButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  adjustmentTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 6,
  },
  adjustmentTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  adjustmentTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  adjustmentTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  adjustmentFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  reviewButton: {
    padding: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  approveButton: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#10B981',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  releaseButton: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  releaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  releaseForm: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  releasedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  releasedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
});

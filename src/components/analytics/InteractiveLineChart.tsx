// @ts-nocheck - TODO: Fix type errors
/**
 * Interactive Line Chart Component
 * Fully interactive chart with tooltips, gestures, and period selection
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface DataPoint {
  label: string;
  value: number;
  fullLabel?: string;
}

interface ChartData {
  thisWeek: DataPoint[];
  lastWeek: DataPoint[];
  thisMonth?: DataPoint[];
  lastMonth?: DataPoint[];
  thisYear?: DataPoint[];
  lastYear?: DataPoint[];
}

interface InteractiveLineChartProps {
  data: ChartData;
  width: number;
  height: number;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

// Data for different periods
const PERIOD_DATA = {
  week: {
    current: [
      { label: 'Mon', value: 19, fullLabel: 'Monday' },
      { label: 'Tue', value: 21, fullLabel: 'Tuesday' },
      { label: 'Wed', value: 18, fullLabel: 'Wednesday' },
      { label: 'Thu', value: 24, fullLabel: 'Thursday' },
      { label: 'Fri', value: 22, fullLabel: 'Friday' },
      { label: 'Sat', value: 26, fullLabel: 'Saturday' },
      { label: 'Sun', value: 19, fullLabel: 'Sunday' },
    ],
    previous: [
      { label: 'Mon', value: 15, fullLabel: 'Monday' },
      { label: 'Tue', value: 18, fullLabel: 'Tuesday' },
      { label: 'Wed', value: 16, fullLabel: 'Wednesday' },
      { label: 'Thu', value: 20, fullLabel: 'Thursday' },
      { label: 'Fri', value: 19, fullLabel: 'Friday' },
      { label: 'Sat', value: 22, fullLabel: 'Saturday' },
      { label: 'Sun', value: 17, fullLabel: 'Sunday' },
    ],
  },
  month: {
    current: [
      { label: 'Jan', value: 380, fullLabel: 'January' },
      { label: 'Feb', value: 410, fullLabel: 'February' },
      { label: 'Mar', value: 395, fullLabel: 'March' },
      { label: 'Apr', value: 430, fullLabel: 'April' },
      { label: 'May', value: 450, fullLabel: 'May' },
      { label: 'Jun', value: 420, fullLabel: 'June' },
      { label: 'Jul', value: 460, fullLabel: 'July' },
      { label: 'Aug', value: 440, fullLabel: 'August' },
      { label: 'Sep', value: 415, fullLabel: 'September' },
      { label: 'Oct', value: 470, fullLabel: 'October' },
      { label: 'Nov', value: 390, fullLabel: 'November' },
      { label: 'Dec', value: 405, fullLabel: 'December' },
    ],
    previous: [
      { label: 'Jan', value: 340, fullLabel: 'January' },
      { label: 'Feb', value: 370, fullLabel: 'February' },
      { label: 'Mar', value: 355, fullLabel: 'March' },
      { label: 'Apr', value: 390, fullLabel: 'April' },
      { label: 'May', value: 410, fullLabel: 'May' },
      { label: 'Jun', value: 380, fullLabel: 'June' },
      { label: 'Jul', value: 420, fullLabel: 'July' },
      { label: 'Aug', value: 400, fullLabel: 'August' },
      { label: 'Sep', value: 375, fullLabel: 'September' },
      { label: 'Oct', value: 430, fullLabel: 'October' },
      { label: 'Nov', value: 350, fullLabel: 'November' },
      { label: 'Dec', value: 365, fullLabel: 'December' },
    ],
  },
  year: {
    current: [
      { label: '2024', value: 3200, fullLabel: '2024' },
      { label: '2025', value: 4100, fullLabel: '2025' },
      { label: '2026', value: 4800, fullLabel: '2026' },
      { label: '2027', value: 5200, fullLabel: '2027' },
      { label: '2028', value: 5600, fullLabel: '2028' },
      { label: '2029', value: 6000, fullLabel: '2029' },
    ],
    previous: [
      { label: '2023', value: 2800, fullLabel: '2023' },
      { label: '2024', value: 3600, fullLabel: '2024' },
      { label: '2025', value: 4200, fullLabel: '2025' },
      { label: '2026', value: 4600, fullLabel: '2026' },
      { label: '2027', value: 5000, fullLabel: '2027' },
      { label: '2028', value: 5400, fullLabel: '2028' },
    ],
  },
};

const COLORS = {
  primary: '#3A7D8C',
  secondary: '#9E9E9E',
  background: '#FFFCF8',
  navy: '#1B2A4A',
  white: '#FFFFFF',
  success: '#4F7A5E',
  error: '#C74C47',
  border: '#E0E0E0',
};

export default function InteractiveLineChart({
  data,
  width,
  height,
  onPeriodChange,
}: InteractiveLineChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showLastWeek, setShowLastWeek] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  const lineAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const pointScale = useRef(new Animated.Value(1)).current;

  const chartPadding = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartWidth = width - chartPadding.left - chartPadding.right;
  const chartHeight = height - chartPadding.top - chartPadding.bottom;

  // Get current period data
  const getCurrentData = () => {
    switch (period) {
      case 'week':
        return PERIOD_DATA.week.current;
      case 'month':
        return PERIOD_DATA.month.current;
      case 'year':
        return PERIOD_DATA.year.current;
      default:
        return PERIOD_DATA.week.current;
    }
  };

  const getPreviousData = () => {
    switch (period) {
      case 'week':
        return PERIOD_DATA.week.previous;
      case 'month':
        return PERIOD_DATA.month.previous;
      case 'year':
        return PERIOD_DATA.year.previous;
      default:
        return PERIOD_DATA.week.previous;
    }
  };

  const currentData = getCurrentData();
  const previousData = getPreviousData();

  // Calculate scales with auto-scaling Y-axis
  const maxValue = Math.max(
    ...currentData.map(d => d.value),
    ...(showLastWeek ? previousData.map(d => d.value) : [])
  );
  const minValue = Math.min(
    ...currentData.map(d => d.value),
    ...(showLastWeek ? previousData.map(d => d.value) : [])
  );
  
  // Round up to nearest nice number
  const yMax = Math.ceil(maxValue * 1.1 / 10) * 10;
  const yMin = 0;
  const yRange = yMax - yMin;
  
  const xScale = chartWidth / (currentData.length - 1);

  // Generate Y-axis grid values
  const getYAxisValues = () => {
    const stepCount = 5;
    const step = yRange / (stepCount - 1);
    return Array.from({ length: stepCount }, (_, i) => Math.round(yMin + step * i));
  };

  const yAxisValues = getYAxisValues();

  // Generate path data
  const getPathData = (dataPoints: DataPoint[]) => {
    let path = '';
    dataPoints.forEach((point, index) => {
      const x = chartPadding.left + index * xScale;
      const y = chartPadding.top + (chartHeight - ((point.value - yMin) / yRange) * chartHeight);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Bezier curve for smooth line
        const prevX = chartPadding.left + (index - 1) * xScale;
        const prevY = chartPadding.top + (chartHeight - ((dataPoints[index - 1].value - yMin) / yRange) * chartHeight);
        const cpX = (prevX + x) / 2;
        path += ` Q ${cpX} ${prevY}, ${x} ${y}`;
      }
    });
    return path;
  };

  // Generate gradient path (area under curve)
  const getGradientPath = (dataPoints: DataPoint[]) => {
    let path = getPathData(dataPoints);
    const lastX = chartPadding.left + (dataPoints.length - 1) * xScale;
    const baseY = chartPadding.top + chartHeight;
    path += ` L ${lastX} ${baseY} L ${chartPadding.left} ${baseY} Z`;
    return path;
  };

  // Pan responder for drag interaction
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        // Keep tooltip visible
      },
    })
  ).current;

  const handleTouch = (touchX: number) => {
    const adjustedX = touchX - chartPadding.left;
    if (adjustedX < 0 || adjustedX > chartWidth) return;

    const index = Math.round(adjustedX / xScale);
    if (index >= 0 && index < currentData.length) {
      setSelectedIndex(index);
      
      // Animate point scale
      Animated.sequence([
        Animated.timing(pointScale, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pointScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Initial load animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate statistics
  const calculateAverage = () => {
    const sum = currentData.reduce((acc, point) => acc + point.value, 0);
    return (sum / currentData.length).toFixed(1);
  };

  const calculateTotal = () => {
    return currentData.reduce((acc, point) => acc + point.value, 0);
  };

  const getChangeFromPrevious = (index: number) => {
    if (index === 0) return null;
    const current = currentData[index].value;
    const previous = currentData[index - 1].value;
    const change = current - previous;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
      label: change >= 0 ? `+${change} from ${currentData[index - 1].label}` : `${change} from ${currentData[index - 1].label}`,
    };
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return { current: 'This Week', previous: 'Last Week' };
      case 'month':
        return { current: 'This Month', previous: 'Last Month' };
      case 'year':
        return { current: 'Recent Years', previous: 'Earlier Years' };
      default:
        return { current: 'This Week', previous: 'Last Week' };
    }
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
    setPeriod(newPeriod);
    setSelectedIndex(null);
    onPeriodChange?.(newPeriod);
    
    // Reset and replay animation
    lineAnimation.setValue(0);
    fadeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => handlePeriodChange(p)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Area */}
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Y-axis grid lines */}
          {yAxisValues.map((value, index) => {
            const y = chartPadding.top + (chartHeight - ((value - yMin) / yRange) * chartHeight);
            return (
              <G key={index}>
                <Line
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartPadding.left + chartWidth}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth="1"
                />
                <SvgText
                  x={chartPadding.left - 8}
                  y={y + 4}
                  fontSize="10"
                  fill={COLORS.secondary}
                  textAnchor="end"
                >
                  {value}
                </SvgText>
              </G>
            );
          })}

          {/* Gradient fill */}
          <Path
            d={getGradientPath(currentData)}
            fill="url(#gradient)"
            opacity={fadeAnimation}
          />

          {/* Last week line (dashed grey) */}
          {showLastWeek && (
            <Path
              d={getPathData(previousData)}
              stroke={COLORS.secondary}
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          )}

          {/* This week line */}
          <Path
            d={getPathData(currentData)}
            stroke={COLORS.primary}
            strokeWidth="2"
            fill="none"
            opacity={lineAnimation}
          />

          {/* Data points */}
          {currentData.map((point, index) => {
            const x = chartPadding.left + index * xScale;
            const y = chartPadding.top + (chartHeight - ((point.value - yMin) / yRange) * chartHeight);
            const isSelected = selectedIndex === index;

            return (
              <G key={index}>
                {isSelected && (
                  <>
                    {/* Vertical dashed line */}
                    <Line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={chartPadding.top + chartHeight}
                      stroke={COLORS.secondary}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    {/* White ring */}
                    <Circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={COLORS.white}
                      stroke={COLORS.primary}
                      strokeWidth="2"
                    />
                  </>
                )}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "5" : "4"}
                  fill={COLORS.primary}
                />
              </G>
            );
          })}

          {/* X-axis labels */}
          {currentData.map((point, index) => {
            const x = chartPadding.left + index * xScale;
            const y = chartPadding.top + chartHeight + 20;
            const isSelected = selectedIndex === index;

            return (
              <SvgText
                key={index}
                x={x}
                y={y}
                fontSize="9"
                fill={isSelected ? COLORS.primary : COLORS.secondary}
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            );
          })}
        </Svg>

        {/* Tooltip */}
        {selectedIndex !== null && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(10, Math.min(width - 130, chartPadding.left + selectedIndex * xScale - 60)),
                top: chartPadding.top + (chartHeight - ((currentData[selectedIndex].value - yMin) / yRange) * chartHeight) - 80,
              },
            ]}
          >
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipDay}>
                {currentData[selectedIndex].fullLabel || currentData[selectedIndex].label}
              </Text>
              <Text style={styles.tooltipValue}>
                {currentData[selectedIndex].value} trips
              </Text>
              {getChangeFromPrevious(selectedIndex) && (
                <Text
                  style={[
                    styles.tooltipChange,
                    { color: getChangeFromPrevious(selectedIndex)!.isPositive ? COLORS.success : COLORS.error },
                  ]}
                >
                  {getChangeFromPrevious(selectedIndex)!.label}
                </Text>
              )}
            </View>
            <View style={styles.tooltipArrow} />
          </View>
        )}
      </View>

      {/* Legend & Stats */}
      <View style={styles.legendContainer}>
        <TouchableOpacity
          style={[styles.legendChip, styles.legendChipOutlined]}
          onPress={() => {}}
          activeOpacity={1}
        >
          <View style={styles.legendLine} />
          <Text style={styles.legendText}>{getPeriodLabel().current}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.legendChip,
            showLastWeek ? styles.legendChipActive : styles.legendChipOutlined,
          ]}
          onPress={() => setShowLastWeek(!showLastWeek)}
          activeOpacity={0.7}
        >
          <View style={[styles.legendLine, { backgroundColor: COLORS.secondary }]} />
          <Text style={[styles.legendText, showLastWeek && { color: COLORS.secondary }]}>
            {getPeriodLabel().previous}
          </Text>
        </TouchableOpacity>

        <View style={[styles.legendChip, styles.legendChipOutlined]}>
          <Text style={styles.legendTextSmall}>
            Average: <Text style={styles.legendTextBold}>{calculateAverage()}</Text>
          </Text>
        </View>

        <View style={[styles.legendChip, styles.legendChipOutlined]}>
          <Text style={[styles.legendText, { color: COLORS.primary, fontWeight: '600' }]}>
            Total: {calculateTotal()} trips
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  periodButtonActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  chartContainer: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    width: 120,
    zIndex: 10,
  },
  tooltipContent: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.navy,
    alignSelf: 'center',
  },
  tooltipDay: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  tooltipChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  legendChipOutlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legendChipActive: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary + '15',
  },
  legendLine: {
    width: 12,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  legendTextSmall: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  legendTextBold: {
    fontWeight: '700',
    color: COLORS.navy,
  },
});

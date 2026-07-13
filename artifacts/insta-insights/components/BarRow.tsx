import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditableText } from '@/components/EditableText';
import { useColors } from '@/hooks/useColors';

interface BarRowProps {
  label: string;
  pct: number;
  color: string;
  onChangeLabel?: (next: string) => void;
  onChangeValue?: (next: string) => void;
  testID?: string;
}

export function BarRow({
  label,
  pct,
  color,
  onChangeLabel,
  onChangeValue,
  testID,
}: BarRowProps) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(100, pct));
  const pctText = `${clamped.toFixed(1)}%`;
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.topRow}>
        {onChangeLabel ? (
          <EditableText
            value={label}
            onChange={onChangeLabel}
            style={[styles.label, { color: colors.foreground }]}
            testID={testID ? `${testID}-label` : undefined}
          />
        ) : (
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        )}
        {onChangeValue ? (
          <EditableText
            value={pctText}
            onChange={onChangeValue}
            keyboardType="decimal-pad"
            align="right"
            style={[styles.pct, { color: colors.mutedForeground }]}
            testID={testID ? `${testID}-value` : undefined}
          />
        ) : (
          <Text style={[styles.pct, { color: colors.mutedForeground }]}>{pctText}</Text>
        )}
      </View>
      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  pct: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 40,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditableText } from '@/components/EditableText';
import { useColors } from '@/hooks/useColors';

interface MetricRowProps {
  label: string;
  value: string;
  onChangeValue: (next: string) => void;
  testID?: string;
}

// Plain label/value row with no icon bubble — matches Instagram's exact
// "Actions after viewing" / "Interactions" list styling from the reference
// screenshots (unlike RateRow, which is used for percentage rows elsewhere).
export function MetricRow({ label, value, onChangeValue, testID }: MetricRowProps) {
  const colors = useColors();
  return (
    <View style={styles.row} testID={testID}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <EditableText
        value={value}
        onChange={onChangeValue}
        align="right"
        style={[styles.value, { color: colors.foreground }]}
        testID={testID ? `${testID}-value` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  value: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 30,
  },
});

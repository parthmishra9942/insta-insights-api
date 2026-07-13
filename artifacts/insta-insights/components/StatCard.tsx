import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EditableText } from '@/components/EditableText';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  label: string;
  value: string;
  onChangeValue: (next: string) => void;
  testID?: string;
}

export function StatCard({ label, value, onChangeValue, testID }: StatCardProps) {
  const colors = useColors();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}
      testID={testID}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <EditableText
        value={value}
        onChange={onChangeValue}
        keyboardType="default"
        style={[styles.value, { color: colors.foreground }]}
        testID={testID ? `${testID}-value` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EditableText } from '@/components/EditableText';
import { useColors } from '@/hooks/useColors';

interface RateRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onChangeValue: (next: string) => void;
  testID?: string;
}

export function RateRow({ icon, label, value, onChangeValue, testID }: RateRowProps) {
  const colors = useColors();
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
          <Feather name={icon} size={18} color={colors.foreground} />
        </View>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      </View>
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    flexShrink: 1,
  },
  value: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 60,
  },
});

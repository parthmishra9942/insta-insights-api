import React from 'react';
import { Alert, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface InfoButtonProps {
  title: string;
  message: string;
  testID?: string;
}

// Small "ⓘ" affordance placed next to section headings, matching Instagram's
// real Insights screens where every metric group links to an explainer sheet.
export function InfoButton({ title, message, testID }: InfoButtonProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => Alert.alert(title, message)}
      hitSlop={10}
      style={{ marginLeft: 6 }}
      testID={testID}
    >
      <Feather name="info" size={14} color={colors.mutedForeground} />
    </Pressable>
  );
}

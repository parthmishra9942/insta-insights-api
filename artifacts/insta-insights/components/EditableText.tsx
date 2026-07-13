import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface EditableTextProps {
  value: string;
  onChange: (next: string) => void;
  style?: any;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  testID?: string;
}

// Tap or hold any stat/label to edit it inline. Using React Native's built-in
// Pressable is far more reliable on Android than the custom gesture-handler
// double-tap setup, which kept missing on real devices.
export function EditableText({
  value,
  onChange,
  style,
  keyboardType = 'default',
  align = 'left',
  numberOfLines = 1,
  testID,
}: EditableTextProps) {
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== value) {
      onChange(trimmed);
    }
  };

  if (editing) {
    return (
      <View
        style={[
          styles.editingWrap,
          { borderColor: colors.primary, backgroundColor: colors.muted },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          autoFocus
          selectTextOnFocus
          keyboardType={keyboardType}
          style={[
            style,
            styles.input,
            { color: colors.foreground, textAlign: align },
          ]}
          testID={testID ? `${testID}-input` : undefined}
        />
        <Feather name="check" size={14} color={colors.primary} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={startEdit}
      onLongPress={startEdit}
      delayLongPress={350}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID={testID}
    >
      <Text
        style={[style, { textAlign: align }]}
        numberOfLines={numberOfLines}
      >
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  editingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 2,
  },
});

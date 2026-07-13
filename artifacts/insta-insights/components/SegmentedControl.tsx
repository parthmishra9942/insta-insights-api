import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  variant?: 'underline' | 'pill';
}

export function SegmentedControl({
  options,
  value,
  onChange,
  variant = 'pill',
}: SegmentedControlProps) {
  const colors = useColors();

  if (variant === 'underline') {
    return (
      <View style={[styles.underlineRow, { borderBottomColor: colors.border }]}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={styles.underlineItem}
              testID={`segment-${opt}`}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.underlineText,
                  { color: active ? colors.foreground : colors.mutedForeground },
                  active && styles.underlineTextActive,
                ]}
              >
                {opt}
              </Text>
              {active ? (
                <View style={[styles.underlineBar, { backgroundColor: colors.foreground }]} />
              ) : (
                <View style={styles.underlineBarSpacer} />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.pillRow}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.foreground : colors.muted,
                borderColor: colors.border,
              },
            ]}
            testID={`pill-${opt}`}
          >
            <Text
              style={[
                styles.pillText,
                { color: active ? colors.background : colors.foreground },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  underlineRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  underlineItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  underlineText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  underlineTextActive: {
    fontFamily: 'Inter_700Bold',
  },
  underlineBar: {
    marginTop: 8,
    height: 2,
    width: '70%',
    borderRadius: 2,
  },
  underlineBarSpacer: {
    marginTop: 8,
    height: 2,
    width: '70%',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

export function LoadingOverlay({ label = 'Analyzing link…' }: { label?: string }) {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1100, easing: Easing.linear }),
      -1
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [rotation, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.15 }],
  }));

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.ringWrap, pulseStyle]}>
        <Animated.View style={ringStyle}>
          <LinearGradient
            colors={[colors.primary, colors.secondary, colors.primary]}
            style={styles.ring}
          />
        </Animated.View>
        <View style={[styles.ringInner, { backgroundColor: colors.background }]} />
      </Animated.View>
      <Text style={[styles.text, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.subtext, { color: colors.mutedForeground }]}>
        Fetching engagement, reach, and audience data
      </Text>
    </View>
  );
}

const RING_SIZE = 72;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  ringInner: {
    position: 'absolute',
    width: RING_SIZE - 12,
    height: RING_SIZE - 12,
    borderRadius: (RING_SIZE - 12) / 2,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  subtext: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});

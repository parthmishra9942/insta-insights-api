import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

interface WatchCurveCardProps {
  values: number[];
  height?: number;
  xLabels?: [string, string];
}

const GRID_STEPS: { pct: number; label: string }[] = [
  { pct: 100, label: '100%' },
  { pct: 50, label: '50%' },
  { pct: 0, label: '0' },
];

// Plain retention-style curve: faint horizontal gridlines with 0/50/100%
// labels on the left, optional start/end time labels below — matches
// Instagram's real "when people liked your reel" / watch-time chart style.
export function WatchCurveCard({ values, height = 130, xLabels }: WatchCurveCardProps) {
  const colors = useColors();
  const width = 300;
  const leftGutter = 34;
  const plotWidth = width - leftGutter;

  const linePath = useMemo(() => {
    const stepX = plotWidth / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => ({
      x: leftGutter + i * stepX,
      y: height - (v / 100) * height,
    }));
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  }, [values, height, plotWidth]);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {GRID_STEPS.map((g) => (
          <Line
            key={g.pct}
            x1={leftGutter}
            y1={height - (g.pct / 100) * height}
            x2={width}
            y2={height - (g.pct / 100) * height}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        <Path
          d={linePath}
          stroke={colors.secondary}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { paddingRight: width - leftGutter }]}>
        {GRID_STEPS.map((g) => (
          <Text
            key={g.pct}
            style={[
              styles.axisLabel,
              {
                color: colors.mutedForeground,
                position: 'absolute',
                top: height - (g.pct / 100) * height - 7,
                left: 0,
              },
            ]}
          >
            {g.label}
          </Text>
        ))}
      </View>
      {xLabels && (
        <View style={[styles.axisBottom, { marginLeft: leftGutter }]}>
          <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>{xLabels[0]}</Text>
          <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>{xLabels[1]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  axisLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  axisBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

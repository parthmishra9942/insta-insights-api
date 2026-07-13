import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

interface LineChartCardProps {
  values: number[];
  labels: string[];
  color: string;
  height?: number;
}

function niceStep(max: number) {
  if (max <= 10) return 5;
  const rough = max / 2;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;
  const step = normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10;
  return step * magnitude;
}

// Deliberately plain: a single stroked line over faint horizontal
// gridlines, no gradient fill — matches Instagram's real Insights chart
// rather than a decorated area chart.
export function LineChartCard({ values, labels, color, height = 150 }: LineChartCardProps) {
  const colors = useColors();
  const width = 300;
  const leftGutter = 28;
  const plotWidth = width - leftGutter;

  const { linePath, gridLines, maxVal } = useMemo(() => {
    const rawMax = Math.max(...values, 1);
    const step = niceStep(rawMax);
    const gridMax = Math.ceil(rawMax / step) * step || step;
    const stepX = plotWidth / Math.max(values.length - 1, 1);

    const points = values.map((v, i) => ({
      x: leftGutter + i * stepX,
      y: height - (v / gridMax) * height,
    }));
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const lines: { y: number; label: number }[] = [];
    for (let g = 0; g <= gridMax; g += step) {
      lines.push({ y: height - (g / gridMax) * height, label: g });
    }

    return { linePath: path, gridLines: lines, maxVal: gridMax };
  }, [values, height, plotWidth]);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {gridLines.map((g, i) => (
          <Line
            key={i}
            x1={leftGutter}
            y1={g.y}
            x2={width}
            y2={g.y}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        <Path d={linePath} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { paddingRight: width - leftGutter }]}>
        {gridLines.map((g, i) => (
          <Text
            key={i}
            style={[
              styles.axisLabel,
              { color: colors.mutedForeground, position: 'absolute', top: (g.y / height) * height - 7, left: 0 },
            ]}
          >
            {g.label}
          </Text>
        ))}
      </View>
      <View style={[styles.axisBottom, { marginLeft: leftGutter }]}>
        <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>{labels[0]}</Text>
        <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>
          {labels[Math.floor(labels.length / 2)]}
        </Text>
        <Text style={[styles.axisLabel, { color: colors.mutedForeground }]}>
          {labels[labels.length - 1]}
        </Text>
      </View>
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

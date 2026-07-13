import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AnalyzedLink } from '@/types/insights';

const TYPE_ICON: Record<AnalyzedLink['type'], keyof typeof Feather.glyphMap> = {
  reel: 'film',
  post: 'image',
  profile: 'user',
};

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface HistoryRowProps {
  link: AnalyzedLink;
  onPress: () => void;
  onDelete: () => void;
}

export function HistoryRow({ link, onPress, onDelete }: HistoryRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
      ]}
      testID={`history-row-${link.id}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <Feather name={TYPE_ICON[link.type]} size={18} color={colors.foreground} />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={1}>
          {link.data.headline}
        </Text>
        <Text style={[styles.url, { color: colors.mutedForeground }]} numberOfLines={1}>
          {link.url}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.views, { color: colors.foreground }]}>
          {formatCompact(link.data.summary.views)}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(link.createdAt)}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        style={styles.deleteBtn}
        hitSlop={10}
        testID={`history-row-${link.id}-delete`}
      >
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  headline: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  url: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
  },
  views: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  deleteBtn: {
    paddingLeft: 6,
  },
});

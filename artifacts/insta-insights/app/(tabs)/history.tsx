import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useHistory } from '@/context/HistoryContext';
import { HistoryRow } from '@/components/HistoryRow';
import { EmptyState } from '@/components/EmptyState';

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { links, removeLink, clearAll } = useHistory();

  const confirmClear = () => {
    Alert.alert('Clear history', 'Remove all analyzed links? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12 },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {links.length} link{links.length === 1 ? '' : 's'} analyzed
          </Text>
        </View>
        {links.length > 0 && (
          <Text
            onPress={confirmClear}
            style={[styles.clearAll, { color: colors.destructive }]}
            testID="clear-history"
          >
            Clear all
          </Text>
        )}
      </View>

      <FlatList
        data={links}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={links.length > 0}
        renderItem={({ item }) => (
          <HistoryRow
            link={item}
            onPress={() => router.push(`/insights/${item.id}`)}
            onDelete={() => removeLink(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="clock"
            title="Nothing here yet"
            subtitle="Every link you analyze on the Home tab will show up in this history"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  clearAll: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
});

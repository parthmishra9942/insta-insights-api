import React from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useHistory } from '@/context/HistoryContext';
import { useLicense } from '@/context/LicenseContext';

function SettingsRow({
  icon,
  label,
  destructive,
  onPress,
  testID,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  destructive?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      testID={testID}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.muted },
        ]}
      >
        <Feather name={icon} size={17} color={destructive ? colors.destructive : colors.foreground} />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      {!destructive && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { links, clearAll } = useHistory();
  const { license, isValid, daysRemaining, deactivate } = useLicense();

  const licenseStatusLabel = () => {
    if (!isValid) return 'Inactive';
    if (license?.duration === 'lifetime') return 'Lifetime · Active';
    if (daysRemaining != null) return `Active · ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`;
    return 'Active';
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate license',
      'This removes the current license from this device. You can activate a new key afterward.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: deactivate },
      ]
    );
  };

  const handleExport = async () => {
    if (links.length === 0) {
      Alert.alert('Nothing to export', 'Analyze a link first, then export its stats.');
      return;
    }
    const latest = links[0];
    const d = latest.data;
    const message =
      `${d.headline} — Insta Insights\n\n` +
      `Views: ${d.summary.views.toLocaleString()}\n` +
      `Accounts reached: ${d.summary.accountsReached.toLocaleString()}\n` +
      `Likes: ${d.engagementCounts.likes.toLocaleString()}\n` +
      `Comments: ${d.engagementCounts.comments.toLocaleString()}\n` +
      `Shares: ${d.engagementCounts.shares.toLocaleString()}\n` +
      `Saves: ${d.engagementCounts.saves.toLocaleString()}\n` +
      `Engagement rate: ${d.engagementRate}%\n` +
      `Estimated reach: ${d.estimatedReach.toLocaleString()}`;
    try {
      await Share.share({ message });
    } catch {
      // user cancelled or share unavailable — ignore
    }
  };

  const handleClear = () => {
    Alert.alert('Clear all data', 'This removes every analyzed link and its stats.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
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
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LICENSE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <SettingsRow
            icon="key"
            label={licenseStatusLabel()}
            onPress={() =>
              Alert.alert(
                'License',
                license?.key
                  ? `Key: ${license.key}\nPlan: ${license.duration === 'lifetime' ? 'Lifetime' : '1 month'}\nActivated: ${new Date(license.activatedAt).toLocaleDateString()}`
                  : 'No active license on this device.'
              )
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="log-out"
            label="Deactivate license"
            destructive
            onPress={handleDeactivate}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 24 }]}>DATA</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <SettingsRow icon="share-2" label="Export latest analytics" onPress={handleExport} testID="export-row" />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="trash-2"
            label="Clear all history"
            destructive
            onPress={handleClear}
            testID="clear-data-row"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 24 }]}>
          ABOUT
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <SettingsRow icon="info" label="How analytics are estimated" onPress={() =>
            Alert.alert(
              'About the numbers',
              'This demo simulates realistic analytics locally on your device from the link you paste. No real Instagram data is fetched. The structure mirrors a real analytics API so it can be swapped in later.'
            )
          } />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="edit-3" label="Editing your stats" onPress={() =>
            Alert.alert('Editing your stats', 'Double-tap any number or label inside a dashboard to edit it inline.')
          } />
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Insta Insights · v1.0.0
        </Text>
      </View>
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  body: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 32,
  },
});

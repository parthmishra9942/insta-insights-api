import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useHistory } from '@/context/HistoryContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { HistoryRow } from '@/components/HistoryRow';
import { EmptyState } from '@/components/EmptyState';
import { isLikelyInstagramLink } from '@/utils/analytics';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { links, analyze, removeLink } = useHistory();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const canAnalyze = isLikelyInstagramLink(url) && !analyzing;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(() => {
      const created = analyze(url.trim());
      setAnalyzing(false);
      setUrl('');
      router.push(`/insights/${created.id}`);
    }, 1200);
  };

  if (analyzing) {
    return <LoadingOverlay />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Insta Insights</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Paste any Reel, Post, or Profile link to see its performance
        </Text>
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.inputCard,
            { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
          ]}
        >
          <Feather name="link" size={18} color={colors.mutedForeground} />
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="instagram.com/reel/..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleAnalyze}
            testID="link-input"
          />
          {url.length > 0 && (
            <Pressable onPress={() => setUrl('')} hitSlop={10} testID="clear-button">
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleAnalyze}
          disabled={!canAnalyze}
          style={({ pressed }) => [styles.analyzeBtn, { opacity: !canAnalyze ? 0.4 : pressed ? 0.85 : 1 }]}
          testID="analyze-button"
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.analyzeGradient, { borderRadius: colors.radius }]}
          >
            <Text style={styles.analyzeText}>Analyze</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </LinearGradient>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>RECENT</Text>

        {links.length === 0 ? (
          <EmptyState
            icon="bar-chart-2"
            title="No links analyzed yet"
            subtitle="Paste a link above to generate your first analytics dashboard"
          />
        ) : (
          links.slice(0, 5).map((link) => (
            <HistoryRow
              key={link.id}
              link={link}
              onPress={() => router.push(`/insights/${link.id}`)}
              onDelete={() => removeLink(link.id)}
            />
          ))
        )}
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
    paddingBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 14,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  analyzeBtn: {
    marginBottom: 4,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  analyzeText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginTop: 6,
  },
});

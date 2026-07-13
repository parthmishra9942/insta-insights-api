import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useHistory } from '@/context/HistoryContext';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { MetricRow } from '@/components/MetricRow';
import { RateRow } from '@/components/RateRow';
import { BarRow } from '@/components/BarRow';
import { LineChartCard } from '@/components/LineChartCard';
import { WatchCurveCard } from '@/components/WatchCurveCard';
import { InfoButton } from '@/components/InfoButton';
import { ReelPreview } from '@/components/ReelPreview';
import { EditableText } from '@/components/EditableText';
import { InsightsData, RatePoint } from '@/types/insights';
import { formatDuration } from '@/utils/analytics';

const MAIN_TABS = ['Overview', 'Engagement', 'Audience'];
const VIEW_SEGMENTS = ['All', 'Followers', 'Non-followers'];
const AUDIENCE_SEGMENTS = ['Age', 'Country', 'Gender'];

function parseNumber(input: string, fallback: number) {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

function updateAndSort(arr: RatePoint[], index: number, updates: Partial<RatePoint>): RatePoint[] {
  const next = arr.map((p, i) => (i === index ? { ...p, ...updates } : p));
  return next.sort((a, b) => b.value - a.value);
}

export default function InsightsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getLink, updateField, setPreviewUri } = useHistory();
  const link = getLink(id);

  const [mainTab, setMainTab] = useState('Overview');
  const [viewSegment, setViewSegment] = useState('All');
  const [audienceSegment, setAudienceSegment] = useState('Age');

  if (!link) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingText, { color: colors.foreground }]}>
          This link is no longer available.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const d = link.data;
  const set = (updater: (data: InsightsData) => InsightsData) => updateField(link.id, updater);

  const viewSeries =
    viewSegment === 'Followers'
      ? d.viewsOverTime.followers
      : viewSegment === 'Non-followers'
      ? d.viewsOverTime.nonFollowers
      : d.viewsOverTime.all;

  const audiencePoints =
    audienceSegment === 'Age' ? d.audience.age : audienceSegment === 'Country' ? d.audience.country : d.audience.gender;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 10 },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} testID="back-button">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Insights</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <ReelPreview
          uri={link.previewUri}
          onPick={(uri) => setPreviewUri(link.id, uri)}
          size="large"
          testID="reel-preview-top"
        />

        <View style={styles.actionRow}>
          {[
            { icon: 'heart' as const, value: d.engagementCounts.likes, key: 'likes' as const },
            { icon: 'message-circle' as const, value: d.engagementCounts.comments, key: 'comments' as const },
            { icon: 'repeat' as const, value: d.engagementCounts.reposts, key: 'reposts' as const },
            { icon: 'send' as const, value: d.engagementCounts.shares, key: 'shares' as const },
            { icon: 'bookmark' as const, value: d.engagementCounts.saves, key: 'saves' as const },
          ].map((a, i) => (
            <View key={i} style={styles.actionItem}>
              <Feather name={a.icon} size={20} color={colors.foreground} />
              <EditableText
                value={a.value.toLocaleString()}
                onChange={(v) =>
                  set((data) => ({
                    ...data,
                    engagementCounts: {
                      ...data.engagementCounts,
                      [a.key]: parseNumber(v, data.engagementCounts[a.key]),
                    },
                  }))
                }
                keyboardType="numeric"
                style={[styles.actionValue, { color: colors.mutedForeground }]}
                testID={`action-${a.key}`}
              />
            </View>
          ))}
        </View>

        <View style={{ marginBottom: 18 }}>
          <SegmentedControl options={MAIN_TABS} value={mainTab} onChange={setMainTab} variant="underline" />
        </View>

        {mainTab === 'Overview' && (
          <View style={styles.section}>
            <View style={styles.headingRow}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Summary</Text>
              <InfoButton
                title="Summary"
                message="A quick snapshot of how this reel performed: total views, unique accounts reached, average time people watched, and new follows it generated."
                testID="info-summary"
              />
            </View>
            <View style={styles.statGrid}>
              <StatCard
                label="Views"
                value={d.summary.views.toLocaleString()}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    summary: { ...data.summary, views: parseNumber(v, data.summary.views) },
                  }))
                }
                testID="stat-views"
              />
              <StatCard
                label="Accounts reached"
                value={d.summary.accountsReached.toLocaleString()}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    summary: {
                      ...data.summary,
                      accountsReached: parseNumber(v, data.summary.accountsReached),
                    },
                  }))
                }
                testID="stat-reached"
              />
              <StatCard
                label="Average watch time"
                value={`${d.summary.avgWatchTimeSec}s`}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    summary: {
                      ...data.summary,
                      avgWatchTimeSec: parseNumber(v, data.summary.avgWatchTimeSec),
                    },
                  }))
                }
                testID="stat-watchtime"
              />
              <StatCard
                label="Follows"
                value={d.summary.follows.toLocaleString()}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    summary: { ...data.summary, follows: parseNumber(v, data.summary.follows) },
                  }))
                }
                testID="stat-follows"
              />
            </View>

            <View style={[styles.headingRow, { marginTop: 4 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Views over time</Text>
              <InfoButton
                title="Views over time"
                message="Shows how views on this reel accumulated since it was posted, broken down by whether the viewer follows you."
                testID="info-views-over-time"
              />
            </View>
            <View style={{ marginBottom: 16 }}>
              <SegmentedControl options={VIEW_SEGMENTS} value={viewSegment} onChange={setViewSegment} />
            </View>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              <LineChartCard values={viewSeries} labels={d.viewsOverTime.labels} color={colors.primary} />
            </View>

            <View style={[styles.headingRow, { marginTop: 24 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>What affects your views</Text>
              <InfoButton
                title="What affects your views"
                message="These rates show how people responded after seeing your reel, ordered by how much weight each one carries when Instagram decides who to show it to next."
                testID="info-what-affects"
              />
            </View>
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
              Rates are listed in order of importance to reach.
            </Text>
            <RateRow
              icon="clock"
              label="Skip rate"
              value={`${d.rates.skipRate}%`}
              onChangeValue={(v) =>
                set((data) => ({ ...data, rates: { ...data.rates, skipRate: parseNumber(v, data.rates.skipRate) } }))
              }
              testID="rate-skip"
            />
            <RateRow
              icon="send"
              label="Share rate"
              value={`${d.rates.shareRate}%`}
              onChangeValue={(v) => set((data) => ({ ...data, rates: { ...data.rates, shareRate: parseNumber(v, data.rates.shareRate) } }))}
              testID="rate-share"
            />
            <RateRow
              icon="heart"
              label="Like rate"
              value={`${d.rates.likeRate}%`}
              onChangeValue={(v) => set((data) => ({ ...data, rates: { ...data.rates, likeRate: parseNumber(v, data.rates.likeRate) } }))}
              testID="rate-like"
            />
            <RateRow
              icon="bookmark"
              label="Save rate"
              value={`${d.rates.saveRate}%`}
              onChangeValue={(v) => set((data) => ({ ...data, rates: { ...data.rates, saveRate: parseNumber(v, data.rates.saveRate) } }))}
              testID="rate-save"
            />
            <RateRow
              icon="repeat"
              label="Repost rate"
              value={`${d.rates.repostRate}%`}
              onChangeValue={(v) => set((data) => ({ ...data, rates: { ...data.rates, repostRate: parseNumber(v, data.rates.repostRate) } }))}
              testID="rate-repost"
            />
            <RateRow
              icon="message-circle"
              label="Comment rate"
              value={`${d.rates.commentRate}%`}
              onChangeValue={(v) => set((data) => ({ ...data, rates: { ...data.rates, commentRate: parseNumber(v, data.rates.commentRate) } }))}
              testID="rate-comment"
            />

            <View style={[styles.headingRow, { marginTop: 24 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>How long people watched your reel</Text>
              <InfoButton
                title="How long people watched your reel"
                message="Shows what share of viewers were still watching at each point in your reel's timeline."
                testID="info-watch-time"
              />
            </View>
            <View style={{ marginTop: 16, marginBottom: 14 }}>
              <ReelPreview
                uri={link.previewUri}
                onPick={(uri) => setPreviewUri(link.id, uri)}
                size="small"
                testID="reel-preview-watchtime"
              />
            </View>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              <WatchCurveCard values={d.watchTimeCurve} xLabels={['0:00', formatDuration(d.durationSec)]} />
            </View>

            <View style={[styles.headingRow, { marginTop: 24 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Top sources of views</Text>
              <InfoButton
                title="Top sources of views"
                message="Shows where people saw this reel — the Reels tab, your profile, Home feed, Explore, or a hashtag/search result."
                testID="info-top-sources"
              />
            </View>
            {d.topSources.map((p, i) => (
              <BarRow
                key={p.label}
                label={p.label}
                pct={p.value}
                color={i === 0 ? colors.primary : colors.secondary}
                onChangeLabel={(v) =>
                  set((data) => ({
                    ...data,
                    topSources: updateAndSort(data.topSources, i, { label: v }),
                  }))
                }
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    topSources: updateAndSort(data.topSources, i, { value: parseNumber(v, p.value) }),
                  }))
                }
                testID={`top-source-${i}`}
              />
            ))}

            <Text style={[styles.adLabel, { color: colors.mutedForeground, marginTop: 24 }]}>Ad</Text>
            <Pressable
              onPress={() => Alert.alert('Boost this Reel', 'Boosting isn\u2019t available in this demo.')}
              style={styles.boostRow}
              testID="boost-reel"
            >
              <View style={styles.boostLeft}>
                <Feather name="trending-up" size={20} color={colors.foreground} />
                <Text style={[styles.boostLabel, { color: colors.foreground }]}>Boost this Reel</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {mainTab === 'Engagement' && (
          <View style={styles.section}>
            <View style={styles.headingRow}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Actions after viewing</Text>
              <InfoButton
                title="Actions after viewing"
                message="What people did after seeing your reel, like visiting your profile or following you."
                testID="info-actions-after-viewing"
              />
            </View>
            <MetricRow
              label="Profile visits"
              value={d.summary.profileVisits.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  summary: { ...data.summary, profileVisits: parseNumber(v, data.summary.profileVisits) },
                }))
              }
              testID="metric-profile-visits"
            />
            <MetricRow
              label="Follows"
              value={d.summary.follows.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  summary: { ...data.summary, follows: parseNumber(v, data.summary.follows) },
                }))
              }
              testID="metric-follows"
            />

            <View style={[styles.headingRow, { marginTop: 20 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Interactions</Text>
              <InfoButton
                title="Interactions"
                message="How people interacted with your reel: likes, comments, reposts, shares, and saves."
                testID="info-interactions"
              />
            </View>
            <MetricRow
              label="Likes"
              value={d.engagementCounts.likes.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  engagementCounts: { ...data.engagementCounts, likes: parseNumber(v, data.engagementCounts.likes) },
                }))
              }
              testID="metric-likes"
            />
            <MetricRow
              label="Comments"
              value={d.engagementCounts.comments.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  engagementCounts: {
                    ...data.engagementCounts,
                    comments: parseNumber(v, data.engagementCounts.comments),
                  },
                }))
              }
              testID="metric-comments"
            />
            <MetricRow
              label="Reposts"
              value={d.engagementCounts.reposts.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  engagementCounts: {
                    ...data.engagementCounts,
                    reposts: parseNumber(v, data.engagementCounts.reposts),
                  },
                }))
              }
              testID="metric-reposts"
            />
            <MetricRow
              label="Shares"
              value={d.engagementCounts.shares.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  engagementCounts: {
                    ...data.engagementCounts,
                    shares: parseNumber(v, data.engagementCounts.shares),
                  },
                }))
              }
              testID="metric-shares"
            />
            <MetricRow
              label="Saves"
              value={d.engagementCounts.saves.toLocaleString()}
              onChangeValue={(v) =>
                set((data) => ({
                  ...data,
                  engagementCounts: { ...data.engagementCounts, saves: parseNumber(v, data.engagementCounts.saves) },
                }))
              }
              testID="metric-saves"
            />

            <View style={[styles.headingRow, { marginTop: 20 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>When people liked your reel</Text>
              <InfoButton
                title="When people liked your reel"
                message="Shows the point in your reel's timeline where most of the likes happened."
                testID="info-when-liked"
              />
            </View>
            <ReelPreview
              uri={link.previewUri}
              onPick={(uri) => setPreviewUri(link.id, uri)}
              size="small"
              testID="reel-preview-engagement"
            />
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: colors.radius, marginTop: 14 }]}>
              <WatchCurveCard values={d.watchTimeCurve} xLabels={['0:00', formatDuration(d.durationSec)]} />
            </View>
          </View>
        )}

        {mainTab === 'Audience' && (
          <View style={styles.section}>
            <View style={styles.headingRow}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Who viewed your reel</Text>
              <InfoButton
                title="Who viewed your reel"
                message="Shows the split between people who already follow you and people discovering your reel for the first time."
                testID="info-who-viewed"
              />
            </View>
            <View style={{ marginTop: 12 }}>
              <BarRow
                label="Followers"
                pct={d.audience.followersPct}
                color={colors.secondary}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    audience: { ...data.audience, followersPct: parseNumber(v, data.audience.followersPct) },
                  }))
                }
                testID="bar-followers"
              />
              <BarRow
                label="Non-followers"
                pct={d.audience.nonFollowersPct}
                color={colors.secondary}
                onChangeValue={(v) =>
                  set((data) => ({
                    ...data,
                    audience: { ...data.audience, nonFollowersPct: parseNumber(v, data.audience.nonFollowersPct) },
                  }))
                }
                testID="bar-nonfollowers"
              />
            </View>

            <View style={[styles.headingRow, { marginTop: 12 }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Audience details</Text>
              <InfoButton
                title="Audience details"
                message="Breaks your viewers down by age, country, and gender so you know exactly who's watching."
                testID="info-audience-details"
              />
            </View>
            <View style={{ marginVertical: 14 }}>
              <SegmentedControl
                options={AUDIENCE_SEGMENTS}
                value={audienceSegment}
                onChange={setAudienceSegment}
              />
            </View>
            {audiencePoints.map((p, i) => {
              const field = audienceSegment === 'Age' ? 'age' : audienceSegment === 'Country' ? 'country' : 'gender';
              return (
                <BarRow
                  key={p.label}
                  label={p.label}
                  pct={p.value}
                  color={i === 0 ? colors.primary : colors.secondary}
                  onChangeValue={(v) =>
                    set((data) => ({
                      ...data,
                      audience: {
                        ...data.audience,
                        [field]: updateAndSort(data.audience[field], i, { value: parseNumber(v, p.value) }),
                      },
                    }))
                  }
                  onChangeLabel={
                    audienceSegment === 'Country'
                      ? (v) =>
                          set((data) => ({
                            ...data,
                            audience: {
                              ...data.audience,
                              country: updateAndSort(data.audience.country, i, { label: v }),
                            },
                          }))
                      : undefined
                  }
                  testID={`audience-bar-${i}`}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionValue: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  section: {
    gap: 4,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chartCard: {
    padding: 16,
  },
  adLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  boostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  boostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  boostLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});

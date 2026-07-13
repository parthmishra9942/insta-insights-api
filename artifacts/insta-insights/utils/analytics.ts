import { AnalyzedLink, InsightsData, LinkType, RatePoint } from '@/types/insights';
import { createRng, newId } from '@/utils/random';

export function detectLinkType(url: string): LinkType {
  const lower = url.toLowerCase();
  if (lower.includes('/reel/') || lower.includes('/reels/')) return 'reel';
  if (lower.includes('/p/')) return 'post';
  return 'profile';
}

function extractHandle(url: string, type: LinkType): string {
  try {
    const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const parts = cleaned.split('/').filter(Boolean);
    if (type === 'profile' && parts.length > 1) return `@${parts[1]}`;
    if (parts.length > 0 && parts[0].includes('instagram.com') === false) {
      return `@${parts[0]}`;
    }
  } catch {
    // fall through to default label
  }
  return type === 'reel' ? 'Reel' : type === 'post' ? 'Post' : 'Profile';
}

function distribute(rng: ReturnType<typeof createRng>, labels: string[], skewed = true): RatePoint[] {
  const raw = labels.map((_, i) =>
    skewed ? Math.pow(rng.next(), i * 0.35 + 0.4) : rng.next()
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  let remaining = 100;
  const points: RatePoint[] = labels.map((label, i) => {
    const pct = i === labels.length - 1 ? remaining : Math.round((raw[i] / sum) * 100);
    remaining -= pct;
    return { label, value: Math.max(0, pct) };
  });
  return points.sort((a, b) => b.value - a.value);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function generateInsights(url: string, type: LinkType): InsightsData {
  const rng = createRng(url + '::' + type);

  const durationSec = rng.int(15, 75);
  const views = Math.round(rng.range(1200, 260000));
  const accountsReached = Math.round(views * rng.range(0.55, 0.92));
  const avgWatchTimeSec = Math.max(2, Math.round(durationSec * rng.range(0.25, 0.85)));
  const follows = Math.round(views * rng.range(0, 0.012));
  const profileVisits = Math.round(views * rng.range(0.0008, 0.006));

  const likes = Math.round(views * rng.range(0.01, 0.08));
  const comments = Math.round(likes * rng.range(0.03, 0.14));
  const shares = Math.round(views * rng.range(0.002, 0.022));
  const saves = Math.round(views * rng.range(0.003, 0.032));
  const reposts = Math.round(shares * rng.range(0.15, 0.55));

  const totalEngagements = likes + comments + shares + saves;
  const engagementRate = Math.round((totalEngagements / Math.max(views, 1)) * 1000) / 10;
  const estimatedReach = Math.round(accountsReached * rng.range(1.02, 1.6));

  const pointCount = rng.int(7, 10);
  const labels = Array.from({ length: pointCount }, (_, i) =>
    i === 0 ? '0h' : i === pointCount - 1 ? `${(pointCount - 1) * 2}h` : `${i * 2}h`
  );
  const followersPct = rng.int(0, 38);
  const nonFollowersPct = 100 - followersPct;

  let running = 0;
  const all: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    running += views * rng.range(0.03, 0.22);
    all.push(Math.round(running));
  }
  const maxAll = all[all.length - 1] || 1;
  const followers = all.map((v) => Math.round((v * followersPct) / 100));
  const nonFollowers = all.map((v) => Math.round((v * nonFollowersPct) / 100));

  const watchTimeCurve = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    const base = 100 * Math.pow(1 - t, 1.4 + rng.next() * 0.6);
    return Math.max(2, Math.round(base));
  });

  const age = distribute(rng, ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']);
  const countryPool = [
    'India', 'United States', 'Brazil', 'Indonesia', 'Russia',
    'Mexico', 'Pakistan', 'Nigeria', 'United Kingdom', 'Philippines',
  ];
  const shuffled = [...countryPool].sort(() => rng.next() - 0.5).slice(0, 5);
  const country = distribute(rng, shuffled);
  const gender = distribute(rng, ['Women', 'Men', 'Other'], false);
  const topSources = distribute(rng, ['Reels tab', 'Home', 'Profile', 'Explore', 'Hashtags & search', 'Other']);

  return {
    headline: extractHandle(url, type),
    summary: { views, accountsReached, avgWatchTimeSec, follows, profileVisits },
    durationSec,
    engagementCounts: { likes, comments, shares, saves, reposts },
    engagementRate,
    estimatedReach,
    viewsOverTime: { labels, all, followers, nonFollowers },
    watchTimeCurve,
    topSources,
    rates: {
      shareRate: Math.round((shares / views) * 1000) / 10,
      likeRate: Math.round((likes / views) * 1000) / 10,
      saveRate: Math.round((saves / views) * 1000) / 10,
      repostRate: Math.round((reposts / views) * 1000) / 10,
      commentRate: Math.round((comments / views) * 1000) / 10,
      skipRate: Math.round(rng.range(4, 42) * 10) / 10,
    },
    audience: {
      followersPct,
      nonFollowersPct,
      age,
      country,
      gender,
    },
  };
}

export function createAnalyzedLink(url: string): AnalyzedLink {
  const type = detectLinkType(url);
  return {
    id: newId(),
    url,
    type,
    createdAt: Date.now(),
    data: generateInsights(url, type),
  };
}

export function isLikelyInstagramLink(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 3) return false;
  return true;
}

// Backfills any fields missing from previously-stored data (e.g. links saved
// before a new metric was introduced) with freshly generated defaults, while
// preserving every value the user already has/edited. Keeps old AsyncStorage
// history from crashing the insights screen when the data shape evolves.
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as unknown as T;
  }
  if (typeof base === 'object' && base !== null && typeof override === 'object') {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(base as Record<string, unknown>)) {
      result[key] = deepMerge(
        (base as Record<string, unknown>)[key],
        (override as Record<string, unknown>)[key]
      );
    }
    return result as T;
  }
  return override as T;
}

export function normalizeLink(link: AnalyzedLink): AnalyzedLink {
  const type = link.type ?? detectLinkType(link.url);
  const fresh = generateInsights(link.url, type);
  return { ...link, type, data: deepMerge(fresh, link.data) };
}

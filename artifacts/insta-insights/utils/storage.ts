import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const HISTORY_KEY = 'insta-insights:history:v1';
const LICENSE_KEY = 'insta-insights:license:v1';
const DEVICE_FINGERPRINT_KEY = 'insta-insights:device-fingerprint:v1';

export async function loadJson<T>(fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(value));
  } catch {
    // best-effort persistence; ignore storage failures
  }
}

export interface StoredLicense {
  version: number;
  key: string;
  duration: '1month' | 'lifetime';
  status: 'active' | 'expired' | 'revoked';
  activatedAt: string;
  expiresAt: string | null;
  deviceFingerprint: string;
}

export async function loadLicense(): Promise<StoredLicense | null> {
  try {
    const raw = await AsyncStorage.getItem(LICENSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLicense>;
    if (!parsed.version || !parsed.key || !parsed.duration || !parsed.activatedAt) {
      return null;
    }
    // backfill missing fields with safe defaults
    return {
      version: parsed.version,
      key: parsed.key,
      duration: parsed.duration === 'lifetime' ? 'lifetime' : '1month',
      status: parsed.status ?? 'active',
      activatedAt: parsed.activatedAt,
      expiresAt: parsed.expiresAt ?? null,
      deviceFingerprint: parsed.deviceFingerprint ?? '',
    };
  } catch {
    return null;
  }
}

export async function saveLicense(license: StoredLicense): Promise<void> {
  try {
    await AsyncStorage.setItem(LICENSE_KEY, JSON.stringify(license));
  } catch {
    // best-effort persistence
  }
}

export async function clearLicense(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LICENSE_KEY);
  } catch {
    // best-effort
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(DEVICE_FINGERPRINT_KEY);
    if (stored) return stored;
    const generated = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_FINGERPRINT_KEY, generated);
    return generated;
  } catch {
    // Fallback to a random id if storage/crypto fails
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

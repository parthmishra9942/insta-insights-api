import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearLicense,
  getDeviceFingerprint,
  loadLicense,
  saveLicense,
  type StoredLicense,
} from '@/utils/storage';
import { activateLicense } from '@workspace/api-client-react';

export interface LicenseInfo extends StoredLicense {}

interface LicenseContextValue {
  license: LicenseInfo | null;
  isReady: boolean;
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  activate: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivate: () => void;
}

const LicenseContext = createContext<LicenseContextValue | null>(null);

function isLicenseValid(license: LicenseInfo | null): boolean {
  if (!license) return false;
  if (license.status === 'revoked') return false;
  if (license.duration === 'lifetime') return license.status === 'active';
  if (license.expiresAt) {
    return license.status === 'active' && new Date(license.expiresAt) > new Date();
  }
  return license.status === 'active';
}

function getDaysRemaining(license: LicenseInfo | null): number | null {
  if (!license || !isLicenseValid(license)) return null;
  if (license.duration === 'lifetime') return null;
  if (!license.expiresAt) return null;
  const diff = new Date(license.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadLicense();
      setLicense(stored);
      setIsReady(true);
    })();
  }, []);

  const isValid = useMemo(() => isLicenseValid(license), [license]);
  const isExpired = useMemo(() => {
    if (!license) return false;
    if (license.status === 'revoked') return false;
    if (license.duration === 'lifetime') return false;
    if (license.expiresAt) return new Date(license.expiresAt) <= new Date();
    return false;
  }, [license]);
  const daysRemaining = useMemo(() => getDaysRemaining(license), [license]);

  const activate = useCallback(async (key: string) => {
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, error: 'Please enter a license key.' };
    }

    try {
      const deviceFingerprint = await getDeviceFingerprint();
      const result = await activateLicense({
        key: cleanKey,
        deviceFingerprint,
      });

      if (!result.valid) {
        return { success: false, error: 'This license key is not valid.' };
      }

      const next: LicenseInfo = {
        version: 1,
        key: cleanKey,
        duration: result.duration ?? '1month',
        status: 'active',
        activatedAt: result.activatedAt ?? new Date().toISOString(),
        expiresAt: result.expiresAt ?? null,
        deviceFingerprint,
      };

      await saveLicense(next);
      setLicense(next);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not activate license.';
      return { success: false, error: message };
    }
  }, []);

  const deactivate = useCallback(() => {
    clearLicense();
    setLicense(null);
  }, []);

  const value = useMemo<LicenseContextValue>(
    () => ({
      license,
      isReady,
      isValid,
      isExpired,
      daysRemaining,
      activate,
      deactivate,
    }),
    [license, isReady, isValid, isExpired, daysRemaining, activate, deactivate]
  );

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used within a LicenseProvider');
  return ctx;
}

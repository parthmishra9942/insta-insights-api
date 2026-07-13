import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const API = "http://172.25.209.171:8080/api";

const LICENSE_KEY_NAME = "license_key";

async function getDeviceFingerprint(): Promise<string> {
  const androidId =
    Application.getAndroidId() ??
    Application.applicationId ??
    "unknown-device";

  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    androidId
  );
}

export async function saveLicenseKey(key: string) {
  await SecureStore.setItemAsync(LICENSE_KEY_NAME, key);
}

export async function getSavedLicenseKey() {
  return await SecureStore.getItemAsync(LICENSE_KEY_NAME);
}

export async function removeLicenseKey() {
  await SecureStore.deleteItemAsync(LICENSE_KEY_NAME);
}

export async function activateLicense(key: string) {
  const deviceFingerprint = await getDeviceFingerprint();

  const response = await fetch(`${API}/licenses/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      deviceFingerprint,
    }),
  });

  return await response.json();
}

export async function validateLicense() {
  const key = await getSavedLicenseKey();

  if (!key) {
    return {
      valid: false,
      status: "missing",
    };
  }

  const deviceFingerprint = await getDeviceFingerprint();

  const response = await fetch(`${API}/licenses/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      deviceFingerprint,
    }),
  });

  return await response.json();
}
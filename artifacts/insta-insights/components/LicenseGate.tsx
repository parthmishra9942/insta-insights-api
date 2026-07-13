import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useLicense } from '@/context/LicenseContext';

export default function LicenseGate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activate, isExpired } = useLicense();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!key.trim()) {
      Alert.alert('Enter a key', 'Paste or type the license key you received.');
      return;
    }
    setLoading(true);
    const result = await activate(key);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Activation failed', result.error ?? 'This key could not be activated.');
    }
  };

  const title = isExpired ? 'Your license expired' : 'Activate Insta Insights';
  const subtitle = isExpired
    ? 'Enter a new license key to keep using the app.'
    : 'Enter the license key you received to unlock the app.';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: Platform.OS === 'web' ? 80 : insets.top + 40 },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={styles.iconWrap}>
          <Feather name="key" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>

        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder="INSIGHT-XXXXXX-XXXXXX-XXXXXX"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!loading}
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        />

        <Pressable
          onPress={handleActivate}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed || loading ? 0.7 : 1,
              borderRadius: colors.radius,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Activate
            </Text>
          )}
        </Pressable>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          License keys are one-time use per device. 1-month keys expire 30 days after activation. Lifetime keys never expire.
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  keyboard: {
    flex: 1,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 45, 120, 0.15)',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    marginBottom: 16,
  },
  button: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});

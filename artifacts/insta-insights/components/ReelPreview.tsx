import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface ReelPreviewProps {
  uri?: string;
  onPick: (uri: string) => void;
  size?: 'large' | 'small';
  testID?: string;
}

// Lets the user upload a screenshot of their actual reel/post so the
// dashboard shows a real preview instead of a placeholder. Once an image
// is set, the upload affordance disappears — per spec, uploading is a
// one-time action, not an editable slot.
export function ReelPreview({ uri, onPick, size = 'large', testID }: ReelPreviewProps) {
  const colors = useColors();
  const dims = size === 'large' ? { width: 96, height: 128 } : { width: 56, height: 74 };

  const handlePick = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to upload a preview.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [9, 16],
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        onPick(result.assets[0].uri);
      }
    } catch (err) {
      console.error('ReelPreview image pick failed', err);
      Alert.alert('Something went wrong', 'Could not open the photo picker. Please try again.');
    }
  };

  if (uri) {
    return (
      <View style={[styles.wrap, dims]} testID={testID}>
        <Image source={{ uri }} style={[styles.image, dims, { borderRadius: colors.radius }]} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePick}
      style={[
        styles.upload,
        dims,
        { borderColor: colors.border, backgroundColor: colors.muted, borderRadius: colors.radius },
      ]}
      testID={testID ? `${testID}-upload` : 'reel-preview-upload'}
    >
      <Feather name="upload" size={size === 'large' ? 20 : 15} color={colors.mutedForeground} />
      {size === 'large' && (
        <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>Upload preview</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  upload: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  uploadText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});

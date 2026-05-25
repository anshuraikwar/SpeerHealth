import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOffline } from '../providers/OfflineProvider';

export default function OfflineBanner() {
  const { isOffline } = useOffline();
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + 24,
        paddingBottom: 8,
        paddingHorizontal: 16,
        backgroundColor: '#F44336',
        zIndex: 9999,
      }}
    >
      <Text
        style={{
          color: 'white',
          textAlign: 'center',
          fontWeight: '600',
        }}
      >
        You're offline, changes will sync when reconnected
      </Text>
    </View>
  );
}
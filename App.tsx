import 'react-native-gesture-handler';
import { useEffect, useState } from 'react'

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client/react';
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

import { appStyles } from './src/styles/styles';

import { apolloClient } from './src/services/apollo';
import { supabase } from './src/lib/supabase';

import { View } from 'react-native';
import Auth from './src/components/Auth';
import ListInsights from './src/components/list-insights';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // Brand
    primary: '#3F51B5',
    primaryContainer: '#303F9F',
    secondary: '#607D8B',
    secondaryContainer: '#455A64',

    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',

    // Text
    onPrimary: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#A1A1AA',

    // System
    error: '#F44336',

    // Optional extras
    outline: '#3F3F46',
  },
};

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const styles = appStyles;

  useEffect(() => {
    supabase.auth.getClaims().then(({ data }) => {
      const claims = data?.claims;
      if (claims) {
        setUserId(claims.sub)
      }
    })

    supabase.auth.onAuthStateChange(async (_event, _session) => {
      const {
        data,
      } = await supabase.auth.getClaims();
      const claims = data?.claims;
      if (claims) {
        setUserId(claims.sub)
      } else {
        setUserId(null)
      }
    })
  }, []);

  const toastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftWidth: 0,
          borderWidth: 1,
          borderColor: '#4CAF50',
          borderRadius: 4,
          backgroundColor: '#4CAF50',
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#fff',
        }}
        text2Style={{
          fontSize: 12,
          color: '#e5e5e5',
        }}
      />
    ),

    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftWidth: 0,
          borderWidth: 1,
          borderColor: '#F44336',
          borderRadius: 4,
          backgroundColor: '#F44336',
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#fff',
        }}
        text2Style={{
          fontSize: 12,
          color: '#e5e5e5',
        }}
      />
    ),

    info: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftWidth: 0,
          borderWidth: 1,
          borderColor: '#3b82f6',
          borderRadius: 4,
          backgroundColor: '#3b82f6',
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#fff',
        }}
        text2Style={{
          fontSize: 12,
          color: '#e5e5e5',
        }}
        text1NumberOfLines={0}
      />
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <ApolloProvider client={apolloClient}>
            <View style={styles.container}>
              {userId ? <ListInsights /> : <Auth />}
            </View>

            <Toast
              config={toastConfig}
            />
          </ApolloProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}


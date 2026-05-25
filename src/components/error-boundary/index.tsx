import React from 'react';

import { styles } from './styles';

import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Something went wrong
        </Text>

        <Text style={styles.message}>
          {JSON.stringify(error, null, 2)}
        </Text>

        <Pressable
          style={styles.button}
          onPress={resetErrorBoundary}
        >
          <Text style={styles.buttonText}>
            Retry
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type Props = {
  children: React.ReactNode;
};

export default function AppErrorBoundary({
  children,
}: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Global Error:', error);
        console.error('Component Stack:', info.componentStack);

        // Send to Sentry/Crashlytics here
      }}
      onReset={() => {
        // optional: clear app state/query cache/etc
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

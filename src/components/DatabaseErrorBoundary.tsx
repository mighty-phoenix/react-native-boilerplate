import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text } from 'react-native';

function DatabaseErrorFallback({ error }: { error: Error }) {
  return (
    <View>
      <Text>Something went wrong with the database:</Text>
      <Text>{error.message}</Text>
    </View>
  );
}

export function DatabaseErrorBoundary({ children }: React.PropsWithChildren) {
  return (
    <ErrorBoundary FallbackComponent={DatabaseErrorFallback}>
      {children}
    </ErrorBoundary>
  );
} 
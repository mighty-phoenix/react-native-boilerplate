import 'react-native-gesture-handler';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MMKV } from 'react-native-mmkv';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';
import { database } from '@/services/database/config';
import { DatabaseErrorBoundary } from '@/components/DatabaseErrorBoundary';

import '@/translations';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

export const storage = new MMKV();

function App() {
  return (
    <DatabaseErrorBoundary>
      <DatabaseProvider database={database}>
        <GestureHandlerRootView>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider storage={storage}>
              <ApplicationNavigator />
            </ThemeProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </DatabaseProvider>
    </DatabaseErrorBoundary>
  );
}

export default App;

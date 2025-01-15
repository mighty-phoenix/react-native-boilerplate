import { useDatabase as useWatermelonDB } from '@nozbe/watermelondb/hooks';
import { useCallback, useMemo } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';

import { DatabaseService } from '@/services/database/DatabaseService';

export function useDatabase() {
  const database = useWatermelonDB();

  // Memoize database service instance
  const service = useMemo(() =>  new DatabaseService(database), [database]);

  // Optimized transaction wrapper
  const transaction = useCallback(async <T>(
    operation: () => Promise<T>,
    options: { timeout?: number; retries?: number } = {}
  ) => {
    const { timeout = 5000, retries = 3 } = options;
    let attempt = 0;

    while (attempt < retries) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database operation timeout')), timeout)
        );

        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
      } catch (error) {
        attempt++;
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }, []);

  return {
    database,
    service,
    transaction,
  };
}

// Higher-order component for reactive database queries
export const withDatabaseData = (mapQueryToProps: any) =>
  withObservables([], mapQueryToProps); 
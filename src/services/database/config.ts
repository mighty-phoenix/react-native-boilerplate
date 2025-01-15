import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import { User } from './models';
import { DatabaseService } from './DatabaseService';

const DB_NAME = 'fashnbuyDB';

// Optimize SQLite configuration
const sqliteConfig = {
  // Increase cache size for better performance
  dbName: DB_NAME,
  // Enable WAL mode for better write performance
  journalMode: 'WAL' as const,
  // Optimize for your specific use case
  synchronous: Platform.select({
    ios: 'NORMAL' as const, // Better performance on iOS
    android: 'OFF' as const, // Better performance on Android
  }),
  // Enable JSI for better native bridge performance
  jsi: true,
  // Experimental features for better performance
  experimentalUseJSI: true,
};

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  ...sqliteConfig,
});

interface DatabaseConfig {
  onSetUpError?: (error: Error) => void;
  onError?: (error: Error) => void;
  maxConnections?: number;
  experimentalUseQueryCache?: boolean;
}

const getDatabaseConfig = (): DatabaseConfig => ({
  // Increase the maximum number of concurrent connections
  maxConnections: Platform.select({ ios: 4, android: 3 }),
  // Enable query caching
  experimentalUseQueryCache: true,
  onSetUpError: (error: Error) => {
    if (__DEV__) {
      console.error('Database setup error:', error);
    }
    // In production, send to error reporting service
  },
});

// Initialize database with optimized configuration
export const database = new Database({
  adapter,
  modelClasses: [User],
  ...getDatabaseConfig(),
});

export const databaseService = new DatabaseService(database); 
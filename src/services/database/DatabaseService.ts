import { Database, Q } from '@nozbe/watermelondb';
import { firstValueFrom } from 'rxjs';
import {LRUCache} from 'lru-cache';

interface BatchRecord {
  collection: string;
  data: Record<string, unknown>;
}

import { User } from './models';

export class DatabaseService {
  private database: Database;
  private queryCache: LRUCache<string, any>;

  constructor(database: Database) {
    this.database = database;
    // Initialize LRU cache for query results
    this.queryCache = new LRUCache({
      maxSize: 500, // Maximum number of items to store
      ttl: 1000 * 60 * 5, // Items expire after 5 minutes
    });
  }

  // Sanitize input to prevent SQL injection
  private sanitize(input: string): string {
    return Q.sanitizeLikeString(input);
  }

  // Get collections with type safety
  private get users() {
    return this.database.collections.get<User>('users');
  }

  // Optimized batch operations
  async batchCreate(records: BatchRecord[]) {
    return await this.database.write(async () => {
      const preparedRecords = records.map(({ collection, data }) =>
        this.database.collections
          .get(collection)
          .prepareCreate((record) => {
            Object.assign(record, this.sanitizeData(data));
          })
      );

      // Use chunks for large batches to prevent memory issues
      const CHUNK_SIZE = 100;
      for (let i = 0; i < preparedRecords.length; i += CHUNK_SIZE) {
        const chunk = preparedRecords.slice(i, i + CHUNK_SIZE);
        await this.database.batch(chunk);
      }
    });
  }

  // Optimized query with caching
  async queryUsers(query: string, page = 1, limit = 20) {
    const cacheKey = `users_${query}_${page}_${limit}`;
    const cached = this.queryCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const sanitizedQuery = this.sanitize(query);
    const results = await firstValueFrom(
      this.users
        .query(Q.where('name', Q.like(`%${sanitizedQuery}%`)))
        .extend(Q.sortBy('created_at', Q.desc))
        .observe()
    ).then(data => data.slice((page - 1) * limit, page * limit));

    this.queryCache.set(cacheKey, results);
    return results;
  }

  // Optimized bulk operations
  async bulkDelete(ids: string[]) {
    await this.database.write(async () => {
      const records = await this.users.query(Q.where('id', Q.oneOf(ids))).fetch();
      await this.database.batch(records.map(record => record.prepareDestroyPermanently()));
    });
  }

  // Memory-efficient data sanitization
  private sanitizeData(data: Record<string, unknown>) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? Q.sanitizeLikeString(value) : value;
      return acc;
    }, {} as Record<string, unknown>);
  }
} 
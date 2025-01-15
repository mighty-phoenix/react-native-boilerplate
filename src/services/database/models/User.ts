import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, lazy } from '@nozbe/watermelondb/decorators';
import { Q } from '@nozbe/watermelondb';

export interface UserProps {
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Model implements UserProps {
  static table = 'users';
  
  static associations = {
    preferences: { type: 'belongs_to' as const, key: 'user_id' },
    settings: { type: 'belongs_to' as const, key: 'user_id' }
  };

  // Define indexes for better query performance
  static indexes = [
    { name: 'name_idx', columns: ['name'] },
    { name: 'created_at_idx', columns: ['created_at'] },
  ];

  @field('name') name!: string;
  @field('email') email!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  
  // Lazy loading for expensive computations
  @lazy
  async fullProfile() {
    // Fetch related data only when needed
    const [preferences, settings] = await Promise.all([
      this.collections.get('preferences').query(Q.where('user_id', this.id)).fetch(),
      this.collections.get('settings').query(Q.where('user_id', this.id)).fetch(),
    ]);
    return { ...this, preferences: preferences[0], settings: settings[0] };
  }

  // Add validation
  async validateFields(): Promise<void> {
    if (!this.name || this.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (this.email && !this.email.includes('@')) {
      throw new Error('Invalid email format');
    }
  }
} 
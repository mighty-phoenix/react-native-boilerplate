import { request } from '@/services/request';

import { userSchema } from './schema';

export const UserServices = {
  fetchOne: async (id: number) => {
    const response = await request.get(`users/${id}`).json();
    return userSchema.parse(response);
  },
};

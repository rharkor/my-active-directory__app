import { apiGetUser } from '@/lib/api-calls';
import { UserSchema } from '@/types/api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import * as z from 'zod';

interface UsersState {
  users: {
    [id: string]: z.infer<typeof UserSchema>;
  }; //? Mapping by user id
  loadUser: typeof apiGetUser;
  getUser: typeof apiGetUser; //? Same as loadUser except that if the user is already loaded, it will return it
}

export const useUsersStore = create<UsersState>()(
  devtools(
    persist(
      (set, get) => ({
        users: {},
        loadUser: async (id: string, router: AppRouterInstance) => {
          const user = await apiGetUser(id, router);
          set(
            produce((state) => {
              state.users[id] = user;
              return state;
            }),
          );
          return user;
        },
        getUser: async (id: string, router: AppRouterInstance) => {
          const state = get();
          const user = state.users[id];
          if (user) return user;
          return state.loadUser(id, router);
        },
      }),
      {
        name: 'users-store',
      },
    ),
  ),
);

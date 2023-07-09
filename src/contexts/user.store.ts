import { apiProfile } from '@/lib/auth-calls';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { create } from 'zustand';
import {
  devtools,
  persist,
  // persist
} from 'zustand/middleware';

interface UserState {
  profile:
    | (typeof apiProfile extends (router: AppRouterInstance) => Promise<infer T>
        ? T
        : never)
    | null;
  loadProfile: (router: AppRouterInstance) => Promise<UserState['profile']>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        profile: null,
        loadProfile: async (router: AppRouterInstance) => {
          //? load the profile
          const profile = await apiProfile(router);
          set({ profile });
          return profile;
        },
      }),
      {
        name: 'user-store',
      },
    ),
  ),
);

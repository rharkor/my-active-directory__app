'use client';

import { Separator } from '@/components/ui/separator';
import { TypographyH1 } from '@/components/ui/typography';
import { getUserDisplayName } from '@/lib/utils';
import { SidebarNav } from '../../profile/components/sidebar-nav';
import { useCallback, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useUsersStore } from '@/contexts/users.store';

const sidebarNavItems = (userId: string) => [
  {
    title: 'Account',
    href: `/users/${userId}`,
  },
  {
    title: 'Metadata',
    href: `/users/${userId}/metadata`,
  },
];

export default function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  const router = useRouter();
  const loadUser = useUsersStore((state) => state.loadUser);
  const user = useUsersStore((state) => state.users[params.userId]);

  const fetchUser = useCallback(() => {
    loadUser(params.userId, router);
  }, [loadUser, params.userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <main className="space-y-6 container mt-8 flex-1 flex flex-col">
      <div className="space-y-0.5">
        {user ? (
          <TypographyH1>{getUserDisplayName(user)}</TypographyH1>
        ) : (
          <Skeleton className="h-12 w-40" />
        )}
        <p className="text-muted-foreground">
          Edit user account settings and metadata.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 flex-1">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems(params.userId)} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </main>
  );
}

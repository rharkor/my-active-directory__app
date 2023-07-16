'use client';

import EmailForm from '@/app/(app)/profile/components/email-form';
import PasswordForm from '@/app/(app)/profile/components/password-form';
import ProfileForm from '@/app/(app)/profile/components/profile-form';
import UsernameForm from '@/app/(app)/profile/components/username-form';
import { Separator } from '@/components/ui/separator';
import { useUsersStore } from '@/contexts/users.store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function UserPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const user = useUsersStore((state) => state.users[userId]);
  const loadUser = useUsersStore((state) => state.loadUser);

  const refreshCallback = useCallback(async () => {
    await loadUser(userId, router);
  }, [loadUser, router, userId]);

  return (
    <section className="space-y-6 mb-8">
      <header>
        <h3 className="text-lg font-medium">User Profile</h3>
        <p className="text-sm text-muted-foreground">
          You can change user information here.
        </p>
      </header>
      <ProfileForm
        user={user}
        skeleton={!user}
        refreshCallback={refreshCallback}
        successMessage="User updated successfully."
        errorMessage="Error updating user."
      />
      <Separator />
      <section>
        <header>
          <h3 className="text-lg font-medium">Login &amp; Security</h3>
        </header>
        <EmailForm
          user={user}
          skeleton={!user}
          successMessage="User updated successfully."
          errorMessage="Error updating user."
        />
        <UsernameForm
          user={user}
          skeleton={!user}
          successMessage="User updated successfully."
          errorMessage="Error updating user."
        />
        <PasswordForm
          user={user}
          skeleton={!user}
          successMessage="User updated successfully."
          errorMessage="Error updating user."
        />
      </section>
    </section>
  );
}

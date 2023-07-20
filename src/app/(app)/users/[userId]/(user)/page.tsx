'use client';

import DeleteForm from '@/app/(app)/profile/components/delete-form';
import EmailForm from '@/app/(app)/profile/components/email-form';
import PasswordForm from '@/app/(app)/profile/components/password-form';
import ProfileForm from '@/app/(app)/profile/components/profile-form';
import Roles from '@/app/(app)/profile/components/roles';
import SysRoles from '@/app/(app)/profile/components/sysroles';
import UsernameForm from '@/app/(app)/profile/components/username-form';
import { Separator } from '@/components/ui/separator';
import { useUsersStore } from '@/contexts/users.store';
import { getUserDisplayName } from '@/lib/utils';
import { UserSchema } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import * as z from 'zod';

export default function UserPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const user: z.infer<typeof UserSchema> | null =
    useUsersStore((state) => state.users[userId]) ?? null;
  const loadUser = useUsersStore((state) => state.loadUser);

  const refreshCallback = useCallback(async () => {
    await loadUser(userId, router);
  }, [loadUser, router, userId]);

  const userDisplayName = getUserDisplayName(user, true);

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
      <section>
        <header>
          <h3 className="text-lg font-medium">Roles</h3>
        </header>
        <Roles user={user} />
      </section>
      <section>
        <header>
          <h3 className="text-lg font-medium">System Roles</h3>
        </header>
        <SysRoles user={user} />
      </section>
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
      <Separator />
      <DeleteForm
        buttonMessage="Delete the account"
        confirmMessage={
          <>
            This action cannot be undone. This will permanently delete
            {userDisplayName ? (
              <code className="text-white mx-1">{userDisplayName}</code>
            ) : (
              'this account'
            )}{' '}
            and remove his data from our servers.
          </>
        }
        forceDelete={true}
        user={user}
        skeleton={false}
        successMessage="User deleted successfully."
        errorMessage="Error deleting user."
      />
    </section>
  );
}

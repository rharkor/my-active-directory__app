'use client';

import DeleteForm from '@/app/(app)/profile/components/delete-form';
import EmailForm from '@/app/(app)/profile/components/email-form';
import PasswordForm from '@/app/(app)/profile/components/password-form';
import ProfileForm from '@/app/(app)/profile/components/profile-form';
import UsernameForm from '@/app/(app)/profile/components/username-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';
import Pagination from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useUsersStore } from '@/contexts/users.store';
import { apiGetUserRoles, apiUpdateUser } from '@/lib/auth-calls';
import { UnknowError } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getUserDisplayName } from '@/lib/utils';
import { ApiSchemas, UserSchema } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const updateRolesSchema = z.object({
  roles: z.array(z.string()),
});

const itemsPerPage = 20;

export default function UserPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const user: z.infer<typeof UserSchema> | undefined = useUsersStore(
    (state) => state.users[userId],
  );
  const loadUser = useUsersStore((state) => state.loadUser);

  const refreshCallback = useCallback(async () => {
    await loadUser(userId, router);
  }, [loadUser, router, userId]);

  const userDisplayName = getUserDisplayName(user, true);

  const [roles, setRoles] =
    useState<z.infer<typeof ApiSchemas.getUserRoles.response>>();
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  const form = useForm<z.infer<typeof updateRolesSchema>>({
    resolver: zodResolver(updateRolesSchema),
    defaultValues: {
      roles: user?.roles?.map((role) => role.name) ?? [],
    },
  });

  const [currentPage, setCurrentPage] = useState(1);

  const getRoles = useCallback(
    async (updateLoadingState = true) => {
      try {
        if (updateLoadingState) setIsRolesLoading(true);
        if (!user.id) throw new Error('User id not found');
        const roles = await apiGetUserRoles(
          user.id.toString(),
          router,
          currentPage.toString(),
          itemsPerPage.toString(),
        );
        setRoles(roles);
      } catch (error) {
        logger.error('Error fetching roles', error);
        if (typeof error === 'string') {
          toast({
            title: 'Error',
            description: error,
          });
        } else {
          toast({
            title: 'Error',
            description: UnknowError,
          });
        }
      } finally {
        if (updateLoadingState) setIsRolesLoading(false);
      }
    },
    [currentPage, user.id, router],
  );

  const onSubmit = useCallback(
    async (data: z.infer<typeof updateRolesSchema>) => {
      try {
        setIsRolesLoading(true);
        if (!user) throw new Error('User not found');
        await apiUpdateUser(user.id.toString(), { roles: data.roles }, router);
        await getRoles(false);
      } catch (error) {
        logger.error('Error updating user roles', error);
        if (typeof error === 'string') {
          toast({
            title: 'Error',
            description: error,
          });
        } else {
          toast({
            title: 'Error',
            description: UnknowError,
          });
        }
      } finally {
        setIsRolesLoading(false);
      }
    },
    [getRoles, router, user],
  );

  //? Update roles when user changes
  useEffect(() => {
    if (!roles) return;
    form.reset({
      roles: roles.data.map((role) => role.name) ?? [],
    });
  }, [form, roles]);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <FormField
              label="Roles"
              name="roles"
              type="role-box"
              placeholder="Select roles"
              form={form}
            />
            {roles && roles.meta.totalPages > 1 && (
              <Pagination
                currentPage={roles.meta.currentPage}
                totalPages={roles.meta.totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
            <Button
              type="submit"
              className="self-end"
              isLoading={isRolesLoading}
            >
              Update roles
            </Button>
          </form>
        </Form>
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

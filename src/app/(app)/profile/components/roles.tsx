'use client';

import { toast } from '@/components/ui/use-toast';
import { useUserStore } from '@/contexts/user.store';
import { apiGetUserRoles, apiUpdateUser } from '@/lib/auth-calls';
import { UnknowError } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { ApiSchemas, UserSchema } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const updateRolesSchema = z.object({
  roles: z.array(z.string()),
});

const itemsPerPage = 20;

export default function Roles({ user }: { user?: z.infer<typeof UserSchema> }) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const profile = user ?? userStoreProfile;
  const router = useRouter();

  const [roles, setRoles] =
    useState<z.infer<typeof ApiSchemas.getUserRoles.response>>();
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  const form = useForm<z.infer<typeof updateRolesSchema>>({
    resolver: zodResolver(updateRolesSchema),
    defaultValues: {
      roles: profile?.roles?.map((role) => role.name) ?? [],
    },
  });

  const [currentPage, setCurrentPage] = useState(1);

  const getRoles = useCallback(
    async (updateLoadingState = true) => {
      try {
        if (updateLoadingState) setIsRolesLoading(true);
        if (!profile?.id) throw new Error('User id not found');
        const roles = await apiGetUserRoles(
          profile.id.toString(),
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
    [currentPage, profile?.id, router],
  );

  const onSubmit = useCallback(
    async (data: z.infer<typeof updateRolesSchema>) => {
      try {
        setIsRolesLoading(true);
        if (!profile) throw new Error('User not found');
        await apiUpdateUser(
          profile.id.toString(),
          { roles: data.roles },
          router,
        );
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
    [getRoles, router, profile],
  );

  //? Update roles when profile changes
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
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
        <Button type="submit" className="self-end" isLoading={isRolesLoading}>
          Update roles
        </Button>
      </form>
    </Form>
  );
}

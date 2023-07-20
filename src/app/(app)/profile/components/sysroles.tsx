'use client';

import { toast } from '@/components/ui/use-toast';
import { useUserStore } from '@/contexts/user.store';
import { apiGetUserSysRoles, apiUpdateUser } from '@/lib/api-calls';
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
  sysroles: z.array(z.string()),
});

const itemsPerPage = 20;

export default function SysRoles({
  user,
}: {
  user?: z.infer<typeof UserSchema> | null;
}) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const profile = user === undefined ? userStoreProfile : user;
  const router = useRouter();

  const [roles, setRoles] =
    useState<z.infer<typeof ApiSchemas.getUserSysRoles.response>>();
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  const form = useForm<z.infer<typeof updateRolesSchema>>({
    resolver: zodResolver(updateRolesSchema),
    defaultValues: {
      sysroles: profile?.sysroles?.map((role) => role.name) ?? [],
    },
  });

  const [currentPage, setCurrentPage] = useState(1);

  const getRoles = useCallback(
    async (updateLoadingState = true) => {
      if (!profile?.id) return;
      try {
        if (updateLoadingState) setIsRolesLoading(true);
        const roles = await apiGetUserSysRoles(
          profile.id.toString(),
          router,
          currentPage.toString(),
          itemsPerPage.toString(),
        );
        setRoles(roles);
      } catch (error) {
        logger.error('Error fetching system roles', error);
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
          { sysroles: data.sysroles },
          router,
        );
        toast({
          title: 'Success',
          description: 'Roles updated successfully',
        });
        await getRoles(false);
      } catch (error) {
        logger.error('Error updating user system roles', error);
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
      sysroles: roles.data.map((role) => role.name) ?? [],
    });
  }, [form, roles]);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <FormField
          label="System roles"
          name="sysroles"
          type="sysrole-box"
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
          Update system roles
        </Button>
      </form>
    </Form>
  );
}

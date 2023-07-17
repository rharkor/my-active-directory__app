'use client';

import { toast } from '@/components/ui/use-toast';
import { useUserStore } from '@/contexts/user.store';
import { apiGetUserRoles } from '@/lib/auth-calls';
import { UnknowError } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { ApiSchemas, UserSchema } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import * as z from 'zod';
import { Badge } from '@/components/ui/badge';
import { badgeStyle } from '@/components/ui/fancy-box';

function RoleToken({
  role,
}: {
  role: z.infer<typeof ApiSchemas.getUserRoles.response>['data'][number];
}) {
  return (
    <Badge
      key={role.name}
      variant="outline"
      style={badgeStyle(role.color ?? 'var(--foreground)')}
      className="mb-2"
    >
      {role.name}
    </Badge>
  );
}

const itemsPerPage = 20;

export default function Roles({ user }: { user?: z.infer<typeof UserSchema> }) {
  const userStoreProfile = useUserStore((state) => state.profile);
  const profile = user ?? userStoreProfile;
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);

  const [roles, setRoles] =
    useState<z.infer<typeof ApiSchemas.getUserRoles.response>>();

  const getRoles = useCallback(async () => {
    try {
      if (!profile) throw new Error('User id not found');
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
    }
  }, [currentPage, profile, router]);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  return (
    <div className="mt-4">
      <div className="flex flex-row space-x-2 flex-wrap">
        {roles?.data.map((role) => <RoleToken role={role} key={role.id} />)}
      </div>
      {roles && roles.meta.totalPages > 1 && (
        <Pagination
          currentPage={roles.meta.currentPage}
          totalPages={roles.meta.totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

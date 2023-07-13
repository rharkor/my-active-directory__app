'use client';

import { apiGetAllRolesWithoutPagination } from '@/lib/auth-calls';
import { FancyBox, FancyBoxItem } from './fancy-box';

import { InputProps } from './input';
import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const RoleBox = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    placeholder?: string;
  }
>(
  (
    field: InputProps & {
      placeholder?: string;
    },
    ref,
  ) => {
    const router = useRouter();
    const [roles, setRoles] = React.useState<FancyBoxItem[]>([]);

    const getRoles = useCallback(async () => {
      const { data } = await apiGetAllRolesWithoutPagination(router);
      setRoles(
        data.map((role) => ({
          label: role.name,
          value: role.name,
          color: role.color,
        })),
      );
    }, [router]);

    useEffect(() => {
      getRoles();
    }, [getRoles]);

    return (
      <FancyBox
        ref={ref}
        items={roles}
        inputProps={field}
        placeholder="Select a role"
        commandPlaceholder="Search roles by name"
      />
    );
  },
);
RoleBox.displayName = 'RoleBox';

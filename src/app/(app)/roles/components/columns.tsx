'use client';

import * as z from 'zod';
import { RoleSchema } from '@/types/api';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<z.infer<typeof RoleSchema>>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: 'Unique Name',
  },
  {
    accessorKey: 'displayName',
    header: 'Display Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
];

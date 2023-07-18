'use client';

import { ApiSchemas, ServiceAccountSchema } from '@/types/api';

import {
  ColumnDefExtended,
  sortableHeader,
} from '@/components/ui/data-table-full';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export const getColumns: (
  showEditServiceAccountModal: (id: number) => () => void,
  deleteServiceAccount: (id: number) => () => Promise<void>,
) => ColumnDefExtended<
  typeof ServiceAccountSchema,
  typeof ApiSchemas.createServiceAccount.body,
  typeof ApiSchemas.updateServiceAccount.body
>[] = (showEditServiceAccountModal, deleteServiceAccount) => [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: sortableHeader('Name'),
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'e.g. boilerplate-backend',
    autoComplete: 'off',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'description',
    header: sortableHeader('Description'),
    type: 'text',
    name: 'description',
    label: 'Description',
    autoComplete: 'off',
    placeholder: 'e.g. Boilerplate backend service account',
    create: {
      defaultValue: '',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const serviceAccount = row.original as Zod.TypeOf<
        typeof ServiceAccountSchema
      >;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(serviceAccount.name)}
            >
              Copy name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={showEditServiceAccountModal(serviceAccount.id)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteServiceAccount(serviceAccount.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

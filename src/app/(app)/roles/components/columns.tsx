'use client';

import * as z from 'zod';
import { RoleSchema } from '@/types/api';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sortableHeader } from '@/components/ui/full-data-table';

export const getColumns: (
  showEditRoleModal: (id: number) => () => void,
  deleteRole: (id: number) => () => Promise<void>,
) => ColumnDef<z.infer<typeof RoleSchema>>[] = (
  showEditRoleModal,
  deleteRole,
) => [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: sortableHeader('Unique Name'),
  },
  {
    accessorKey: 'displayName',
    header: sortableHeader('Display Name'),
  },
  {
    accessorKey: 'description',
    header: sortableHeader('Description'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original;
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
              onClick={() => navigator.clipboard.writeText(role.name)}
            >
              Copy unique name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={showEditRoleModal(role.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteRole(role.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

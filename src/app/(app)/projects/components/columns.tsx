'use client';

import { ApiSchemas, RoleSchema } from '@/types/api';

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
  showEditModal: (id: number) => () => void,
  deleteProject: (id: number) => () => Promise<void>,
) => ColumnDefExtended<
  typeof RoleSchema,
  typeof ApiSchemas.createProject.body,
  typeof ApiSchemas.updateProject.body
>[] = (showEditModal, deleteProject) => [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'name',
    header: sortableHeader('Unique Name'),
    type: 'text',
    name: 'name',
    label: 'Unique Name',
    placeholder: 'e.g. admin',
    autoComplete: 'off',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'color',
    header: 'Color',
    type: 'color',
    name: 'color',
    label: 'Color',
    placeholder: 'e.g. #000000',
    create: {
      defaultValue: '#000000',
    },
    update: {
      defaultValue: '#000000',
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original as Zod.TypeOf<typeof RoleSchema>;
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
            <DropdownMenuItem onClick={showEditModal(role.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteProject(role.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

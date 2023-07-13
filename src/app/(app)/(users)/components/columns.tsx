'use client';

import { ApiSchemas, UserSchema } from '@/types/api';

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
import Link from 'next/link';

export const getColumns: () => ColumnDefExtended<
  typeof UserSchema,
  typeof ApiSchemas.createUser.body,
  typeof ApiSchemas.updateUser.body
>[] = () => [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'email',
    header: sortableHeader('Email'),
    type: 'text',
    name: 'email',
    label: 'Email',
    placeholder: 'e.g. test@mail.com',
    autoComplete: 'email',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'username',
    header: sortableHeader('Username'),
    type: 'text',
    name: 'username',
    label: 'Username',
    placeholder: 'e.g. groot',
    autoComplete: 'username',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'firstName',
    header: sortableHeader('First Name'),
    type: 'text',
    name: 'firstName',
    label: 'First Name',
    autoComplete: 'given-name',
    placeholder: 'e.g. Start',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'lastName',
    header: sortableHeader('Last Name'),
    type: 'text',
    name: 'lastName',
    label: 'Last Name',
    autoComplete: 'family-name',
    placeholder: 'e.g. Lord',
    create: {
      defaultValue: '',
    },
  },
  {
    accessorKey: 'activeRoles',
    header: sortableHeader('Active Roles'),
  },
  {
    accessorKey: 'roles',
    name: 'roles',
    forceHidden: true,
    type: 'role-box',
    label: 'Roles',
    create: {
      defaultValue: [],
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original as Zod.TypeOf<typeof UserSchema>;
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
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.username)}
            >
              Copy username
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/users/${user.id}`}>View user</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

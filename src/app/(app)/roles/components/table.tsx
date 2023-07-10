'use client';

import { useEffect, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { apiCreateRole, apiGetAllRoles } from '@/lib/auth-calls';
import { useRouter } from 'next/navigation';
import { ApiSchemas } from '@/types/api';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';

export default function Table() {
  const router = useRouter();
  const [roles, setRoles] = useState<z.infer<
    typeof ApiSchemas.getAllRoles.response
  > | null>(null);

  const [newRoleModalIsOpen, setNewRoleModalIsOpen] = useState(false);
  const [isNewRoleModalSubmitting, setIsNewRoleModalSubmitting] =
    useState(false);

  const showNewRoleModal = () => setNewRoleModalIsOpen(true);

  //? Define the form state
  const form = useForm<z.infer<typeof ApiSchemas.createRole.body>>({
    resolver: zodResolver(ApiSchemas.createRole.body),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
    },
  });

  //? Define the table state
  const table = useReactTable({
    data: roles?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  //? Fetch the roles
  useEffect(() => {
    const getRoles = async () => {
      const res = await apiGetAllRoles(router);
      setRoles(res);
    };
    getRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //? Create a new role
  const createRole = async (
    values: z.infer<typeof ApiSchemas.createRole.body>,
  ) => {
    try {
      setIsNewRoleModalSubmitting(true);
      await apiCreateRole(values, router);
      toast({
        title: 'Success',
        description: 'Role created successfully.',
        duration: 5000,
      });
      //? Refresh the roles
      const newRoles = await apiGetAllRoles(router);
      setRoles(newRoles);
      setNewRoleModalIsOpen(false);
    } catch (error) {
      logger.error('Error updating email', error);
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred.',
        });
      }
    } finally {
      setIsNewRoleModalSubmitting(false);
      form.reset();
    }
  };

  return (
    <div className="rounded-md border border-borderSecondary mt-8">
      <Dialog
        open={newRoleModalIsOpen}
        onOpenChange={(isOpen) => setNewRoleModalIsOpen(isOpen)}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b border-borderSecondary">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DialogTrigger asChild>
            <Button variant="default" onClick={showNewRoleModal}>
              New Role
            </Button>
          </DialogTrigger>
        </div>
        <DataTable columns={columns} table={table} />
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(createRole)}
              className="space-y-4 flex flex-col"
            >
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Create a new role to help you manage users in your
                  organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  form={form}
                  name="name"
                  label="Unique Name"
                  type="text"
                  placeholder="e.g. admin"
                  autoComplete="off"
                />
                <FormField
                  form={form}
                  name="displayName"
                  label="Display Name"
                  type="text"
                  placeholder="e.g. Administrator"
                  autoComplete="off"
                  description="The name that will be displayed to users."
                />
                <FormField
                  form={form}
                  name="description"
                  label="Description"
                  type="text"
                  placeholder="e.g. Administrator"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {isNewRoleModalSubmitting && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

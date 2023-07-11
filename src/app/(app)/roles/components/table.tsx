'use client';

import { useEffect, useMemo, useState } from 'react';
import { getColumns } from './columns';
import { DataTable } from './data-table';
import {
  apiCreateRole,
  apiDeleteRole,
  apiGetAllRoles,
  apiUpdateRole,
} from '@/lib/auth-calls';
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
import {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';
import FormField from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useDebounce } from 'usehooks-ts';

const updateRoleExtended = ApiSchemas.updateRole.body.extend({
  id: z.number(),
});

export default function Table() {
  const router = useRouter();
  const [roles, setRoles] = useState<z.infer<
    typeof ApiSchemas.getAllRoles.response
  > | null>(null);

  const [newRoleModalIsOpen, setNewRoleModalIsOpen] = useState(false);
  const [newRoleModalMode, setNewRoleModalMode] = useState<'create' | 'edit'>(
    'create',
  );

  const [isNewRoleModalSubmitting, setIsNewRoleModalSubmitting] =
    useState(false);
  const [roleToEdit, setRoleToEdit] = useState<z.infer<
    typeof updateRoleExtended
  > | null>(null);

  const showNewRoleModal = () => {
    if (newRoleModalMode !== 'create') setNewRoleModalMode('create');
    setNewRoleModalIsOpen(true);
  };

  const showEditRoleModal = (id: number) => () => {
    if (newRoleModalMode !== 'edit') setNewRoleModalMode('edit');
    const role = roles?.data.find((r) => r.id === id);
    if (!role) {
      logger.error('Could not find role to edit id:' + id);
      return;
    }
    updateForm.reset(role);
    setRoleToEdit(role);
    setNewRoleModalIsOpen(true);
  };

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

  //? Edit a role
  const editRole = async (
    id: number,
    values: z.infer<typeof ApiSchemas.updateRole.body>,
  ) => {
    try {
      setIsNewRoleModalSubmitting(true);
      await apiUpdateRole(id.toString(), values, router);
      toast({
        title: 'Success',
        description: 'Role updated successfully.',
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
      updateForm.reset();
    }
  };

  //? Delete a role
  const deleteRole = (id: number) => async () => {
    try {
      await apiDeleteRole(id.toString(), router);
      toast({
        title: 'Success',
        description: 'Role deleted successfully.',
        duration: 5000,
      });
      //? Refresh the roles
      const newRoles = await apiGetAllRoles(router);
      setRoles(newRoles);
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
    }
  };

  const columns = getColumns(showEditRoleModal, deleteRole);

  //? Define the form state
  const form = useForm<z.infer<typeof ApiSchemas.createRole.body>>({
    resolver: zodResolver(ApiSchemas.createRole.body),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
    },
  });
  const updateForm = useForm<z.infer<typeof ApiSchemas.updateRole.body>>({
    resolver: zodResolver(ApiSchemas.updateRole.body),
    defaultValues: {
      name: roleToEdit?.name ?? '',
      displayName: roleToEdit?.displayName ?? '',
      description: roleToEdit?.description ?? '',
    },
  });

  //? Define the table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const filters = useDebounce(columnFilters, 300);
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: roles?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: roles?.meta.totalPages ?? 1,
    state: {
      pagination,
      columnFilters,
      sorting,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    onColumnFiltersChange: setColumnFilters,
    manualFiltering: true,
    onSortingChange: setSorting,
    manualSorting: true,
  });

  const [rolesFething, setRolesFetching] = useState(false);

  const fetchRoles = async (
    pageIndex: number = table.getState().pagination.pageIndex,
    pageSize: number = table.getState().pagination.pageSize,
    filters: ColumnFiltersState = table.getState().columnFilters,
  ) => {
    setRolesFetching(true);
    try {
      const res = await apiGetAllRoles(
        router,
        (pageIndex + 1).toString(),
        pageSize.toString(),
        filters,
        sorting,
      );
      setRoles(res);
    } finally {
      setRolesFetching(false);
    }
  };

  //? Fetch the roles
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, filters, sorting]);

  return (
    <div className="rounded-md border border-borderSecondary mt-8 relative">
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
          <div className="flex">
            <DialogTrigger asChild>
              <Button variant="default" onClick={showNewRoleModal}>
                New Role
              </Button>
            </DialogTrigger>
            <Button className="ml-2" onClick={() => fetchRoles()}>
              <ReloadIcon
                className={cn(
                  'w-4 h-4',
                  rolesFething && roles !== null && 'animate-spin',
                )}
              />
            </Button>
          </div>
        </div>
        <DataTable columns={columns} table={table} isLoading={rolesFething} />
        <DataTablePagination table={table} />
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(createRole)}
              className={cn(
                'space-y-4 flex flex-col',
                newRoleModalMode === 'create' ? 'block' : 'hidden',
              )}
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
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit((values) => {
                if (roleToEdit) {
                  editRole(roleToEdit.id, values);
                } else {
                  throw new Error('Role to edit is undefined.');
                }
              })}
              className={cn(
                'space-y-4 flex flex-col',
                newRoleModalMode === 'edit' ? 'block' : 'hidden',
              )}
            >
              <DialogHeader>
                <DialogTitle>
                  Update {roleToEdit?.displayName ?? 'Role'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  form={updateForm}
                  name="name"
                  label="Unique Name"
                  type="text"
                  placeholder="e.g. admin"
                  autoComplete="off"
                />
                <FormField
                  form={updateForm}
                  name="displayName"
                  label="Display Name"
                  type="text"
                  placeholder="e.g. Administrator"
                  autoComplete="off"
                  description="The name that will be displayed to users."
                />
                <FormField
                  form={updateForm}
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

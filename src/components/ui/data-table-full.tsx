'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  HeaderContext,
  PaginationState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from './button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import * as z from 'zod';
import { logger } from '@/lib/logger';
import { PaginationSchema } from '@/types/api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { toast } from './use-toast';
import { DeepPartial, Path, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'usehooks-ts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';
import { ReloadIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { DataTable } from './data-table';
import { DataTablePagination } from './data-table-pagination';
import { Form } from './form';
import FormField, { FormFieldProps } from './form-field';
import { DialogClose } from '@radix-ui/react-dialog';
import { UnknowError } from '@/lib/constants';

export type ColumnDefExtended<
  TData extends z.AnyZodObject,
  TCreateSchema extends z.AnyZodObject,
  TUpdateSchema extends z.AnyZodObject,
  TValue = unknown,
> = ColumnDef<z.TypeOf<TData>, TValue> & {
  create?: Partial<Omit<FormFieldProps<TCreateSchema>, 'form'>> & {
    defaultValue?: unknown;
  };
  update?: Partial<Omit<FormFieldProps<TUpdateSchema>, 'form'>> & {
    defaultValue?: unknown;
  };
  forceHidden?: boolean;
} & Partial<Omit<FormFieldProps<TCreateSchema>, 'form'>>;

export const sortableHeader = <T,>(headerName: string) =>
  function sortableHeader({ column }: HeaderContext<T, unknown>) {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          const isSorted = column.getIsSorted();
          if (isSorted === 'asc' || isSorted === false) {
            column.toggleSorting(isSorted === 'asc');
          } else {
            column.clearSorting();
          }
        }}
      >
        {headerName}
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className="h-4 w-4 ml-1" />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className="h-4 w-4 ml-1" />
        ) : null}
      </Button>
    );
  };

const renderFormField = <TData extends z.AnyZodObject>(
  form: ReturnType<typeof useForm<z.infer<TData>>>,
  column?: Partial<Omit<FormFieldProps<TData>, 'form'>>,
) => {
  //? If one of the required props is missing, we don't render the form field
  if (!column || !column.name || !column.label || !column.type) {
    //? If one of the props is present, we log an error
    if (column && (column.label || column.type))
      logger.error('Missing column props on', column);
    return null;
  }

  return (
    <FormField
      form={form}
      name={column.name}
      label={column.label}
      type={column.type}
      placeholder={column.placeholder}
      autoComplete={column.autoComplete}
      description={column.description}
      key={column.name}
    />
  );
};

export interface DataTableFullProps<
  TRowType extends typeof PaginationSchema,
  TCreateSchema extends z.AnyZodObject,
  TUpdateSchema extends z.AnyZodObject,
> {
  createSchema: TCreateSchema;
  updateSchema: TUpdateSchema;
  getColumns: (
    showEditRowModal: (id: number) => () => void,
    deleteRow: (id: number) => () => Promise<void>,
  ) => ColumnDefExtended<
    z.infer<TRowType>['data'][number],
    TCreateSchema,
    TUpdateSchema
  >[];
  apiCreateRow: (
    values: z.TypeOf<z.Schema>,
    router: AppRouterInstance,
  ) => Promise<unknown>;
  apiUpdateRow?: (
    id: string,
    values: z.TypeOf<z.Schema>,
    router: AppRouterInstance,
  ) => Promise<unknown>;
  apiDeleteRow?: (id: string, router: AppRouterInstance) => Promise<unknown>;
  apiGetAllRows: (
    router: AppRouterInstance,
    page?: string,
    itemsPerPage?: string,
    filters?: ColumnFiltersState,
    sorting?: SortingState,
  ) => Promise<z.infer<typeof PaginationSchema>>;
  createRowSuccessMessage: string;
  createRowErrorMessage: string;
  updateRowSuccessMessage: string;
  updateRowErrorMessage: string;
  deleteRowSuccessMessage: string;
  deleteRowErrorMessage: string;
  defaultPageSize: number;
  getUpdateModalTitle: (row: z.TypeOf<TUpdateSchema>) => string;
  searchPlaceholder?: string;
  searchColumnName: keyof z.infer<TRowType>['data'][number];
  createRowButtonText: string;
  createRowModalTitle: string;
  createRowModalDescription?: string;
  onRowsFetched?: (rows: z.infer<TRowType>) => z.TypeOf<TRowType>;
}

export default function DataTableFull<
  TRowType extends typeof PaginationSchema,
  TCreateSchema extends z.AnyZodObject,
  TUpdateSchema extends z.AnyZodObject,
>({
  createSchema,
  updateSchema,
  getColumns,
  apiCreateRow,
  apiUpdateRow,
  apiDeleteRow,
  apiGetAllRows,
  createRowSuccessMessage,
  createRowErrorMessage,
  updateRowSuccessMessage,
  updateRowErrorMessage,
  deleteRowSuccessMessage,
  deleteRowErrorMessage,
  defaultPageSize,
  getUpdateModalTitle,
  searchPlaceholder,
  searchColumnName,
  createRowButtonText,
  createRowModalTitle,
  createRowModalDescription,
  onRowsFetched,
}: DataTableFullProps<TRowType, TCreateSchema, TUpdateSchema>) {
  const router = useRouter();
  //? Rows
  const [rows, setRows] = useState<z.infer<TRowType> | null>(null);

  const [rowModalIsOpen, setRowModalIsOpen] = useState(false);
  const [rowModalMode, setRowModalMode] = useState<'create' | 'edit'>('create');

  const [isRowModalSubmitting, setIsRowModalSubmitting] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<z.infer<
    typeof updateSchema
  > | null>(null);

  const showNewRowModal = () => {
    if (rowModalMode !== 'create') setRowModalMode('create');
    setRowModalIsOpen(true);
  };

  const showEditRowModal = (id: number) => () => {
    if (rowModalMode !== 'edit') setRowModalMode('edit');
    const row = rows?.data.find((r) => r.id === id);
    if (!row) {
      logger.error('Could not find row to edit id:' + id);
      return;
    }
    updateForm.reset(row);
    setRowToEdit(row);
    setRowModalIsOpen(true);
  };

  //? Refresh rows
  const refreshRows = async () => {
    //? Refresh the rows
    const newRows = (await apiGetAllRows(router)) as z.infer<TRowType>;
    setRows(newRows);
  };

  //? Create a new row
  const createRow = async (values: z.TypeOf<TCreateSchema>) => {
    try {
      setIsRowModalSubmitting(true);
      await apiCreateRow(values, router);
      toast({
        title: 'Success',
        description: createRowSuccessMessage,
        duration: 5000,
      });
      //? Refresh the rows
      await refreshRows();
      setRowModalIsOpen(false);
      createForm.reset();
    } catch (error) {
      logger.error(createRowErrorMessage, error);
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
      setIsRowModalSubmitting(false);
    }
  };

  //? Edit a row
  const editRow = async (id: number, values: z.TypeOf<TUpdateSchema>) => {
    try {
      if (!apiUpdateRow) throw new Error('apiUpdateRow is not defined');
      setIsRowModalSubmitting(true);
      await apiUpdateRow(id.toString(), values, router);
      toast({
        title: 'Success',
        description: updateRowSuccessMessage,
        duration: 5000,
      });
      //? Refresh the rows
      await refreshRows();
      setRowModalIsOpen(false);
      updateForm.reset();
    } catch (error) {
      logger.error(updateRowErrorMessage, error);
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
      setIsRowModalSubmitting(false);
    }
  };

  //? Delete a row
  const deleteRow = (id: number) => async () => {
    try {
      if (!apiDeleteRow) throw new Error('apiDeleteRow is not defined');
      await apiDeleteRow(id.toString(), router);
      toast({
        title: 'Success',
        description: deleteRowSuccessMessage,
        duration: 5000,
      });
      await refreshRows();
    } catch (error) {
      logger.error(deleteRowErrorMessage, error);
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
    }
  };

  const columns = getColumns(showEditRowModal, deleteRow);

  //? Define the forms state
  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: columns.reduce<DeepPartial<z.infer<typeof createSchema>>>(
      (acc, col) => {
        if (col.create && col.create.defaultValue !== undefined && col.name) {
          acc[col.name] = col.create.defaultValue as DeepPartial<
            z.infer<typeof createSchema>
          >[Path<z.infer<typeof createSchema>>];
        }
        return acc;
      },
      {} as DeepPartial<z.infer<typeof createSchema>>,
    ),
  });
  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: columns.reduce<DeepPartial<z.infer<typeof updateSchema>>>(
      (acc, col) => {
        if (col.update && col.update.defaultValue !== undefined && col.name) {
          acc[col.name] = col.update.defaultValue as DeepPartial<
            z.infer<typeof updateSchema>
          >[Path<z.infer<typeof updateSchema>>];
        }
        return acc;
      },
      {} as DeepPartial<z.infer<typeof updateSchema>>,
    ),
  });

  //? Define the table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: rows?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: rows?.meta.totalPages ?? 1,
    state: {
      pagination,
      columnFilters,
      sorting,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    onColumnFiltersChange: setColumnFilters,
    manualFiltering: true,
    onSortingChange: setSorting,
    manualSorting: true,
    onColumnVisibilityChange: setColumnVisibility,
  });

  //? Hide column marked as forceHidden
  const hideForceHiddenColumns = () => {
    const forceHiddenColumns = columns.filter((c) => c.forceHidden);
    if (forceHiddenColumns.length > 0) {
      table.getAllColumns().forEach((c) => {
        if (
          c.getIsVisible() &&
          forceHiddenColumns.some((f) => f.name === c.id)
        ) {
          c.toggleVisibility(false);
        }
      });
    }
  };
  useEffect(() => {
    hideForceHiddenColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [rowsFething, setRowsFetching] = useState(false);

  const fetchRows = async (
    pageIndex: number = table.getState().pagination.pageIndex,
    pageSize: number = table.getState().pagination.pageSize,
    filters: ColumnFiltersState = table.getState().columnFilters,
  ) => {
    setRowsFetching(true);
    try {
      let res = (await apiGetAllRows(
        router,
        (pageIndex + 1).toString(),
        pageSize.toString(),
        filters,
        sorting,
      )) as z.infer<TRowType>;
      if (onRowsFetched) {
        res = onRowsFetched(res);
      }
      setRows(res);
    } catch (error) {
      logger.error("Error while fetching rows", error);
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
      setRowsFetching(false);
    }
  };

  //? Fetch the rows
  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, filters, sorting]);

  return (
    <div className="rounded-md border border-borderSecondary mt-8 relative">
      <Dialog
        open={rowModalIsOpen}
        onOpenChange={(isOpen) => setRowModalIsOpen(isOpen)}
      >
        <div className="flex justify-between items-center px-4 py-2 border-b border-borderSecondary">
          <Input
            placeholder={searchPlaceholder}
            value={
              (table
                .getColumn(searchColumnName.toString())
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn(searchColumnName.toString())
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex">
            <DialogTrigger asChild>
              <Button variant="default" onClick={showNewRowModal}>
                {createRowButtonText}
              </Button>
            </DialogTrigger>
            <Button
              className="ml-2"
              onClick={() => fetchRows()}
              disabled={rowsFething}
            >
              <ReloadIcon
                className={cn(
                  'w-4 h-4',
                  rowsFething && rows !== null && 'animate-spin',
                )}
              />
            </Button>
          </div>
        </div>
        <DataTable columns={columns} table={table} isLoading={rowsFething} />
        <DataTablePagination table={table} />
        <DialogContent>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(createRow)}
              className={cn(
                'space-y-4 flex flex-col',
                rowModalMode === 'create' ? 'block' : 'hidden',
              )}
            >
              <DialogHeader>
                <DialogTitle>
                  {createRowModalTitle ?? 'Create a new row'}
                </DialogTitle>
                <DialogDescription>
                  {createRowModalDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {columns.map((column) => {
                  return renderFormField(createForm, {
                    ...column,
                    ...column.create,
                  });
                })}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" isLoading={isRowModalSubmitting}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit((values) => {
                if (rowToEdit) {
                  editRow(rowToEdit.id, values);
                } else {
                  throw new Error('Row to edit is undefined.');
                }
              })}
              className={cn(
                'space-y-4 flex flex-col',
                rowModalMode === 'edit' ? 'block' : 'hidden',
              )}
            >
              <DialogHeader>
                <DialogTitle>
                  {rowToEdit ? getUpdateModalTitle(rowToEdit) : 'Update'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {columns.map((column) => {
                  return renderFormField(updateForm, {
                    ...column,
                    ...column.update,
                  });
                })}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" isLoading={isRowModalSubmitting}>
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

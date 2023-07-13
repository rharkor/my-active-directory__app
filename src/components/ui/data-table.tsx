'use client';

import { Table as TTable, flexRender } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import IndeterminateProgressBar from '@/components/ui/indetermine-progress-bar';
import { ColumnDefExtended } from './data-table-full';
import * as z from 'zod';

interface DataTableProps<
  TData extends z.AnyZodObject,
  TCreateSchema extends z.AnyZodObject,
  TUpdateSchema extends z.AnyZodObject,
  TValue,
> {
  columns: ColumnDefExtended<TData, TCreateSchema, TUpdateSchema, TValue>[];
  table: TTable<TData>;
  isLoading?: boolean;
}

export function DataTable<
  TData extends z.AnyZodObject,
  TCreateSchema extends z.AnyZodObject,
  TUpdateSchema extends z.AnyZodObject,
  TValue,
>({
  columns,
  table,
  isLoading,
}: DataTableProps<TData, TCreateSchema, TUpdateSchema, TValue>) {
  const headers = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="absolute w-full">
        {isLoading && <IndeterminateProgressBar />}
      </div>
      <Table>
        <TableHeader className="border-borderSecondary">
          {headers.map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-borderSecondary">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="border-borderSecondary">
          {rows?.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-borderSecondary"
              >
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell key={cell.id}>
                    {columns[i].type === 'color' ? (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: cell.getValue() as string,
                        }}
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

'use client';

import { ColumnDef, Table as TTable, flexRender } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import IndeterminateProgressBar from '@/components/ui/indetermine-progress-bar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  table: TTable<TData>;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  table,
  isLoading,
}: DataTableProps<TData, TValue>) {
  return (
    <>
      <div className="absolute w-full">
        {isLoading && <IndeterminateProgressBar />}
      </div>
      <Table>
        <TableHeader className="border-borderSecondary">
          {table.getHeaderGroups().map((headerGroup) => (
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-borderSecondary"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

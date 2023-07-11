import { HeaderContext } from '@tanstack/react-table';
import { Button } from './button';
import { ArrowDown, ArrowUp } from 'lucide-react';

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

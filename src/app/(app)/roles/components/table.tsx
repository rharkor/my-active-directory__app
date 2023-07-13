'use client';

import DataTableFull from '@/components/ui/data-table-full';
import { ApiSchemas } from '@/types/api';
import {
  apiCreateRole,
  apiDeleteRole,
  apiGetAllRoles,
  apiUpdateRole,
} from '@/lib/auth-calls';
import { getColumns } from './columns';
import * as z from 'zod';

//? To avoid null values in the color column
const onRowsFetched = (
  data: z.infer<typeof ApiSchemas.getAllRoles.response>,
) => {
  return {
    ...data,
    data: data.data.map((row) => ({
      ...row,
      color: row.color || '',
    })),
  };
};

export default function Table() {
  return (
    <DataTableFull
      createSchema={ApiSchemas.createRole.body}
      updateSchema={ApiSchemas.updateRole.body}
      apiCreateRow={apiCreateRole}
      apiUpdateRow={apiUpdateRole}
      apiDeleteRow={apiDeleteRole}
      apiGetAllRows={apiGetAllRoles}
      createRowErrorMessage="Failed to create role"
      createRowSuccessMessage="Role created successfully"
      updateRowErrorMessage="Failed to update role"
      updateRowSuccessMessage="Role updated successfully"
      deleteRowErrorMessage="Failed to delete role"
      deleteRowSuccessMessage="Role deleted successfully"
      defaultPageSize={10}
      getUpdateModalTitle={(row) => `Edit role ${row.name}`}
      getColumns={getColumns}
      createRowButtonText="Create role"
      searchColumnName={'name'}
      searchPlaceholder="Search roles by name"
      createRowModalTitle="Create role"
      createRowModalDescription="Create a new row to help you manage users in your organization."
      onRowsFetched={onRowsFetched}
    />
  );
}

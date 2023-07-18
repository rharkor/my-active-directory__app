'use client';

import DataTableFull from '@/components/ui/data-table-full';
import { ApiSchemas } from '@/types/api';
import { apiCreateUser, apiGetAllUsers } from '@/lib/api-calls';
import { getColumns } from './columns';
import { useUserStore } from '@/contexts/user.store';

export default function Table() {
  const profile = useUserStore((state) => state.profile);

  return (
    <DataTableFull
      createSchema={ApiSchemas.createUser.body}
      updateSchema={ApiSchemas.updateUser.body}
      apiCreateRow={apiCreateUser}
      apiGetAllRows={apiGetAllUsers}
      createRowErrorMessage="Failed to create user"
      createRowSuccessMessage="User created successfully"
      updateRowErrorMessage="Failed to update user"
      updateRowSuccessMessage="User updated successfully"
      deleteRowErrorMessage="Failed to delete user"
      deleteRowSuccessMessage="User deleted successfully"
      defaultPageSize={10}
      getUpdateModalTitle={(row) =>
        `Edit user ${
          row.email || row.username || row.firstName + ' ' + row.lastName
        }`
      }
      getColumns={getColumns(profile)}
      createRowButtonText="Create user"
      searchColumnName={'email'}
      searchPlaceholder="Search users by email"
      createRowModalTitle="Create user"
      createRowModalDescription="The best way to create a new user is by using service account."
    />
  );
}

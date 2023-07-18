'use client';

import DataTableFull from '@/components/ui/data-table-full';
import { ApiSchemas } from '@/types/api';
import {
  apiCreateServiceAccount,
  apiDeleteServiceAccount,
  apiGetAllServiceAccounts,
  apiUpdateServiceAccount,
} from '@/lib/api-calls';
import { getColumns } from './columns';

export default function Table() {
  return (
    <DataTableFull
      createSchema={ApiSchemas.createServiceAccount.body}
      updateSchema={ApiSchemas.updateServiceAccount.body}
      apiCreateRow={apiCreateServiceAccount}
      apiUpdateRow={apiUpdateServiceAccount}
      apiDeleteRow={apiDeleteServiceAccount}
      apiGetAllRows={apiGetAllServiceAccounts}
      createRowErrorMessage="Failed to create service account"
      createRowSuccessMessage="Service account created successfully"
      updateRowErrorMessage="Failed to update service account"
      updateRowSuccessMessage="Service account updated successfully"
      deleteRowErrorMessage="Failed to delete service account"
      deleteRowSuccessMessage="Service account deleted successfully"
      defaultPageSize={10}
      getUpdateModalTitle={(row) => `Edit ${row.name}`}
      getColumns={getColumns}
      createRowButtonText="Create service account"
      searchColumnName={'name'}
      searchPlaceholder="Search by name"
      createRowModalTitle="Create service account"
      createRowModalDescription="Service accounts are used to authenticate your backends applications to the API."
    />
  );
}

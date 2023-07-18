'use client';

import DataTableFull from '@/components/ui/data-table-full';
import { ApiSchemas } from '@/types/api';
import {
  apiCreateServiceAccount,
  apiDeleteServiceAccount,
  apiGetAllServiceAccounts,
  apiResetServiceAccountToken,
  apiUpdateServiceAccount,
} from '@/lib/api-calls';
import { getColumns } from './columns';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';

export default function Table() {
  const router = useRouter();

  const handleResetToken = async (id: number) => {
    try {
      const res = await apiResetServiceAccountToken(id.toString(), router);
      navigator.clipboard.writeText(res.token);
      toast({
        title: 'Success',
        description:
          'Service account token reset successfully. Token copied to clipboard',
      });
    } catch (error) {
      logger.error('Error resetting service account token', error);
      if (typeof error === 'string') {
        toast({
          title: 'Error',
          description: error,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset service account token',
        });
      }
    }
  };

  return (
    <DataTableFull
      createSchema={ApiSchemas.createServiceAccount.body}
      updateSchema={ApiSchemas.updateServiceAccount.body}
      apiCreateRow={apiCreateServiceAccount}
      apiUpdateRow={apiUpdateServiceAccount}
      apiDeleteRow={apiDeleteServiceAccount}
      apiGetAllRows={apiGetAllServiceAccounts}
      createRowErrorMessage="Failed to create service account"
      createRowSuccessMessage="Service account created successfully, token copied to clipboard"
      updateRowErrorMessage="Failed to update service account"
      updateRowSuccessMessage="Service account updated successfully"
      deleteRowErrorMessage="Failed to delete service account"
      deleteRowSuccessMessage="Service account deleted successfully"
      defaultPageSize={10}
      getUpdateModalTitle={(row) => `Edit ${row.name}`}
      getColumns={getColumns(handleResetToken)}
      createRowButtonText="Create service account"
      searchColumnName={'name'}
      searchPlaceholder="Search by name"
      createRowModalTitle="Create service account"
      createRowModalDescription="Service accounts are used to authenticate your backends applications to the API."
      onRowCreated={(row) => {
        //? Copy the token to the clipboard
        navigator.clipboard.writeText(row.token);
      }}
    />
  );
}

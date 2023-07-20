'use client';

import DataTableFull from '@/components/ui/data-table-full';
import { ApiSchemas } from '@/types/api';
import {
  apiCreateProject,
  apiDeleteProject,
  apiUpdateProject,
  apiGetAllProjects,
} from '@/lib/api-calls';
import { getColumns } from './columns';
import * as z from 'zod';

//? To avoid null values in the color column
const onRowsFetched = (
  data: z.infer<typeof ApiSchemas.getAllProjects.response>,
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
      createSchema={ApiSchemas.createProject.body}
      updateSchema={ApiSchemas.updateProject.body}
      apiCreateRow={apiCreateProject}
      apiUpdateRow={apiUpdateProject}
      apiDeleteRow={apiDeleteProject}
      apiGetAllRows={apiGetAllProjects}
      createRowErrorMessage="Failed to create project"
      createRowSuccessMessage="Project created successfully"
      updateRowErrorMessage="Failed to update project"
      updateRowSuccessMessage="Project updated successfully"
      deleteRowErrorMessage="Failed to delete project"
      deleteRowSuccessMessage="Project deleted successfully"
      defaultPageSize={10}
      getUpdateModalTitle={(row) => `Edit project ${row.name}`}
      getColumns={getColumns}
      createRowButtonText="Create project"
      searchColumnName={'name'}
      searchPlaceholder="Search projects by name"
      createRowModalTitle="Create project"
      createRowModalDescription="Dispatch your users through projects and manage them with service accounts."
      onRowsFetched={onRowsFetched}
    />
  );
}

/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { DataTableColumnHeader } from "../shared/dataTableColumnHeader";

export const deliver = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Сортировать:" />
    ),
  },
  {
    accessorKey: "login",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="по статусу" />
    ),
  },
  {
    accessorKey: "role_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="по числу заказов" />
    ),
  },
  {
    accessorKey: "last_in",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="по дате регистрации" />
    ),
  }
];

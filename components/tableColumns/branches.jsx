/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { DataTableColumnHeader } from "../shared/dataTableColumnHeader";
import DeleteItem from "../pages/admin/deleteItems";

export const branches = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Названия" />
    ),
  },
  // {
  //   accessorKey: "phone",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Номер телефона" />
  //   ),
  // },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Адрес филиала" />
    ),
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => <DeleteItem payment={row.original} />,
  // },
];

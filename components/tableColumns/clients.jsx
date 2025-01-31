/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { DataTableColumnHeader } from "../shared/dataTableColumnHeader";
import DeleteItem from "../pages/admin/deleteItems";

export const clients = [
  {
    accessorKey: "firstname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Фамилия" />
    ),
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Имя" />
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Адрес" />
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Телефон" />
    ),
  },
  {
    accessorKey: "bonus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Бонусные клиенты" />
    ),
  },
  {
    accessorKey: "client_groups_discount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Групповая скидка" />
    ),
  },
  {
    accessorKey: "discount_per",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Персональная скидка" />
    ),
  },
  {
    accessorKey: "total_payed_sum",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Общая сумма" />
    ),
  },
  {
    accessorKey: "birthday",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="День рождения клиента" />
    ),
  },
  {
    accessorKey: "date_activale",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Дата активации" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DeleteItem payment={row.original} />,
  },
];

import type { Model } from "../types/Model";
import { type ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

export function modelColumns(
  handleRowClick?: (row: Model) => void
): ColumnDef<Model>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "ID",
      accessorKey: "id",
      filterFn: (row, columnId, filterValue) => {
        // Converte o valor da linha (que é uma string) para string
        const rowValue = String(row.getValue(columnId));
        const filter = String(filterValue);
        return rowValue.includes(filter);
      },
      header: "ID",
      enableHiding: false,
    },
    {
      id: "Nome",
      accessorFn: (row) => row.name,
      header: "Nome",
      cell: ({ row }) => (
        <span
          className="text-primary cursor-pointer underline"
          onClick={() => handleRowClick && handleRowClick(row.original)}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      id: "Tenant ID",
      accessorFn: (row) => row.tenant_id || "N/A",
      header: "Tenant ID",
      cell: ({ getValue }) => getValue() || "-",
    },
    {
      id: "Criado em",
      accessorFn: (row) => row.created_at || "",
      header: "Criado em",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return "-";
        try {
          const date = new Date(value);
          return date.toLocaleString("pt-BR");
        } catch {
          return value;
        }
      },
    },
  ];
}


import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenericTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean; // Adicionando isLoading como prop opcional
  handleRowClick?: (row: TData) => void; // Callback opcional para lidar com cliques na linha
  dataName?: string; // Nome do registro, usado para mensagens de feedback
  handleSelectionChange?: (selectedRows: TData[]) => void; // ADICIONE ESTA LINHA
  defaultSort?: SortingState; // Adicione esta linha
}

export function GenericTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  dataName = "registro",
  handleSelectionChange,
  defaultSort = [], // valor padrão vazio
}: GenericTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSort);
  console.log("Sorting state:", sorting);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [filterColumn, setFilterColumn] = useState<string>(() => {
    const first = columns.find((col) => !col.id?.startsWith("select"));
    return first?.id || columns[0]?.id || "";
  });
  const [rowSelection, setRowSelection] = React.useState({});

  // Configuração da tabela com React Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  React.useEffect(() => {
    if (handleSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      handleSelectionChange(selectedRows);
    }
    // eslint-disable-next-line
  }, [rowSelection]);

  // Pegue as colunas visíveis e filtráveis
  const filterableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible() && col.id !== "select");

  const selectedColumnDef = filterableColumns.find(
    (col) => col.id === filterColumn
  )?.columnDef;
  const selectedColumnHeader =
    typeof selectedColumnDef?.header === "string"
      ? selectedColumnDef.header
      : filterColumn;

  // Atualize o filtro para a coluna selecionada
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.getColumn(filterColumn)?.setFilterValue(event.target.value);
  };

  // Quando trocar a coluna, limpe o filtro antigo
  const handleSelectColumn = (colId: string) => {
    // Limpa o filtro da coluna anterior
    table.getColumn(filterColumn)?.setFilterValue("");
    setFilterColumn(colId);
  };

  // Valor do filtro da coluna selecionada
  const filterValue =
    (table.getColumn(filterColumn)?.getFilterValue() as string) ?? "";

  return (
    <div>
      <div className="flex justify-between items-center space-x-2 mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder={`Filtrar por ${selectedColumnHeader.toLowerCase()}...`}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            // Desabilita o input se nenhuma coluna filtrável for selecionada
            disabled={!filterColumn}
          />
          <Select value={filterColumn} onValueChange={handleSelectColumn}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Coluna" />
            </SelectTrigger>
            <SelectContent>
              {filterableColumns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {typeof col.columnDef.header === "string"
                    ? col.columnDef.header
                    : col.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_col, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted"
                  //onClick={() => handleRowClick && handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {`Nenhum ${dataName} encontrado.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* Opcional: Mostrar contagem de linhas selecionadas */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
            </span>
          )}
          {/* Mostrar total de registros na view atual (após filtros, se houver) */}
          <span className="ml-2">
            {`Total de ${table.getFilteredRowModel().rows.length} ${dataName}(s).`}
          </span>
        </div>

        <div className="flex items-center space-x-1 ml-5 mr-5">
          <span className="text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount() > 0 ? table.getPageCount() : 1}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex" // Esconder em telas pequenas
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex" // Esconder em telas pequenas
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

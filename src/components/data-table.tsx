import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PenLine, Trash2, Power, ArrowLeft, ArrowRight } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "react-i18next"
import { useState } from "react"

function TableSkeleton({ columns, rows = 10 }: { columns: number, rows?: number }) {
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columns).fill(0).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rows).fill(0).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array(columns).fill(0).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-center gap-2 mt-4 pb-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export interface Column<T> {
  key: string;
  label: string;
  format?: (value: any, row?: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  responsive?: boolean; 
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggleActive?: (item: T) => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onToggleActive,
  onRowClick,
  loading = false,
  pagination,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const showActions = Boolean(onEdit || onDelete || onToggleActive);
  const [pageChanging, setPageChanging] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (pagination) {
      setPageChanging(true);
      pagination.onPageChange(newPage);
      setTimeout(() => setPageChanging(false), 500);
    }
  };

  const skeletonRows = data.length > 0 ? data.length : 10;

  if (loading || pageChanging) {
    return <TableSkeleton 
      columns={columns.length + (showActions ? 1 : 0)} 
      rows={skeletonRows}
    />;
  }

  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={`whitespace-nowrap ${column.responsive ? 'hidden md:table-cell' : ''}`}
              >
                {column.label}
              </TableHead>
            ))}
            {showActions && <TableHead className="text-right">{t("common.actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="h-24 text-center">
                {t("common.noData")}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={`row-${item.id}-${index}`} 
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={`${item.id}-${index}-${column.key}`} 
                    className={`font-medium text-gray-900 dark:text-white ${column.responsive ? 'hidden md:table-cell' : ''}`}
                  >
                    {column.render 
                      ? column.render(item)
                      : column.format 
                        ? column.format(item[column.key as keyof T], item)
                        : String(item[column.key as keyof T])}
                  </TableCell>
                ))}
                {showActions && (
                  <TableCell className="flex gap-2 justify-end">
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                        <PenLine className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
                        <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                    {onToggleActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onToggleActive(item); }}
                        className={item.status ? "text-green-500" : "text-red-500"}
                      >
                        <Power className="h-4 w-4" />
                        <span className="sr-only">Toggle Active</span>
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading || pageChanging}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="py-2">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || loading || pageChanging}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

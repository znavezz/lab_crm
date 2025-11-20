"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  keyExtractor,
}: ResponsiveTableProps<T>) {
  const getValue = (item: T, key: keyof T | string): ReactNode => {
    if (typeof key === 'string' && key in item) {
      const value = item[key as keyof T];
      // Convert to ReactNode - handle primitives and null/undefined
      if (value === null || value === undefined) {
        return null;
      }
      return String(value);
    }
    return null;
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-3">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={String(col.key)} className="flex justify-between items-start">
                    <span className="text-muted-foreground">
                      {col.mobileLabel || col.header}:
                    </span>
                    <span className="text-right ml-4">
                      {col.render
                        ? col.render(item)
                        : getValue(item, col.key)}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Tablet/Desktop Table View */}
      <div className="hidden md:block rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className={
                      col.hideOnTablet ? "hidden lg:table-cell" : ""
                    }
                  >
                    {col.header}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={onRowClick ? "cursor-pointer" : ""}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={
                      col.hideOnTablet ? "hidden lg:table-cell" : ""
                    }
                  >
                    {col.render ? col.render(item) : getValue(item, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}


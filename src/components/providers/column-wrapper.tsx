"use client";
import React from "react";
import { DataTable } from "@/components/table/data-table";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

type ColumnWrapperProps<T> = {
  column: (t: (key: string) => string) => ColumnDef<T>[];
  data: T[];
  tag: "products" | "suppliers" | "transactions" | "users" | "invitations";
};

const ColumnWrapper = <T,>({ column, data, tag }: ColumnWrapperProps<T>) => {
  const t = useTranslations("common");
  return <DataTable columns={column(t)} data={data} tag={tag} />;
};

export default ColumnWrapper;

"use client";
import { createContext, use } from "react";

export const CommonChartContext = createContext(null)

export function useCommonChart() {
  const ctx = use(CommonChartContext)
  if (!ctx) {
    throw new Error("<Legend /> / <Tooltip /> must be used within a chart root.")
  }
  return ctx
}

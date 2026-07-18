import { createContext, use } from "react"

export const SeriesContext = createContext(null)

/** Boundary guard for series-scoped markers (`<Dot>`, `<ActiveDot>`). */
export function useSeries(part) {
  const ctx = use(SeriesContext)
  if (!ctx) {
    throw new Error(`<${part} /> must be rendered inside a series (e.g. <Area />).`)
  }
  return ctx
}

import { useEffect } from "react"
import { usePolarPart } from "./polar-context"

/**
 * The pie/donut ring. Slices come from the chart `data` (one per row); this part
 * sets the shared fill variant. The dithered wedges are painted on the canvas.
 */
export function Pie({
  variant = "gradient"
}) {
  const ctx = usePolarPart("Pie", "pie")
  const { registerVariant, unregisterVariant } = ctx

  useEffect(() => {
    registerVariant("*", variant)
    return () => unregisterVariant("*");
  }, [variant, registerVariant, unregisterVariant])

  return null
}

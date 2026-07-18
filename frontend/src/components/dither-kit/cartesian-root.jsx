import { Children, isValidElement } from "react";
import { ChartContext, useChartController } from "./chart-context";
import { CommonChartContext } from "./common-context"
import { cn } from "./lib"
import { useChartDimensions } from "./use-chart-dimensions"

const DEFAULT_MARGINS = {
  top: 10,
  right: 12,
  bottom: 22,
  left: 36,
}

/** Which render layer a composed part targets — defaults to the front SVG. */
function layerOf(node) {
  if (!isValidElement(node) || typeof node.type === "string") return "svg"
  return (node.type).chartLayer ?? "svg";
}

/**
 * Shared root for the cartesian dither charts (area, line, bar). Owns the
 * measured size, the shared context, and pointer interaction; every visual is
 * composed as children. Back chrome (grid) sits behind the dither canvas; the
 * canvas paints the fill/line/bars + stars; front chrome (axes, dots) and DOM
 * legend/tooltip layer on top. `chartType` drives the scales/interaction and the
 * `Canvas` prop supplies the family's painter (continuous for area/line, bars for
 * bar) — so each chart ships only its own canvas.
 */
export function CartesianRoot(
  {
    chartType,
    Canvas,
    data,
    config,
    children,
    stackType = "default",
    margins: marginsProp,
    className,
    animate = true,
    animationDuration = 900,
    replayToken = 0,
    interactive = true,
    markerIndex = null,
    hovered = false,
    bloom = "off",
    bloomOnHover = false,
    onHoverChange,
    defaultSelectedDataKey = null,
    onSelectionChange
  }
) {
  const { ref, size } = useChartDimensions()
  const margins = { ...DEFAULT_MARGINS, ...marginsProp }

  const ctx = useChartController({
    chartType,
    // Safe: the controller only reads row[key] for the configured series keys.
    data: data,
    config,
    stackType,
    dimensions: size,
    margins,
    animate,
    animationDuration,
    replayToken,
    markerIndex,
    hovered,
    bloom,
    bloomOnHover,
    defaultSelectedDataKey,
    onSelectionChange,
  })

  const backChildren = []
  const svgChildren = []
  const domChildren = []
  Children.forEach(children, (child) => {
    const layer = layerOf(child)
    if (layer === "back") backChildren.push(child)
    else if (layer === "dom") domChildren.push(child)
    else svgChildren.push(child)
  })

  const onMove = (clientX) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left - margins.left
    const index = ctx.indexAtX(px)
    ctx.setHoverIndex(index)
    ctx.setCursorX(clientX - rect.left)
    onHoverChange?.(index)
  }

  return (
    <ChartContext value={ctx}>
      <CommonChartContext value={ctx.common}>
        <div
          ref={ref}
          className={cn("relative h-full w-full", className)}
          onPointerEnter={() => ctx.setMouseInChart(true)}
          onPointerMove={interactive ? (e) => onMove(e.clientX) : undefined}
          onPointerLeave={() => {
            ctx.setMouseInChart(false)
            ctx.setHoverIndex(null)
            onHoverChange?.(null)
          }}>
          {ctx.ready && backChildren.length > 0 && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              aria-hidden
              role="presentation">
              <g transform={`translate(${margins.left},${margins.top})`}>
                {backChildren}
              </g>
            </svg>
          )}
          <Canvas />
          {ctx.ready && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              role="img"
              aria-label="Chart">
              <g transform={`translate(${margins.left},${margins.top})`}>
                {svgChildren}
              </g>
            </svg>
          )}
          {domChildren}
        </div>
      </CommonChartContext>
    </ChartContext>
  );
}

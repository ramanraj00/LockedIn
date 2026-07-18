"use client";
import { createContext, use, useCallback, useMemo, useState } from "react"
import { useRevision } from "./chart-context";
import { seedOfColor } from "./palette"
import { pieSlices, radarAxes } from "./polar";

const ROOT_OF = {
  pie: "<PieChart />",
  radar: "<RadarChart />",
}

const PolarChartContext = createContext(null)

export function usePolarChart() {
  const ctx = use(PolarChartContext)
  if (!ctx) {
    throw new Error("Polar chart parts must be used within a polar chart root.")
  }
  return ctx
}

/** Boundary guard for polar parts (`<Pie>`, `<Radar>`). */
export function usePolarPart(part, kind) {
  const ctx = use(PolarChartContext)
  if (!ctx) {
    throw new Error(`<${part} /> must be used within ${ROOT_OF[kind]}.`)
  }
  if (ctx.chartType !== kind) {
    throw new Error(
      `<${part} /> is not valid inside ${ROOT_OF[ctx.chartType]} — it belongs in ${ROOT_OF[kind]}.`
    )
  }
  return ctx
}

export { PolarChartContext }

export function usePolarController(
  {
    chartType,
    data,
    config,
    dataKey,
    nameKey,
    innerRadiusRatio,
    dimensions,
    margins,
    animate = true,
    animationDuration = 900,
    replayToken = 0,
    bloom = "off",
    bloomOnHover = false,
    defaultSelectedDataKey = null,
    onSelectionChange
  }
) {
  // This object becomes the PolarChartContext value, so its identity — and the
  // identity of every function/object it carries — must stay stable across
  // renders that don't change the inputs; otherwise every consumer (legend,
  // tooltip, slices, axes) re-renders on every parent render. The expensive
  // derivations, exposed callbacks, and returned value are memoized below;
  // cheap scalars (radii, ready) are left bare as plain recomputed reads.

  // Memoized: drives `pie`/`radar`/`common` — a fresh array would bust them.
  const configKeys = useMemo(() => Object.keys(config), [config])
  const revision = useRevision(data, replayToken)

  const [selectedDataKey, setSelectedDataKey] = useState(defaultSelectedDataKey)
  const [focusDataKey, setFocusDataKey] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [cursorX, setCursorX] = useState(0)
  const [cursorY, setCursorY] = useState(0)
  const [isMouseInChart, setMouseInChart] = useState(false)
  // Stable (only wraps two useState setters) so the value keeps its identity.
  const setCursor = useCallback((px, py) => {
    setCursorX(px)
    setCursorY(py)
  }, [])
  const [variants, setVariants] = useState({})

  // useCallback for the same reason as registerSeries in chart-context.tsx:
  // pie.tsx/radar.tsx list these as effect deps, so without stable identities
  // the unregister/register effect re-fires and its setState pair loops.
  const registerVariant = useCallback((key, variant) => {
    setVariants((prev) =>
      prev[key] === variant ? prev : { ...prev, [key]: variant })
  }, [])
  const unregisterVariant = useCallback((key) => {
    setVariants((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  // Stable so the value keeps its identity; re-created only on config change.
  const selectDataKey = useCallback((key) => {
    setSelectedDataKey(key)
    onSelectionChange?.(key)
  }, [onSelectionChange])

  // The root spreads margins fresh every render; pin a stable object off the
  // four numbers so it doesn't, on its own, invalidate the value.
  const { top: mTop, right: mRight, bottom: mBottom, left: mLeft } = margins
  const stableMargins = useMemo(
    () => ({ top: mTop, right: mRight, bottom: mBottom, left: mLeft }),
    [mTop, mRight, mBottom, mLeft]
  )

  const plotWidth = Math.max(0, dimensions.width - mLeft - mRight)
  const plotHeight = Math.max(0, dimensions.height - mTop - mBottom)
  const ready = plotWidth > 0 && plotHeight > 0
  const pad = chartType === "radar" ? 20 : 6
  const outerRadius = Math.max(0, Math.min(plotWidth, plotHeight) / 2 - pad)
  const innerRadius = chartType === "pie" ? outerRadius * innerRadiusRatio : 0
  const centerX = plotWidth / 2
  const centerY = plotHeight / 2

  // Stable so `common` and the value stay stable; re-created only on config.
  const seedOf = useCallback((key) => seedOfColor(config[key]?.color ?? "grey"), [config])
  // "*" is the pie-wide variant set by <Pie>; radar registers per series key.
  const variantOf = useCallback((key) => variants[key] ?? variants["*"] ?? "gradient", [variants])

  // Memoized: slice geometry — recomputing it on every hover/cursor tick would
  // rebuild the pie layout needlessly.
  const pie = useMemo(
    () => (chartType === "pie" ? pieSlices(data, dataKey, nameKey) : null),
    [chartType, data, dataKey, nameKey]
  )

  // Memoized: walks every row × series for the axis max, then builds the axes.
  const radar = useMemo(() => {
    if (chartType !== "radar") return null
    let max = 0
    for (const row of data) {
      for (const key of configKeys) {
        const v = Number(row[key]) || 0
        if (v > max) max = v
      }
    }
    return { axes: radarAxes(data, nameKey), max: max || 1 };
  }, [chartType, data, configKeys, nameKey])

  // Memoized: this is the value handed to CommonChartContext (Legend/Tooltip),
  // so it needs its own stable identity independent of the parent value.
  const common = useMemo(() => {
    const tooltipLeft = Math.max(48, Math.min(plotWidth + mLeft - 48, cursorX))
    const tooltipTop = Math.max(mTop + 44, cursorY)
    const emphasis = selectedDataKey ?? focusDataKey
    if (chartType === "pie" && pie) {
      const names = pie.map((s) => s.name)
      return {
        names,
        tooltipTop,
        labelOf: (n) => config[n]?.label ?? n,
        seedOf,
        selectedDataKey,
        selectDataKey,
        focusDataKey,
        setFocusDataKey,
        hoverIndex,
        ready,
        tooltipLeft,
        heading: (i) => pie[i]?.name ?? null,
        itemsAt: (i) => {
          const s = pie[i]
          if (!s) return []
          return [
            {
              name: s.name,
              label: config[s.name]?.label ?? s.name,
              value: s.value,
              seed: seedOf(s.name),
              dimmed: emphasis !== null && emphasis !== s.name,
            },
          ];
        },
      };
    }
    // radar
    return {
      names: configKeys,
      tooltipTop,
      labelOf: (n) => config[n]?.label ?? n,
      seedOf,
      selectedDataKey,
      selectDataKey,
      focusDataKey,
      setFocusDataKey,
      hoverIndex,
      ready,
      tooltipLeft,
      heading: (i) => radar?.axes[i]?.label ?? null,
      itemsAt: (i) =>
        configKeys.map((name) => {
          const raw = data[i]?.[name]
          return {
            name,
            label: config[name]?.label ?? name,
            value: typeof raw === "number" ? raw : 0,
            seed: seedOf(name),
            dimmed: emphasis !== null && emphasis !== name,
          };
        }),
    };
  }, [
    chartType,
    config,
    configKeys,
    data,
    pie,
    radar,
    seedOf,
    selectedDataKey,
    selectDataKey,
    focusDataKey,
    setFocusDataKey,
    hoverIndex,
    ready,
    plotWidth,
    mLeft,
    mTop,
    cursorX,
    cursorY,
  ])

  // Memoized: this is the PolarChartContext value. A fresh object here would
  // re-render every consumer on every parent render — the reason the pieces
  // above are stabilized. Rebuilds only when a listed input changes. The
  // useState setters are listed but never change identity.
  return useMemo(() => ({
    chartType,
    config,
    configKeys,
    data,
    dataLength: data.length,
    ready,
    plot: { width: plotWidth, height: plotHeight },
    margins: stableMargins,
    center: { x: centerX, y: centerY },
    outerRadius,
    innerRadius,
    animate,
    animationDuration,
    revision,
    bloom,
    bloomOnHover,
    seedOf,
    variantOf,
    registerVariant,
    unregisterVariant,
    selectedDataKey,
    selectDataKey,
    focusDataKey,
    setFocusDataKey,
    hoverIndex,
    setHoverIndex,
    setCursor,
    isMouseInChart,
    setMouseInChart,
    pie,
    radar,
    common,
  }), [
    chartType,
    config,
    configKeys,
    data,
    ready,
    plotWidth,
    plotHeight,
    stableMargins,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    animate,
    animationDuration,
    revision,
    bloom,
    bloomOnHover,
    seedOf,
    variantOf,
    registerVariant,
    unregisterVariant,
    selectedDataKey,
    selectDataKey,
    focusDataKey,
    setFocusDataKey,
    hoverIndex,
    setHoverIndex,
    setCursor,
    isMouseInChart,
    setMouseInChart,
    pie,
    radar,
    common,
  ]);
}

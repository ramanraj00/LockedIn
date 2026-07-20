import { PieCanvas } from "./pie-canvas"
import { PolarRoot } from "./polar-root"

/** Composable dither **pie / donut** chart. Compose `<Pie>`, `<Legend>`, … inside. */
export function PieChart(props) {
  return <PolarRoot chartType="pie" Canvas={PieCanvas} {...props} />;
}

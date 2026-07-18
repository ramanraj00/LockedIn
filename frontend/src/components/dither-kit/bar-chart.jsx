import { BarCanvas } from "./bar-canvas"
import { CartesianRoot } from "./cartesian-root";

/** Composable dither **bar** chart — `<Bar>` series, grouped or stacked. */
export function BarChart(props) {
  return <CartesianRoot chartType="bar" Canvas={BarCanvas} {...props} />;
}

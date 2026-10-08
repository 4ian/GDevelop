// @flow
import { type GDevelopTheme } from './Theme';

// There is a known bug with recharts that causes the chart to not render if
// the width is 100% in a flexbox component.
// See https://github.com/recharts/recharts/issues/172
export const chartWidth: string = '99%';

export const defaultChartMargins: {|
  top: number,
  bottom: number,
  right: number,
  left: number,
|} = {
  top: 5,
  bottom: 5,
  right: 25,
  left: 0,
};

type ChartsStyle = {|
  tickLabel: {| fontFamily: string |},
  chartLineDot: {| fill: string, strokeWidth: number |},
|};

/** The styles of the recharts charts of the app, from the theme. */
export const getChartsStyleFromTheme = (
  gdevelopTheme: GDevelopTheme
): ChartsStyle => ({
  tickLabel: {
    fontFamily: gdevelopTheme.chart.fontFamily,
  },
  chartLineDot: {
    fill: gdevelopTheme.chart.dataColor1,
    strokeWidth: 0,
  },
});

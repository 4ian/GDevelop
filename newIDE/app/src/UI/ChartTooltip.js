// @flow
import * as React from 'react';
import Paper from './Paper';
import { ColumnStackLayout } from './Layout';
import { Column } from './Grid';
import Text from './Text';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

type ChartTooltipProps = {|
  /** What is pointed at: the first line of the tooltip. */
  title: React.Node,
  /** The lines under the title (`Text` components). */
  children?: React.Node,
  /**
   * 'small' for the dense tooltips of the timelines of the debugger, shown
   * over the chart; 'medium' (the default) for the charts of the dashboards.
   */
  size?: 'small' | 'medium',
  maxWidth?: number,
|};

/**
 * The tooltip of a chart: what is pointed at, then what is known about it,
 * one piece per line.
 */
export const ChartTooltip = ({
  title,
  children,
  size,
  maxWidth,
}: ChartTooltipProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (size === 'small') {
    return (
      <Paper
        background="light"
        elevation={4}
        style={{ padding: '6px 8px', maxWidth }}
      >
        <Column noMargin>
          <Text noMargin size="body-small">
            {title}
          </Text>
          {children}
        </Column>
      </Paper>
    );
  }
  return (
    <Paper
      background="light"
      style={{ color: gdevelopTheme.chart.textColor, padding: 10, maxWidth }}
    >
      <ColumnStackLayout>
        <Text size="sub-title" noMargin>
          {title}
        </Text>
        {children}
      </ColumnStackLayout>
    </Paper>
  );
};

type RechartsChartTooltipProps = {|
  payload: ?Array<any>,
  label: string,
  /** Written after the label (a unit, like "minutes"). */
  labelSuffix?: ?string,
|};

/**
 * The content of a recharts `Tooltip`: the label of the point, then the value
 * of each series. Pass it as `content={props => <RechartsChartTooltip
 * payload={props.payload} label={props.label} />}`.
 */
export const RechartsChartTooltip = ({
  payload,
  label,
  labelSuffix,
}: RechartsChartTooltipProps): React.Node =>
  payload ? (
    <ChartTooltip title={`${label} ${labelSuffix ? labelSuffix : ''}`}>
      {payload.length > 0 &&
        payload.map(
          (
            {
              name,
              unit,
              value,
            }: {| name: string, unit: ?string, value: number |},
            index
          ) => (
            <Text noMargin key={index}>{`${name}: ${
              Number.isInteger(value) ? value.toString() : value.toFixed(2)
            }${unit ? ` ${unit}` : ''}`}</Text>
          )
        )}
    </ChartTooltip>
  ) : null;

type FloatingChartTooltipProps = {|
  /** Where the pointer is, in the pixels of the container of the chart. */
  x: number,
  y: number,
  /** The size of that container (which must be positioned). */
  containerWidth: number,
  containerHeight: number,
  /** The widest the tooltip can be: it is kept inside the container. */
  maxWidth: number,
  /**
   * The height kept free under the tooltip for it not to go past the bottom
   * of the container. Omitted: it is only placed under the pointer.
   */
  estimatedHeight?: number,
  children: React.Node,
|};

/**
 * Places a tooltip next to the pointer, over a chart drawn by hand (a canvas),
 * without ever catching the pointer itself.
 */
export const FloatingChartTooltip = ({
  x,
  y,
  containerWidth,
  containerHeight,
  maxWidth,
  estimatedHeight,
  children,
}: FloatingChartTooltipProps): React.Node => (
  <div
    style={{
      position: 'absolute',
      zIndex: 1,
      maxWidth,
      pointerEvents: 'none',
      left: Math.min(x + 12, Math.max(0, containerWidth - maxWidth)),
      top:
        estimatedHeight != null
          ? Math.min(y + 14, Math.max(0, containerHeight - estimatedHeight))
          : y + 14,
    }}
  >
    {children}
  </div>
);

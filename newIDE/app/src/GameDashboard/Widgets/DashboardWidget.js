// @flow

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '../../UI/Paper';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout } from '../../UI/Layout';
import { dataObjectToProps } from '../../Utils/HTMLDataset';

const padding = 16;
const fixedHeight = 300;

const styles = {
  paper: {
    padding: `${padding}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  maxHeightNotWrapped: {
    height: `calc(100% - ${2 * padding}px)`,
  },
};

export type DashboardWidgetSize = 'full' | 'half' | 'oneThird' | 'twoThirds';

const getGridSizeFromWidgetSize = (size: DashboardWidgetSize) => {
  switch (size) {
    case 'full':
      return 12;
    case 'half':
      return 6;
    case 'oneThird':
      return 4;
    case 'twoThirds':
      return 8;
    default:
      return 12;
  }
};

type GameDashboardWidgetName =
  | 'analytics'
  | 'feedback'
  | 'services'
  | 'projects'
  | 'builds'
  | 'wallet'
  | 'earnings';

type Props = {|
  title: React.Node,
  topRightAction?: React.Node,
  renderSubtitle?: ?() => React.Node,
  widgetSize: DashboardWidgetSize,
  children?: React.Node,
  minHeight?: boolean,
  widgetName: GameDashboardWidgetName,
|};

const DashboardWidget = ({
  title,
  topRightAction,
  widgetSize,
  renderSubtitle,
  children,
  minHeight,
  widgetName,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  return (
    <Grid
      item
      sm={getGridSizeFromWidgetSize(widgetSize)}
      xs={12}
      {...dataObjectToProps({ widgetName })}
    >
      <Paper
        background="medium"
        style={{
          ...styles.paper,
          ...styles.maxHeightNotWrapped,
          ...(minHeight && !isMobile
            ? {
                minHeight: minHeight ? fixedHeight : 120,
              }
            : {}),
        }}
      >
        <ColumnStackLayout noMargin expand useFullHeight>
          <Line alignItems="center" justifyContent="space-between" noMargin>
            <Column noMargin>
              <Text size="block-title" noMargin>
                {title}
              </Text>
              {renderSubtitle && renderSubtitle()}
            </Column>
            {topRightAction}
          </Line>
          {children}
        </ColumnStackLayout>
      </Paper>
    </Grid>
  );
};

export default DashboardWidget;

// @flow

import * as React from 'react';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import { Grid } from '@material-ui/core';

const styles = {
  paper: {
    padding: `8px 12px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
  },
  maxHeight: { maxHeight: 300 },
};

type Props = {|
  title: React.Node,
  seeMoreButton?: React.Node,
  renderSubtitle?: ?() => React.Node,
  gridSize: number,
  children?: React.Node,
  withMaxHeight?: boolean,
|};

const DashboardWidget = ({
  title,
  seeMoreButton,
  gridSize,
  renderSubtitle,
  children,
  withMaxHeight,
}: Props) => {
  return (
    <Grid item sm={4 * gridSize} xs={12}>
      <Paper
        background="medium"
        style={{
          ...styles.paper,
          ...(withMaxHeight ? styles.maxHeight : undefined),
        }}
      >
        <div style={styles.content}>
          <Line alignItems="center" justifyContent="space-between">
            <Column noMargin>
              <Text size="section-title" noMargin>
                {title}
              </Text>
              {renderSubtitle && renderSubtitle()}
            </Column>
            {seeMoreButton}
          </Line>
          {children}
        </div>
      </Paper>
    </Grid>
  );
};

export default DashboardWidget;

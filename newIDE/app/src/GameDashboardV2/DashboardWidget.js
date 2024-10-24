// @flow

import * as React from 'react';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import { Grid } from '@material-ui/core';

const styles = {
  paper: { padding: 8 },
};

type Props = {|
  title: React.Node,
  seeMoreButton?: React.Node,
  gridSize: number,
|};

const DashboardWidget = ({ title, seeMoreButton, gridSize }: Props) => {
  return (
    <Grid item sm={4 * gridSize} xs={12}>
      <Paper background="light" style={styles.paper}>
        <Column noMargin>
          <Line alignItems="center" justifyContent="space-between">
            <Text size="section-title" noMargin>
              {title}
            </Text>
            {seeMoreButton}
          </Line>
        </Column>
      </Paper>
    </Grid>
  );
};

export default DashboardWidget;

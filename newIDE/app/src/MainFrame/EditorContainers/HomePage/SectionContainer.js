// @flow
import * as React from 'react';
import { Column } from '../../../UI/Grid';
import { Paper } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  mobileScrollContainer: {
    padding: 5,
  },
  desktopScrollContainer: {
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
  },
  scrollContainer: {
    borderLeft: `1px solid lightgrey`,
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
};

type Props = {|
  children: React.Node,
|};

export const SectionContainer = ({ children }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  return (
    <Column useFullHeight noMargin expand>
      <Paper
        style={{
          ...styles.scrollContainer,
          ...(windowWidth === 'small'
            ? styles.mobileScrollContainer
            : styles.desktopScrollContainer),
        }}
        square
      >
        <Column expand>{children}</Column>
      </Paper>
    </Column>
  );
};

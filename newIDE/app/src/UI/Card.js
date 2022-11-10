// @flow

import * as React from 'react';
import MUICard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GDevelopThemeContext from './Theme/ThemeContext';
import { Column, Line } from './Grid';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';

const styles = {
  headerContainer: {
    minWidth: 0,
    flex: 1,
  },
  cardContent: {
    paddingBottom: 32,
    paddingTop: 0,
    minWidth: 0,
  },
};

type Props = {|
  children: React.Node,
  cardCornerAction?: React.Node,
  header?: React.Node,

  disabled?: boolean,
  isHighlighted?: boolean,
|};

const Card = ({
  children,
  header,
  cardCornerAction,
  isHighlighted,
  disabled,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <MUICard
      style={{
        opacity: disabled ? 0.5 : 1,
        backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
        ...(isHighlighted
          ? {
              borderLeftWidth: 4,
              borderLeftColor: gdevelopTheme.palette.secondary,
            }
          : {}),
      }}
      variant="outlined"
    >
      <Column expand noMargin>
        <Line justifyContent="space-between" expand>
          <div
            style={{
              ...styles.headerContainer,
              paddingLeft: windowWidth === 'small' ? 8 : 32,
              paddingRight: cardCornerAction
                ? windowWidth === 'small'
                  ? 8
                  : 32
                : 0,
            }}
          >
            {header}
          </div>
          <Column>{cardCornerAction}</Column>
        </Line>
        <CardContent
          style={{
            ...styles.cardContent,
            paddingRight: windowWidth === 'small' ? 8 : 32,
            paddingLeft: windowWidth === 'small' ? 8 : 32,
          }}
        >
          {children}
        </CardContent>
      </Column>
    </MUICard>
  );
};

export default Card;

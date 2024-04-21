// @flow

import * as React from 'react';
import MUICard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { Column, Line } from './Grid';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';

const styles = {
  headerContainer: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  cardContent: {
    paddingBottom: 18,
    paddingTop: 0,
    minWidth: 0,
  },
};

type Props = {|
  children: React.Node,
  cardCornerAction?: React.Node,
  header?: React.Node,
  background?: 'medium' | 'dark',

  disabled?: boolean,
  isHighlighted?: boolean,
|};

const Card = ({
  children,
  header,
  background,
  cardCornerAction,
  isHighlighted,
  disabled,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <MUICard
      style={{
        opacity: disabled ? 0.5 : 1,
        backgroundColor:
          background === 'dark'
            ? gdevelopTheme.paper.backgroundColor.dark
            : gdevelopTheme.paper.backgroundColor.medium,
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
              paddingLeft: isMobile ? 8 : 24,
              paddingRight: cardCornerAction ? (isMobile ? 8 : 24) : 0,
            }}
          >
            {header}
          </div>
          <Column>{cardCornerAction}</Column>
        </Line>
        <CardContent
          style={{
            ...styles.cardContent,
            paddingRight: isMobile ? 8 : 24,
            paddingLeft: isMobile ? 8 : 24,
          }}
        >
          {children}
        </CardContent>
      </Column>
    </MUICard>
  );
};

export default Card;

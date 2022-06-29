// @flow

import * as React from 'react';
import MUICard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GDevelopThemeContext from './Theme/ThemeContext';
import { Column, Line } from './Grid';

type Props = {|
  children: React.Node,
  isHighlighted?: boolean,
  cardCornerAction?: React.Node,
  style?: {| opacity?: number |},
|};

const Card = ({ children, isHighlighted, cardCornerAction }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <MUICard
      style={{
        ...(isHighlighted
          ? {
              borderLeftWidth: 4,
              borderLeftColor: gdevelopTheme.palette.primary,
            }
          : {}),
      }}
      variant="outlined"
    >
      <Line noMargin>
        <CardContent
          style={{ flex: 1, paddingRight: cardCornerAction ? 0 : 32 }}
        >
          {children}
        </CardContent>
        <Column>
          <Line>{cardCornerAction}</Line>
        </Column>
      </Line>
    </MUICard>
  );
};

export default Card;

// @flow

import * as React from 'react';
import MUICard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GDevelopThemeContext from './Theme/ThemeContext';
import { Column, Line } from './Grid';
import { ResponsiveWindowMeasurer } from './Reponsive/ResponsiveWindowMeasurer';

type Props = {|
  children: React.Node,
  isHighlighted?: boolean,
  cardCornerAction?: React.Node,
  style?: {| opacity?: number |},
  header?: React.Node,
|};

const Card = ({
  children,
  header,
  isHighlighted,
  cardCornerAction,
  style,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <ResponsiveWindowMeasurer>
      {width => (
        <MUICard
          style={{
            opacity: style && style.opacity ? style.opacity : 1,
            ...(isHighlighted
              ? {
                  borderLeftWidth: 4,
                  borderLeftColor: gdevelopTheme.palette.primary,
                }
              : {}),
          }}
          variant="outlined"
        >
          <Column expand noMargin>
            <Line justifyContent="space-between" expand>
              <div
                style={{
                  paddingLeft: width === 'small' ? 8 : 32,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {header}
              </div>
              <Column>{cardCornerAction}</Column>
            </Line>
            <CardContent
              style={{
                paddingRight: width === 'small' ? 8 : 32,
                paddingLeft: width === 'small' ? 8 : 32,
                paddingBottom: 32,
                paddingTop: 0,
                minWidth: 0,
              }}
            >
              {children}
            </CardContent>
          </Column>
        </MUICard>
      )}
    </ResponsiveWindowMeasurer>
  );
};

export default Card;

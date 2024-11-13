// @flow
import * as React from 'react';

import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { Column, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const getStyles = ({ verticalDesign, theme }) => ({
  delimiter: {
    display: 'flex',
    flex: 1,
    borderLeft: !verticalDesign
      ? `2px solid ${theme.home.separator.color}`
      : 'none',
    borderTop: verticalDesign
      ? `2px solid ${theme.home.separator.color}`
      : 'none',
  },
});

type Props = {|
  text: React.Node,
|};

const ResponsiveDelimiter = ({ text }: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();

  const verticalDesign = isMobile && !isLandscape;
  const theme = React.useContext(GDevelopThemeContext);
  const styles = getStyles({ verticalDesign, theme });

  return !verticalDesign ? (
    <ColumnStackLayout noMargin alignItems="center" justifyContent="center">
      <div style={styles.delimiter} />
      <Text size="body2" noMargin>
        {text}
      </Text>
      <div style={styles.delimiter} />
    </ColumnStackLayout>
  ) : (
    <Column>
      <Spacer />
      <LineStackLayout noMargin alignItems="center" justifyContent="center">
        <div style={styles.delimiter} />
        <Text size="body2" noMargin>
          {text}
        </Text>
        <div style={styles.delimiter} />
      </LineStackLayout>
      <Spacer />
    </Column>
  );
};

export default ResponsiveDelimiter;

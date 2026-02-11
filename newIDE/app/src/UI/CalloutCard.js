// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from './Layout';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';

const styles = {
  card: {
    display: 'flex',
    borderRadius: 10,
    alignItems: 'center',
    padding: 16,
    maxWidth: 1300,
  },
  xlargeImageSize: {
    width: 280,
    height: 110,
  },
  largeImageSize: {
    width: 250,
    height: 110,
  },
  mediumImageSize: {
    width: 120,
    height: 100,
  },
  smallImageSize: {
    width: 200,
    height: 110,
  },
};

type Props = {|
  children: React.Node,
  renderImage: (style: {| width: number, height: number |}) => React.Node,
|};

export const CalloutCard = ({ children, renderImage }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { windowSize } = useResponsiveWindowSize();

  const cardStyle = {
    ...styles.card,
    border: `1px solid ${gdevelopTheme.palette.secondary}`,
  };

  return (
    <div style={cardStyle}>
      <ResponsiveLineStackLayout noMargin expand noResponsiveLandscape>
        {renderImage(
          windowSize === 'small'
            ? styles.smallImageSize
            : windowSize === 'medium'
            ? styles.mediumImageSize
            : windowSize === 'large'
            ? styles.largeImageSize
            : styles.xlargeImageSize
        )}
        {children}
      </ResponsiveLineStackLayout>
    </div>
  );
};

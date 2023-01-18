// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  icon: {
    background: 'linear-gradient(45deg, #FFFFFF33, #FFFFFF)',
    padding: 1,
    borderRadius: 4,
  },
};

const ICON_HEIGHT = 120;
const SMALL_WINDOW_ICON_HEIGHT = 50;

type Props = {|
  exampleShortHeader: ExampleShortHeader,
|};

export const ExampleThumbnailOrIcon = ({ exampleShortHeader }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const iconUrl = exampleShortHeader.previewImageUrls[0];
  const aspectRatio = iconUrl.endsWith('square-icon.png') ? '1 / 1' : '16 / 9';
  const height =
    windowWidth === 'small' ? SMALL_WINDOW_ICON_HEIGHT : ICON_HEIGHT;

  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, height, aspectRatio }}
        src={iconUrl}
        alt={exampleShortHeader.name}
      />
    </div>
  );
};

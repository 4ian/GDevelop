// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import { iconWithBackgroundStyle } from '../../UI/IconContainer';

const styles = {
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  icon: {
    ...iconWithBackgroundStyle,
    padding: 1,
  },
};

const ICON_DESKTOP_HEIGHT = 120;

type Props = {|
  exampleShortHeader: ExampleShortHeader,
|};

export const ExampleThumbnailOrIcon = ({ exampleShortHeader }: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const iconUrl = exampleShortHeader.previewImageUrls[0];
  const aspectRatio = iconUrl.endsWith('square-icon.png') ? '1 / 1' : '16 / 9';
  const height = windowWidth === 'small' ? undefined : ICON_DESKTOP_HEIGHT;
  const width = windowWidth === 'small' ? '100%' : undefined;

  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, height, width, aspectRatio }}
        src={iconUrl}
        alt={exampleShortHeader.name}
      />
    </div>
  );
};

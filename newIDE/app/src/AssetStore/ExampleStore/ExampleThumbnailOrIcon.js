// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { iconWithBackgroundStyle } from '../../UI/IconContainer';

const styles = {
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'left',
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
  const { isMobile } = useResponsiveWindowSize();
  const iconUrl = exampleShortHeader.previewImageUrls[0];
  const aspectRatio = iconUrl.endsWith('square-icon.png') ? '1 / 1' : '16 / 9';
  // Make the icon be full width on mobile.
  const height = isMobile ? undefined : ICON_DESKTOP_HEIGHT;
  const width = isMobile ? '100%' : undefined;

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

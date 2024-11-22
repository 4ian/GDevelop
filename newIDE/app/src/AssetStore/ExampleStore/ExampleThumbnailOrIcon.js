// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { iconWithBackgroundStyle } from '../../UI/IconContainer';

const iconPadding = 1;

const styles = {
  iconBackground: {
    display: 'flex',
    justifyContent: 'left',
  },
  icon: {
    ...iconWithBackgroundStyle,
    padding: iconPadding,
  },
};

const ICON_DESKTOP_HEIGHT = 150;

type Props = {|
  exampleShortHeader: ExampleShortHeader,
|};

export const ExampleThumbnailOrIcon = ({ exampleShortHeader }: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const iconUrl = exampleShortHeader.previewImageUrls[0];
  const aspectRatio = iconUrl.endsWith('square-icon.png') ? '1 / 1' : '16 / 9';
  // Make the icon be full width on mobile.
  const height = isMobile && !isLandscape ? undefined : ICON_DESKTOP_HEIGHT;
  const width =
    isMobile && !isLandscape ? `calc(100% - ${2 * iconPadding}px)` : undefined;

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

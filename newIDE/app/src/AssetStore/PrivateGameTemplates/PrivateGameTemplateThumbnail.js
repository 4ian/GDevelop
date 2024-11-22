// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
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
    aspectRatio: '16 / 9',
  },
};

const ICON_DESKTOP_HEIGHT = 150;

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  simulateAppStoreProduct: boolean,
|};

const PrivateGameTemplateThumbnail = ({
  privateGameTemplateListingData,
  simulateAppStoreProduct,
}: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const iconUrl = React.useMemo(
    () =>
      (simulateAppStoreProduct &&
        privateGameTemplateListingData.appStoreThumbnailUrls &&
        privateGameTemplateListingData.appStoreThumbnailUrls[0]) ||
      privateGameTemplateListingData.thumbnailUrls[0],
    [privateGameTemplateListingData, simulateAppStoreProduct]
  );

  // Make the icon be full width on mobile.
  const height = isMobile && !isLandscape ? undefined : ICON_DESKTOP_HEIGHT;
  const width =
    isMobile && !isLandscape ? `calc(100% - ${2 * iconPadding}px)` : undefined;

  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, height, width }}
        src={iconUrl}
        alt={privateGameTemplateListingData.name}
      />
    </div>
  );
};

export default PrivateGameTemplateThumbnail;

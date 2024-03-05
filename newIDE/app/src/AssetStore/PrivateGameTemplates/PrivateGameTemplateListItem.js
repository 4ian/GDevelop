// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { iconWithBackgroundStyle } from '../../UI/IconContainer';
import Lightning from '../../UI/CustomSvgIcons/Lightning';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import FlatButton from '../../UI/FlatButton';
import { capitalize } from 'lodash';
import Chip from '../../UI/Chip';
import ProductPriceTag from '../ProductPriceTag';

const styles = {
  container: {
    display: 'flex',
    overflow: 'hidden',
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },
  button: {
    alignItems: 'flex-start',
    textAlign: 'left',
    flex: 1,
  },
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'left',
  },
  icon: {
    ...iconWithBackgroundStyle,
    padding: 1,
    aspectRatio: '16 / 9',
  },
  priceTagContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    cursor: 'default',
  },
  chip: {
    marginRight: 2,
    marginBottom: 2,
  },
};

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  matches: ?Array<SearchMatch>,
  isOpening: boolean,
  onChoose: () => void,
  onHeightComputed: number => void,
  owned: boolean,
|};

const PrivateGameTemplateListItem = ({
  privateGameTemplateListingData,
  matches,
  isOpening,
  onChoose,
  onHeightComputed,
  owned,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  const renderGameTemplateField = (field: 'description' | 'name') => {
    const originalField = privateGameTemplateListingData[field];

    if (!matches) return originalField;
    const nameMatches = matches.filter(match => match.key === field);
    if (nameMatches.length === 0) return originalField;

    return (
      <HighlightedText
        text={originalField}
        matchesCoordinates={nameMatches[0].indices}
      />
    );
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <ResponsiveLineStackLayout noMargin expand>
        <ButtonBase style={styles.button} onClick={onChoose} focusRipple>
          <ResponsiveLineStackLayout noMargin expand>
            {!!privateGameTemplateListingData.thumbnailUrls.length && (
              <Column noMargin>
                <CorsAwareImage
                  style={{
                    ...styles.icon,
                    height: isMobile ? undefined : 120,
                    width: isMobile ? '100%' : undefined,
                  }}
                  src={
                    (shouldUseAppStoreProduct() &&
                      privateGameTemplateListingData.appStoreThumbnailUrls &&
                      privateGameTemplateListingData
                        .appStoreThumbnailUrls[0]) ||
                    privateGameTemplateListingData.thumbnailUrls[0]
                  }
                  alt={privateGameTemplateListingData.name}
                />
                <div style={styles.priceTagContainer}>
                  <ProductPriceTag
                    productListingData={privateGameTemplateListingData}
                    withOverlay
                    owned={owned}
                  />
                </div>
              </Column>
            )}
            <Column expand noMargin>
              <Text noMargin>{renderGameTemplateField('name')} </Text>
              <Line>
                <div style={{ flexWrap: 'wrap' }}>
                  {privateGameTemplateListingData.isSellerGDevelop && (
                    <Chip
                      icon={<Lightning />}
                      variant="outlined"
                      color="secondary"
                      size="small"
                      style={styles.chip}
                      label={<Trans>Ready-made</Trans>}
                      key="premium"
                    />
                  )}
                  {privateGameTemplateListingData.categories.map(category => (
                    <Chip
                      size="small"
                      style={styles.chip}
                      label={capitalize(category)}
                      key={category}
                    />
                  ))}
                </div>
              </Line>
              <Text
                noMargin
                size="body2"
                displayInlineAsSpan // Important to avoid the text to use a "p" which causes crashes with automatic translation tools with the highlighted text.
              >
                {renderGameTemplateField('description')}
              </Text>
            </Column>
          </ResponsiveLineStackLayout>
        </ButtonBase>
        <Column justifyContent="flex-end">
          <Line noMargin justifyContent="flex-end">
            <FlatButton
              label={<Trans>Open</Trans>}
              disabled={isOpening}
              onClick={onChoose}
            />
          </Line>
        </Column>
      </ResponsiveLineStackLayout>
    </div>
  );
};

export default PrivateGameTemplateListItem;

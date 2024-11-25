// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import { OwnedProductLicense } from '../ProductLicense/ProductLicenseOptions';
import HelpIcon from '../../UI/HelpIcon';
import PrivateGameTemplateThumbnail from './PrivateGameTemplateThumbnail';
import FlatButton from '../../UI/FlatButton';
import RouterContext from '../../MainFrame/RouterContext';

const styles = {
  openProductContainer: {
    display: 'flex',
    paddingLeft: 32, // To align with licensing options.
    marginTop: 8,
    marginBottom: 8,
  },
};

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  purchaseUsageType: string,
  onStoreProductOpened: () => void,
|};

const PrivateGameTemplateOwnedInformationPage = ({
  privateGameTemplateListingData,
  purchaseUsageType,
  onStoreProductOpened,
}: Props) => {
  const shouldUseOrSimulateAppStoreProduct = shouldUseAppStoreProduct();
  const { navigateToRoute } = React.useContext(RouterContext);

  return (
    <Column expand noMargin>
      <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
        <Line>
          <PrivateGameTemplateThumbnail
            privateGameTemplateListingData={privateGameTemplateListingData}
            simulateAppStoreProduct={shouldUseOrSimulateAppStoreProduct}
          />
        </Line>
        <Column noMargin expand>
          <Line noMargin>
            <Text size="block-title">
              {privateGameTemplateListingData.name}
            </Text>
          </Line>
          <Line noMargin>
            <Text size="sub-title">
              <Trans>Licensing</Trans>
            </Text>
            <HelpIcon
              size="small"
              helpPagePath="https://gdevelop.io/page/asset-store-license-agreement"
            />
          </Line>
          <OwnedProductLicense
            productType="game-template"
            ownedLicense={purchaseUsageType}
          />
          <div style={styles.openProductContainer}>
            <FlatButton
              label={<Trans>Open in Store</Trans>}
              onClick={() => {
                navigateToRoute('store', {
                  'game-template': `product-${
                    privateGameTemplateListingData.id
                  }`,
                });
                onStoreProductOpened();
              }}
              primary
            />
          </div>
          <Text size="body" displayInlineAsSpan noMargin>
            <MarkdownText
              source={privateGameTemplateListingData.description}
              allowParagraphs
            />
          </Text>
        </Column>
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default PrivateGameTemplateOwnedInformationPage;

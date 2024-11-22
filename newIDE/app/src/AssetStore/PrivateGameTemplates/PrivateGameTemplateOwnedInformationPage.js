// @flow
import * as React from 'react';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { PrivateGameTemplateStoreContext } from './PrivateGameTemplateStoreContext';
import { getUserProductPurchaseUsageType } from '../ProductPageHelper';
import ProductLicenseOptions from '../ProductLicense/ProductLicenseOptions';
import HelpIcon from '../../UI/HelpIcon';
import PrivateGameTemplateThumbnail from './PrivateGameTemplateThumbnail';

type Props = {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  simulateAppStoreProduct?: boolean,
|};

const PrivateGameTemplateOwnedInformationPage = ({
  privateGameTemplateListingData,
  simulateAppStoreProduct,
}: Props) => {
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { receivedGameTemplates, gameTemplatePurchases } = React.useContext(
    AuthenticatedUserContext
  );
  const [selectedUsageType, setSelectedUsageType] = React.useState<string>(
    privateGameTemplateListingData.prices[0].usageType
  );
  const shouldUseOrSimulateAppStoreProduct =
    shouldUseAppStoreProduct() || !!simulateAppStoreProduct;

  const userGameTemplatePurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
        productId: privateGameTemplateListingData
          ? privateGameTemplateListingData.id
          : null,
        receivedProducts: receivedGameTemplates,
        productPurchases: gameTemplatePurchases,
        allProductListingDatas: privateGameTemplateListingDatas,
      }),
    [
      gameTemplatePurchases,
      privateGameTemplateListingData,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
    ]
  );

  return (
    <Column expand noMargin>
      <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
        <Line>
          <PrivateGameTemplateThumbnail
            privateGameTemplateListingData={privateGameTemplateListingData}
            simulateAppStoreProduct={shouldUseOrSimulateAppStoreProduct}
          />
        </Line>
        <Column noMargin>
          <Line noMargin>
            <Text size="sub-title">
              <Trans>Licensing</Trans>
            </Text>
            <HelpIcon
              size="small"
              helpPagePath="https://gdevelop.io/page/asset-store-license-agreement"
            />
          </Line>
          <ProductLicenseOptions
            value={selectedUsageType}
            onChange={setSelectedUsageType}
            product={privateGameTemplateListingData}
            ownedLicense={userGameTemplatePurchaseUsageType}
          />
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

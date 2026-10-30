// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Checkbox from '../../UI/Checkbox';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { ImageWithFallback } from '../../UI/ImageWithFallback';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import RouterContext from '../../MainFrame/RouterContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import useRedeemProduct from '../UseRedeemProduct';

const styles = {
  thumbnail: {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'cover',
    borderRadius: 8,
  },
};

type Props = {|
  productListingDatas: Array<
    PrivateAssetPackListingData | PrivateGameTemplateListingData
  >,
  onClose: () => void,
|};

/**
 * Shows subscribers the products they can claim for free this month.
 */
const ClaimableProductsDialog = ({
  productListingDatas,
  onClose,
}: Props): React.Node => {
  const { receivedAssetPacks, receivedGameTemplates } = React.useContext(
    AuthenticatedUserContext
  );
  const { addRouteArguments } = React.useContext(RouterContext);
  const { values, setAutoDisplayClaimableProductsDialog } = React.useContext(
    PreferencesContext
  );
  const {
    onWillRedeemProduct,
    redeemingProductId,
    passwordPromptDialog,
  } = useRedeemProduct();

  const openInStore = (
    productListingData:
      | PrivateAssetPackListingData
      | PrivateGameTemplateListingData
  ) => {
    addRouteArguments(
      productListingData.productType === 'GAME_TEMPLATE'
        ? {
            'initial-dialog': 'store',
            'game-template': productListingData.id,
          }
        : {
            'initial-dialog': 'store',
            'asset-pack': productListingData.id,
          }
    );
    onClose();
  };

  return (
    <Dialog
      title={<Trans>Your free products of the month</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <Checkbox
          key="do-not-show-again"
          label={<Trans>Don't show this again</Trans>}
          checked={!values.autoDisplayClaimableProductsDialog}
          onCheck={(e, checked) =>
            setAutoDisplayClaimableProductsDialog(!checked)
          }
        />,
      ]}
      open
      onRequestClose={onClose}
      maxWidth="md"
      flexColumnBody
    >
      <Text>
        <Trans>
          Thanks to your subscription, you can claim these products for free
          this month. They are yours to keep, even after your subscription ends.
        </Trans>
      </Text>
      <ResponsiveLineStackLayout noMargin expand>
        {productListingDatas.map(productListingData => {
          const receivedProducts =
            productListingData.productType === 'GAME_TEMPLATE'
              ? receivedGameTemplates
              : receivedAssetPacks;
          const isReceived = (receivedProducts || []).some(
            receivedProduct => receivedProduct.id === productListingData.id
          );
          return (
            <ColumnStackLayout noMargin expand key={productListingData.id}>
              <ImageWithFallback
                style={styles.thumbnail}
                src={productListingData.thumbnailUrls[0]}
                alt={productListingData.name}
              />
              <Text size="sub-title" noMargin>
                {productListingData.name}
              </Text>
              <Text color="secondary" noMargin>
                {productListingData.productType === 'GAME_TEMPLATE' ? (
                  <Trans>Game template</Trans>
                ) : (
                  <Trans>Asset pack</Trans>
                )}
              </Text>
              {isReceived ? (
                <FlatButton
                  label={<Trans>Open in the store</Trans>}
                  onClick={() => openInStore(productListingData)}
                />
              ) : (
                <RaisedButton
                  primary
                  label={
                    redeemingProductId === productListingData.id ? (
                      <Trans>Please wait</Trans>
                    ) : (
                      <Trans>Claim for free</Trans>
                    )
                  }
                  disabled={!!redeemingProductId}
                  onClick={() => onWillRedeemProduct(productListingData)}
                />
              )}
            </ColumnStackLayout>
          );
        })}
      </ResponsiveLineStackLayout>
      {passwordPromptDialog}
    </Dialog>
  );
};

export default ClaimableProductsDialog;

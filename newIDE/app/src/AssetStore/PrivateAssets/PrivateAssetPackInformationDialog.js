// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';
import {
  getPrivateAssetPack,
  type PrivateAssetPack,
} from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import { t, Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import PriceTag, { formatPrice } from '../../UI/PriceTag';
import FlatButton from '../../UI/FlatButton';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { ResponsiveLineStackLayout, LineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import Link from '../../UI/Link';
import Mark from '../../UI/CustomSvgIcons/Mark';
import Cross from '../../UI/CustomSvgIcons/Cross';
import ResponsiveImagesGallery from '../../UI/ResponsiveImagesGallery';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import RaisedButton from '../../UI/RaisedButton';
import { sendAssetPackBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Paper from '../../UI/Paper';

const sortedContentType = [
  'sprite',
  '9patch',
  'tiled',
  'particleEmitter',
  'font',
  'audio',
  'partial',
];

const contentTypeToMessageDescriptor = {
  sprite: t`Sprites`,
  '9patch': t`Panel sprites`,
  tiled: t`Tiled sprites`,
  particleEmitter: t`Particle emitters`,
  font: t`Fonts`,
  audio: t`Audios`,
  partial: t`Other`,
};

const styles = {
  disabledText: { opacity: 0.6 },
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  onClose: () => void,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
|};

const PrivateAssetPackDialog = ({
  privateAssetPackListingData,
  onClose,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
}: Props) => {
  const { id, name, sellerId, prices } = privateAssetPackListingData;
  const [assetPack, setAssetPack] = React.useState<?PrivateAssetPack>(null);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [
    openSellerPublicProfileDialog,
    setOpenSellerPublicProfileDialog,
  ] = React.useState<boolean>(false);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const windowWidth = useResponsiveWindowWidth();

  React.useEffect(
    () => {
      (async () => {
        setIsFetching(true);
        try {
          const assetPack = await getPrivateAssetPack(id);
          const profile = await getUserPublicProfile(sellerId);
          setAssetPack(assetPack);
          setSellerPublicProfile(profile);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setErrorText(
              <Trans>
                Asset pack not found - An error occurred, please try again
                later.
              </Trans>
            );
          } else {
            setErrorText(
              <Trans>An error occurred, please try again later.</Trans>
            );
          }
        } finally {
          setIsFetching(false);
        }
      })();
    },
    [id, sellerId]
  );

  const onClickBuy = () => {
    if (!assetPack) return;
    const assetPackId = assetPack.id;
    try {
      onOpenPurchaseDialog();
      sendAssetPackBuyClicked(assetPackId);
    } catch (e) {
      console.warn('Unable to send event', e);
    }
  };

  const getBuyButton = i18n =>
    !errorText ? (
      <RaisedButton
        key="buy-asset-pack"
        primary
        label={
          !assetPack ? (
            <Trans>Loading...</Trans>
          ) : isPurchaseDialogOpen ? (
            <Trans>Processing...</Trans>
          ) : (
            <Trans>Buy for {formatPrice(i18n, prices[0].value)}</Trans>
          )
        }
        onClick={onClickBuy}
        disabled={!assetPack || isPurchaseDialogOpen}
        id="buy-asset-pack"
      />
    ) : null;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={name}
            maxWidth="lg"
            open
            onRequestClose={onClose}
            actions={[
              <FlatButton
                key="cancel"
                label={<Trans>Cancel</Trans>}
                onClick={onClose}
              />,
              getBuyButton(i18n),
            ]}
            onApply={onClickBuy}
            flexColumnBody
            fullHeight
          >
            {errorText ? (
              <Line alignItems="center" justifyContent="center" expand>
                <AlertMessage kind="error">{errorText}</AlertMessage>
              </Line>
            ) : isFetching ? (
              <Column expand>
                <PlaceholderLoader />
              </Column>
            ) : assetPack && sellerPublicProfile ? (
              <>
                <Column noMargin>
                  <Text size="body2">
                    <Trans>by</Trans>{' '}
                    <Link
                      onClick={() => setOpenSellerPublicProfileDialog(true)}
                      href="#"
                    >
                      {sellerPublicProfile.username || ''}
                    </Link>
                  </Text>
                </Column>
                <ResponsiveLineStackLayout noColumnMargin noMargin>
                  <Column
                    useFullHeight
                    expand={windowWidth !== 'small'}
                    noMargin
                    noOverflowParent
                  >
                    <ResponsiveImagesGallery
                      imagesUrls={assetPack.previewImageUrls}
                      altTextTemplate={`Asset pack ${name} preview image {imageIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </Column>
                  <Column useFullHeight expand noMargin>
                    <Paper
                      variant="outlined"
                      style={{ padding: windowWidth === 'small' ? 20 : 30 }}
                      background="medium"
                    >
                      <Column noMargin>
                        <Line
                          noMargin
                          expand
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <PriceTag value={prices[0].value} />
                          {getBuyButton(i18n)}
                        </Line>
                        <Text size="body2" displayInlineAsSpan>
                          <MarkdownText
                            source={assetPack.longDescription}
                            allowParagraphs
                          />
                        </Text>
                        <ResponsiveLineStackLayout noMargin noColumnMargin>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Content</Trans>
                            </Text>
                            {sortedContentType.map(type => {
                              if (assetPack.content[type]) {
                                return (
                                  <li key={type}>
                                    <Text displayInlineAsSpan noMargin>
                                      {assetPack.content[type]}{' '}
                                      {i18n._(
                                        contentTypeToMessageDescriptor[type]
                                      )}
                                    </Text>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </Column>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Licensing</Trans>
                            </Text>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Personal projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Professional projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Asset modification</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Cross
                                fontSize="small"
                                style={styles.disabledText}
                              />
                              <Text
                                displayInlineAsSpan
                                noMargin
                                style={styles.disabledText}
                              >
                                <Trans>Redistribution &amp; reselling</Trans>
                              </Text>
                            </LineStackLayout>
                          </Column>
                        </ResponsiveLineStackLayout>
                      </Column>
                    </Paper>
                  </Column>
                </ResponsiveLineStackLayout>
              </>
            ) : null}
          </Dialog>
          {openSellerPublicProfileDialog && (
            <PublicProfileDialog
              userId={sellerId}
              onClose={() => setOpenSellerPublicProfileDialog(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateAssetPackDialog;

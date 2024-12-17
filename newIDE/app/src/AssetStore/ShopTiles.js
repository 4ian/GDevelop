// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import capitalize from 'lodash/capitalize';
import {
  type PublicAssetPack,
  type AssetShortHeader,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import type { ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import GridListTile from '@material-ui/core/GridListTile';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import ProductPriceTag, { renderProductPrice } from './ProductPriceTag';
import { AssetCard } from './AssetCard';
import FolderIcon from '../UI/CustomSvgIcons/Folder';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Skeleton from '@material-ui/lab/Skeleton';
import EmptyMessage from '../UI/EmptyMessage';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  priceTagContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    cursor: 'default',
  },
  previewImage: {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid lightgrey',
    boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
    // Prevent cumulative layout shift by enforcing
    // the 16:9 ratio.
    aspectRatio: '16 / 9',
    transition: 'opacity 0.3s ease-in-out',
    position: 'relative',
  },
  dataLoadingSkeleton: {
    // Display a skeleton with the same aspect and border as the images:
    borderRadius: 8,
    border: '1px solid lightgrey',
    boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
    aspectRatio: '16 / 9',
  },
  thumbnailContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  redeemableContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#FF8569',
    color: '#1D1D26',
  },
  redeemableDiamondIcon: { height: 24 },
  promoImage: {
    width: '20%',
    minWidth: 200,
    margin: 4,
  },
  paper: {
    margin: 4,
    display: 'flex',
    flexDirection: 'column',
  },
  packTitle: {
    ...textEllipsisStyle,
    overflowWrap: 'break-word',
  },
  folderTitle: {
    marginLeft: 8,
  },
  folderPaper: {
    height: 55,
  },
  folderIcon: {
    width: 32,
    height: 32,
  },
  promoLineContainer: {
    borderRadius: 8,
    padding: 2,
    flex: 1,
  },
  promoImageContainer: {
    display: 'flex',
    flex: 0,
    justifyContent: 'center',
  },
};

const useStylesForGridListItem = ({ disabled }: {| disabled?: boolean |}) =>
  makeStyles(theme =>
    createStyles({
      tile: !disabled
        ? {
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }
        : {},
    })
  )();

export const AssetCardTile = ({
  assetShortHeader,
  onOpenDetails,
  size,
  margin,
  hideShortDescription,
  disabled,
}: {|
  assetShortHeader: AssetShortHeader,
  onOpenDetails: () => void,
  size: number,
  margin?: number,
  hideShortDescription?: boolean,
  disabled?: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });

  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onOpenDetails();
        }
      }}
      onClick={!disabled ? onOpenDetails : undefined}
      style={{
        margin,
      }}
    >
      <AssetCard
        id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
        assetShortHeader={assetShortHeader}
        size={size}
        hideShortDescription={hideShortDescription}
      />
    </GridListTile>
  );
};

export const AssetFolderTile = ({
  tag,
  onSelect,
  style,
  disabled,
}: {|
  tag: string,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  disabled?: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <Column noMargin id={`asset-folder-${tag.replace(/\s/g, '-')}`}>
        <Line alignItems="center">
          <FolderIcon style={styles.folderIcon} />
          <Text noMargin style={styles.folderTitle} size="sub-title">
            {capitalize(tag)}
          </Text>
        </Line>
      </Column>
    </GridListTile>
  );
};

export const PublicAssetPackTile = ({
  assetPack,
  onSelect,
  style,
  disabled,
}: {|
  assetPack: PublicAssetPack,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  disabled?: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <div
        id={`asset-pack-${assetPack.tag.replace(/\s/g, '-')}`}
        style={styles.paper}
      >
        <CorsAwareImage
          key={assetPack.name}
          style={styles.previewImage}
          src={assetPack.thumbnailUrl}
          alt={`Preview image of asset pack ${assetPack.name}`}
          loading="lazy"
        />
        <Column>
          <Line justifyContent="space-between" noMargin>
            <Text style={styles.packTitle} size="body2">
              {assetPack.name}
            </Text>
            <Text style={styles.packTitle} color="primary" size="body2">
              <Trans>{assetPack.assetsCount} Assets</Trans>
              {assetPack.userFriendlyPrice
                ? ' - ' + assetPack.userFriendlyPrice
                : null}
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

export const PrivateAssetPackTile = ({
  assetPackListingData,
  onSelect,
  style,
  owned,
  disabled,
}: {|
  assetPackListingData: PrivateAssetPackListingData,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  owned: boolean,
  disabled?: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <div style={styles.paper}>
        <div style={styles.thumbnailContainer}>
          <CorsAwareImage
            key={assetPackListingData.name}
            style={styles.previewImage}
            src={assetPackListingData.thumbnailUrls[0]}
            alt={`Preview image of asset pack ${assetPackListingData.name}`}
            loading="lazy"
          />
          {assetPackListingData.redeemConditions && !owned && (
            <div style={styles.redeemableContainer}>
              <img
                src="res/small-diamond.svg"
                style={styles.redeemableDiamondIcon}
                alt="diamond"
              />
              <Text color="inherit" noMargin>
                <Trans>Claim this pack</Trans>
              </Text>
            </div>
          )}
        </div>
        <div style={styles.priceTagContainer}>
          <ProductPriceTag
            productListingData={assetPackListingData}
            withOverlay
            owned={owned}
          />
        </div>
        <Column>
          <Line justifyContent="space-between" noMargin>
            <Text style={styles.packTitle} size="body2">
              {assetPackListingData.name}
            </Text>
            <Text style={styles.packTitle} color="primary" size="body2">
              {assetPackListingData.description}
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

export const PromoBundleCard = ({
  productListingData,
  onSelect,
  owned,
}: {|
  productListingData:
    | PrivateAssetPackListingData
    | PrivateGameTemplateListingData,
  onSelect: () => void,
  owned: boolean,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <I18n>
      {({ i18n }) => (
        <Line expand>
          <div
            style={{
              ...styles.promoLineContainer,
              border: `2px solid ${gdevelopTheme.palette.secondary}`,
            }}
          >
            <ResponsiveLineStackLayout expand noMargin noResponsiveLandscape>
              <div style={styles.promoImageContainer}>
                <CorsAwareImage
                  key={productListingData.name}
                  style={{
                    ...styles.previewImage,
                    ...styles.promoImage,
                  }}
                  src={productListingData.thumbnailUrls[0]}
                  alt={`Preview image of bundle ${productListingData.name}`}
                  loading="lazy"
                />
              </div>
              <Column expand alignItems="flex-start" justifyContent="center">
                <Text color="primary" size="section-title">
                  {!owned ? (
                    <Trans>Get {productListingData.description}!</Trans>
                  ) : productListingData.productType === 'ASSET_PACK' ? (
                    <Trans>You already own this pack!</Trans>
                  ) : (
                    <Trans>You already own this template!</Trans>
                  )}
                </Text>
                <Text color="primary" size="body2">
                  {!owned ? (
                    productListingData.productType === 'ASSET_PACK' ? (
                      <Trans>
                        This pack is included in this bundle for{' '}
                        {renderProductPrice({
                          i18n,
                          productListingData,
                          plainText: true,
                        })}
                        !
                      </Trans>
                    ) : (
                      <Trans>
                        This template is included in this bundle for{' '}
                        {renderProductPrice({
                          i18n,
                          productListingData,
                          plainText: true,
                        })}
                        !
                      </Trans>
                    )
                  ) : (
                    <Trans>
                      It is included in the bundle {productListingData.name}.
                    </Trans>
                  )}
                </Text>
              </Column>
              <Column justifyContent="center">
                <Line justifyContent="center">
                  {!owned ? (
                    <FlatButton
                      label={<Trans>See this bundle</Trans>}
                      onClick={onSelect}
                      primary
                    />
                  ) : (
                    <RaisedButton
                      label={<Trans>See this bundle</Trans>}
                      onClick={onSelect}
                      primary
                    />
                  )}
                </Line>
              </Column>
            </ResponsiveLineStackLayout>
          </div>
        </Line>
      )}
    </I18n>
  );
};

export const CategoryTile = ({
  id,
  title,
  imageSource,
  imageAlt,
  onSelect,
  style,
  disabled,
}: {|
  id: string,
  title: React.Node,
  imageSource: string,
  imageAlt: string,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  disabled?: boolean,
|}) => {
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <div id={id} style={styles.paper}>
        <CorsAwareImage
          style={{
            ...styles.previewImage,
            background: gdevelopTheme.palette.primary,
          }}
          src={imageSource}
          alt={imageAlt}
          // No lazy loading because categories are the first seen tiles in the shop.
        />
        <Column>
          <Line justifyContent="center" noMargin>
            <Text style={styles.packTitle} size="sub-title">
              {title}
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

export const PrivateGameTemplateTile = ({
  privateGameTemplateListingData,
  onSelect,
  style,
  owned,
  disabled,
}: {|
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  owned: boolean,
  disabled?: boolean,
|}) => {
  const { isMobile } = useResponsiveWindowSize();
  const classesForGridListItem = useStylesForGridListItem({
    disabled,
  });
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <div style={styles.paper}>
        <CorsAwareImage
          key={privateGameTemplateListingData.name}
          style={styles.previewImage}
          src={privateGameTemplateListingData.thumbnailUrls[0]}
          alt={`Preview image of game template ${
            privateGameTemplateListingData.name
          }`}
          loading="lazy"
        />
        <div style={styles.priceTagContainer}>
          <ProductPriceTag
            productListingData={privateGameTemplateListingData}
            withOverlay
            owned={owned}
          />
        </div>
        <Column>
          {isMobile && <Spacer />}
          <Line justifyContent="flex-start" noMargin>
            <Text style={styles.packTitle} size="body2" noMargin={isMobile}>
              {privateGameTemplateListingData.name}
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

export const ExampleTile = ({
  exampleShortHeader,
  onSelect,
  style,
  customTitle,
  centerTitle,
  useQuickCustomizationThumbnail,
  disabled,
}: {|
  exampleShortHeader: ExampleShortHeader | null,
  onSelect: () => void,
  /** Props needed so that GridList component can adjust tile size */
  style?: any,
  customTitle?: string,
  centerTitle?: boolean,
  useQuickCustomizationThumbnail?: boolean,
  disabled?: boolean,
|}) => {
  const { isMobile } = useResponsiveWindowSize();
  const thumbnailImgUrl = React.useMemo(
    () => {
      if (!exampleShortHeader) return '';
      const firstPreviewUrl = exampleShortHeader.previewImageUrls[0] || '';
      const quickCustomizationImageUrl =
        exampleShortHeader.quickCustomizationImageUrl;
      if (useQuickCustomizationThumbnail && quickCustomizationImageUrl) {
        return quickCustomizationImageUrl;
      }

      return firstPreviewUrl;
    },
    [exampleShortHeader, useQuickCustomizationThumbnail]
  );

  const classesForGridListItem = useStylesForGridListItem({ disabled });
  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !disabled) {
          onSelect();
        }
      }}
      style={style}
      onClick={!disabled ? onSelect : undefined}
    >
      <div style={styles.paper}>
        {exampleShortHeader ? (
          thumbnailImgUrl ? (
            <CorsAwareImage
              key={exampleShortHeader.name}
              style={styles.previewImage}
              src={thumbnailImgUrl}
              alt={`Preview image of example ${exampleShortHeader.name}`}
              loading="lazy"
            />
          ) : (
            <EmptyMessage
              style={{
                ...styles.previewImage,
                display: 'flex',
              }}
            >
              {exampleShortHeader.name}
            </EmptyMessage>
          )
        ) : (
          <Skeleton
            variant="rect"
            width="100%"
            height="100%"
            style={styles.dataLoadingSkeleton}
          />
        )}
        <Column>
          {isMobile && <Spacer />}
          <Line justifyContent={centerTitle ? 'center' : 'flex-start'} noMargin>
            <Text
              style={styles.packTitle}
              size="body2"
              hidden={!exampleShortHeader}
              noMargin={isMobile}
            >
              {customTitle
                ? customTitle
                : exampleShortHeader
                ? exampleShortHeader.name
                : // Use some placeholder text to avoid layout shift while loading content.
                  'Abcdef123'}
            </Text>
          </Line>
        </Column>
      </div>
    </GridListTile>
  );
};

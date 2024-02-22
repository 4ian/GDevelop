// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Text from '../../UI/Text';
import { ProductLicenseStoreContext } from './ProductLicenseStoreContext';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import PlaceholderError from '../../UI/PlaceholderError';
import { Trans } from '@lingui/macro';
import {
  type PrivateGameTemplateListingData,
  type PrivateAssetPackListingData,
} from '../../Utils/GDevelopServices/Shop';
import { createStyles, makeStyles } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import ButtonBase from '@material-ui/core/ButtonBase';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import { renderProductPrice } from '../ProductPriceTag';
import CheckCircle from '../../UI/CustomSvgIcons/CheckCircle';

const styles = {
  buttonBase: {
    borderRadius: 8,
    padding: 8,
    cursor: 'default',
    overflow: 'hidden',
    boxSizing: 'border-box',
    margin: 1, // For the outline to be visible.
  },
  contentWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  radio: {
    padding: 0,
  },
  descriptionContainer: {
    paddingLeft: 32,
  },
};

const ProductLicenseOptionContent = ({
  selected,
  onClick,
  name,
  description,
  formattedPrice,
  isLicenseOwned,
}: {|
  selected: boolean,
  onClick?: () => void,
  name: string,
  description: string,
  formattedPrice?: React.Node,
  isLicenseOwned: boolean,
|}) => (
  <ColumnStackLayout noMargin>
    <LineStackLayout noMargin alignItems="center">
      <Column noMargin>
        {isLicenseOwned ? (
          <CheckCircle />
        ) : onClick ? (
          <Radio
            color="secondary"
            checked={selected}
            onChange={onClick}
            style={styles.radio}
          />
        ) : null}
      </Column>
      <LineStackLayout justifyContent="space-between" noMargin expand>
        <Text noMargin size="sub-title">
          {name}
        </Text>
        {!isLicenseOwned && formattedPrice}
      </LineStackLayout>
    </LineStackLayout>
    <Line expand noMargin>
      <div style={styles.descriptionContainer}>
        <Text noMargin align="left">
          {description}
        </Text>
      </div>
    </Line>
  </ColumnStackLayout>
);

// Styles to give the impression of pressing an element.
const useStylesForButtonBase = (selected: boolean) =>
  makeStyles(theme =>
    createStyles({
      root: {
        outline: selected
          ? `2px solid ${theme.palette.secondary.dark}`
          : `1px solid ${theme.palette.text.disabled}`,
        '&:focus': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        transition: 'background-color 100ms ease',
      },
    })
  )();

const ProductLicenseOptionButton = ({
  id,
  onClick,
  selected,
  name,
  description,
  formattedPrice,
  ownedLicense,
  disabled,
}: {|
  id: string,
  onClick: () => void,
  selected: boolean,
  name: string,
  description: string,
  formattedPrice: React.Node,
  ownedLicense: ?string,
  disabled?: boolean,
|}) => {
  const classes = useStylesForButtonBase(selected);

  if (!!ownedLicense && ownedLicense !== id) {
    // A license is owned, but not this one, hide the option.
    return null;
  }

  const isLicenseOwned = ownedLicense === id;

  return (
    <ButtonBase
      onClick={onClick}
      elevation={2}
      style={styles.buttonBase}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !selected) {
          onClick();
        }
      }}
      disableTouchRipple={selected} // Avoid ripple effect even if already selected.
      disabled={disabled || isLicenseOwned}
    >
      <div style={styles.contentWrapper}>
        <ProductLicenseOptionContent
          description={description}
          formattedPrice={formattedPrice}
          isLicenseOwned={isLicenseOwned}
          name={name}
          onClick={onClick}
          selected={selected}
        />
      </div>
    </ButtonBase>
  );
};

type Props = {|
  value: string,
  onChange: string => void,
  product: PrivateGameTemplateListingData | PrivateAssetPackListingData,
  ownedLicense: ?string,
  disabled?: boolean,
|};

const ProductLicenseOptions = ({
  value,
  onChange,
  product,
  ownedLicense,
  disabled,
}: Props) => {
  const {
    gameTemplateLicenses,
    assetPackLicenses,
    error,
    fetchProductLicenses,
  } = React.useContext(ProductLicenseStoreContext);

  const productType =
    product.productType === 'GAME_TEMPLATE' ? 'game-template' : 'asset-pack';
  const productLicenses =
    productType === 'game-template' ? gameTemplateLicenses : assetPackLicenses;

  React.useEffect(
    () => {
      fetchProductLicenses({ productType });
    },
    [fetchProductLicenses, productType]
  );

  if (error) {
    return (
      <PlaceholderError onRetry={() => fetchProductLicenses({ productType })}>
        <Trans>
          Can't load the licenses. Verify your internet connection or try again
          later.
        </Trans>
      </PlaceholderError>
    );
  }

  if (!productLicenses) return <PlaceholderLoader />;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          {productLicenses.map(license => {
            const productPriceForLicense = product.prices.find(
              price => price.usageType === license.id
            );
            if (!productPriceForLicense) return null;
            return (
              <ProductLicenseOptionButton
                key={license.id}
                id={license.id}
                onClick={() => onChange(license.id)}
                selected={license.id === value}
                name={selectMessageByLocale(i18n, license.nameByLocale)}
                description={selectMessageByLocale(
                  i18n,
                  license.descriptionByLocale
                )}
                formattedPrice={renderProductPrice({
                  i18n,
                  productListingData: product,
                  usageType: license.id,
                })}
                ownedLicense={ownedLicense}
                disabled={disabled}
              />
            );
          })}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export const OwnedProductLicense = ({
  ownedLicense,
  productType,
}: {|
  ownedLicense: ?string,
  productType: 'game-template' | 'asset-pack',
|}) => {
  const { gameTemplateLicenses, assetPackLicenses, error } = React.useContext(
    ProductLicenseStoreContext
  );

  const productLicenses =
    productType === 'game-template' ? gameTemplateLicenses : assetPackLicenses;

  if (error || !productLicenses) {
    return null;
  }

  const license = productLicenses.find(license => license.id === ownedLicense);
  if (!license) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <ProductLicenseOptionContent
          selected
          name={license.nameByLocale.en}
          description={license.descriptionByLocale.en}
          isLicenseOwned
        />
      )}
    </I18n>
  );
};

export default ProductLicenseOptions;

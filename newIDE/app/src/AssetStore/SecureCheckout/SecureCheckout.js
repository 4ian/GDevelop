// @flow
import React from 'react';
import { LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import ShieldChecked from '../../UI/CustomSvgIcons/ShieldChecked';

const SecureCheckout = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <LineStackLayout noMargin alignItems="center">
      <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
      <Text color="secondary">
        <Trans>Paypal secure</Trans>
      </Text>
      <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
      <Text color="secondary">
        <Trans>Stripe secure</Trans>
      </Text>
    </LineStackLayout>
  );
};

export default SecureCheckout;

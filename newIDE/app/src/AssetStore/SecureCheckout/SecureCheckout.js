// @flow
import React from 'react';
import { LineStackLayout } from '../../UI/Layout';
import Visa from '../../UI/CustomSvgIcons/Visa';
import MasterCard from '../../UI/CustomSvgIcons/MasterCard';
import Paypal from '../../UI/CustomSvgIcons/Paypal';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

const styles = {
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: 8,
  },
};

const LogoContainer = ({ children }) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div
      style={{
        ...styles.logoContainer,
        background: gdevelopTheme.palette.secondary,
      }}
    >
      {children}
    </div>
  );
};

const SecureCheckout = () => {
  return (
    <LineStackLayout>
      <Text>
        <Trans>Secure Checkout:</Trans>
      </Text>
      <LogoContainer>
        <Paypal />
      </LogoContainer>
      <LogoContainer>
        <Visa />
      </LogoContainer>
      <LogoContainer>
        <MasterCard />
      </LogoContainer>
    </LineStackLayout>
  );
};

export default SecureCheckout;

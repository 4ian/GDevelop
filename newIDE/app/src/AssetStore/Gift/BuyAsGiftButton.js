// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import { shouldUseAppStoreProduct } from '../../Utils/AppStorePurchases';

type Props = {|
  onClick: () => void,
  simulateAppStoreProduct?: boolean,
|};

// Gifts are paid on the web: purchases made with the app stores are tied to the account of the buyer.
const BuyAsGiftButton = ({
  onClick,
  simulateAppStoreProduct,
}: Props): React.Node => {
  if (simulateAppStoreProduct || shouldUseAppStoreProduct()) return null;

  return (
    <FlatButton
      primary
      label={<Trans>Buy as a gift</Trans>}
      onClick={onClick}
      id="buy-as-gift"
    />
  );
};

export default BuyAsGiftButton;

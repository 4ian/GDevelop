// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { ColumnStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import CreditsStatusBanner from './CreditsStatusBanner';
import RaisedButton from '../UI/RaisedButton';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PlaceholderLoader from '../UI/PlaceholderLoader';

type Props = {|
  onClose: () => void,
  title: React.Node,
  message: React.Node,
  onConfirm: () => Promise<void>,
  successMessage: React.Node,
  closeAutomaticallyAfterSuccess?: boolean,
|};

const CreditsUsageDialog = ({
  onClose,
  title,
  message,
  onConfirm,
  successMessage,
  closeAutomaticallyAfterSuccess,
}: Props) => {
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isPurchaseSuccessful, setisPurchaseSuccessful] = React.useState(false);
  const { showAlert } = useAlertDialog();
  const {
    onRefreshGameTemplatePurchases,
    onRefreshAssetPackPurchases,
    onPurchaseSuccessful,
    onRefreshLimits,
  } = React.useContext(AuthenticatedUserContext);

  const onPurchase = React.useCallback(
    async () => {
      setIsPurchasing(true);
      try {
        await onConfirm();
        // We assume that the purchase was successful, so we refresh the purchases and limits,
        // no need to wait for those to complete as they are not critical to the purchase.
        onRefreshGameTemplatePurchases();
        onRefreshAssetPackPurchases();
        onPurchaseSuccessful();
        onRefreshLimits();
        if (closeAutomaticallyAfterSuccess) onClose();

        // Show a success message to the user.
        setisPurchaseSuccessful(true);
      } catch (error) {
        console.error('An error happened while purchasing a product:', error);
        await showAlert({
          title: t`Could not purchase this product`,
          message: t`An error happened while purchasing this product. Verify your internet connection or try again later.`,
        });
      } finally {
        setIsPurchasing(false);
      }
    },
    [
      onConfirm,
      onRefreshGameTemplatePurchases,
      onRefreshAssetPackPurchases,
      onPurchaseSuccessful,
      onRefreshLimits,
      showAlert,
      closeAutomaticallyAfterSuccess,
      onClose,
    ]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={title}
          open
          maxWidth="sm"
          cannotBeDismissed // Prevent the user from continuing by clicking outside
          onRequestClose={onClose}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              onClick={onClose}
              disabled={isPurchasing}
            />,
            !isPurchaseSuccessful && (
              <RaisedButton
                key="confirm"
                label={<Trans>Purchase</Trans>}
                primary
                onClick={onPurchase}
                disabled={isPurchasing}
              />
            ),
          ]}
        >
          <ColumnStackLayout noMargin>
            <CreditsStatusBanner displayPurchaseAction={false} />
            <Column noMargin>
              {isPurchasing ? (
                <PlaceholderLoader />
              ) : isPurchaseSuccessful ? (
                <Text>{successMessage}</Text>
              ) : (
                <Text>{message}</Text>
              )}
            </Column>
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default CreditsUsageDialog;

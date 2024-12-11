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
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';

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
  const [isPurchaseSuccessful, setIsPurchaseSuccessful] = React.useState(false);
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
        setIsPurchaseSuccessful(true);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 409 &&
          extractedStatusAndCode.code ===
            'product-buy-with-credits/already-purchased'
        ) {
          await showAlert({
            title: t`You already own this product`,
            message: t`If you don't have access to it, restart GDevelop. If you still can't access it, please contact us.`,
          });
          return;
        }
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

// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { Column } from '../UI/Grid';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import CircularProgress from '../UI/CircularProgress';
import Download from '../UI/CustomSvgIcons/Download';
import { showErrorBox } from '../UI/Messages/MessageBox';
import AuthenticatedUserContext from './AuthenticatedUserContext';
import {
  listSubscriptionPayments,
  generateSubscriptionPaymentInvoice,
  type SubscriptionPayment,
} from '../Utils/GDevelopServices/Usage';
import {
  listInvoiceablePurchases,
  generatePurchaseInvoice,
  type PurchaseWithProductName,
  type ProductType,
} from '../Utils/GDevelopServices/Shop';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { openBlobDownloadUrl } from '../Utils/BlobDownloadUrlHolder';

const formatAmount = (
  i18n: I18nType,
  amountInCents: number,
  currency: string
): string =>
  i18n.number(amountInCents / 100, {
    style: 'currency',
    currency,
  });

const getProductTypeLabel = (productType: ProductType) => {
  switch (productType) {
    case 'ASSET_PACK':
      return <Trans>Asset pack</Trans>;
    case 'GAME_TEMPLATE':
      return <Trans>Game template</Trans>;
    case 'CREDITS_PACKAGE':
      return <Trans>Credits</Trans>;
    case 'COURSE':
    case 'COURSE_CHAPTER':
      return <Trans>Course</Trans>;
    case 'BUNDLE':
      return <Trans>Bundle</Trans>;
    default:
      return null;
  }
};

const getPurchaseDetails = (
  i18n: I18nType,
  purchase: PurchaseWithProductName
): string => {
  const date = i18n.date(purchase.createdAt);
  const { paymentDetails } = purchase;
  if (!paymentDetails || paymentDetails.total === null) return date;

  return `${date} · ${formatAmount(
    i18n,
    paymentDetails.total,
    paymentDetails.currency || 'USD'
  )}`;
};

type InvoiceRowProps = {|
  title: React.Node,
  details: string,
  isDownloading: boolean,
  disabled: boolean,
  onDownload: () => Promise<void>,
|};

const InvoiceRow = ({
  title,
  details,
  isDownloading,
  disabled,
  onDownload,
}: InvoiceRowProps) => (
  <LineStackLayout noMargin alignItems="center" justifyContent="space-between">
    <Column noMargin>
      <Text noMargin>{title}</Text>
      <Text noMargin size="body-small" color="secondary">
        {details}
      </Text>
    </Column>
    <FlatButton
      leftIcon={
        isDownloading ? (
          <CircularProgress size={16} />
        ) : (
          <Download fontSize="small" />
        )
      }
      label={<Trans>Download invoice</Trans>}
      disabled={disabled}
      onClick={onDownload}
    />
  </LineStackLayout>
);

type Props = {|
  onClose: () => void,
|};

const InvoicesDialog = ({ onClose }: Props): React.Node => {
  const { getAuthorizationHeader, firebaseUser } = React.useContext(
    AuthenticatedUserContext
  );
  const userId = firebaseUser ? firebaseUser.uid : null;
  const [
    subscriptionPayments,
    setSubscriptionPayments,
  ] = React.useState<?Array<SubscriptionPayment>>(null);
  const [
    invoiceablePurchases,
    setInvoiceablePurchases,
  ] = React.useState<?Array<PurchaseWithProductName>>(null);
  const [loadingError, setLoadingError] = React.useState<?Error>(null);
  const [downloadingId, setDownloadingId] = React.useState<?string>(null);

  const loadInvoices = React.useCallback(
    async () => {
      if (!userId) return;
      setLoadingError(null);
      try {
        const [
          fetchedSubscriptionPayments,
          fetchedInvoiceablePurchases,
        ] = await Promise.all([
          listSubscriptionPayments(getAuthorizationHeader, userId),
          listInvoiceablePurchases(getAuthorizationHeader, userId),
        ]);
        setSubscriptionPayments(fetchedSubscriptionPayments);
        setInvoiceablePurchases(fetchedInvoiceablePurchases);
      } catch (error) {
        console.error('Unable to load invoices:', error);
        setLoadingError(error);
      }
    },
    [getAuthorizationHeader, userId]
  );

  React.useEffect(
    () => {
      loadInvoices();
    },
    [loadInvoices]
  );

  const downloadInvoice = React.useCallback(
    async (
      i18n: I18nType,
      id: string,
      generateInvoice: (userId: string) => Promise<Blob>
    ) => {
      if (!userId) return;
      setDownloadingId(id);
      try {
        const invoiceBlob = await generateInvoice(userId);
        const invoiceUrl = URL.createObjectURL(invoiceBlob);
        openBlobDownloadUrl(invoiceUrl, `GDevelop-invoice-${id}.pdf`);
        // Revoke later so the download has time to start.
        setTimeout(() => URL.revokeObjectURL(invoiceUrl), 60000);
      } catch (error) {
        showErrorBox({
          message: i18n._(
            t`Unable to generate this invoice. Please try again later or contact us on billing@gdevelop.io`
          ),
          rawError: error,
          errorId: 'invoice-generation-error',
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [userId]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Invoices</Trans>}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              key="close"
              primary={false}
              onClick={onClose}
            />,
          ]}
          onRequestClose={onClose}
          open
          maxWidth="sm"
        >
          {loadingError ? (
            <PlaceholderError onRetry={loadInvoices}>
              <Trans>
                Unable to load your payments. Verify your internet connection or
                try again later.
              </Trans>
            </PlaceholderError>
          ) : !subscriptionPayments || !invoiceablePurchases ? (
            <PlaceholderLoader />
          ) : (
            <ColumnStackLayout noMargin>
              <Text size="block-title">
                <Trans>Subscription payments</Trans>
              </Text>
              {subscriptionPayments.length === 0 ? (
                <Text color="secondary">
                  <Trans>No subscription payments.</Trans>
                </Text>
              ) : (
                subscriptionPayments.map(subscriptionPayment => (
                  <InvoiceRow
                    key={subscriptionPayment.id}
                    title={
                      subscriptionPayment.planNameByLocale ? (
                        selectMessageByLocale(
                          i18n,
                          subscriptionPayment.planNameByLocale
                        )
                      ) : (
                        <Trans>GDevelop subscription</Trans>
                      )
                    }
                    details={`${i18n.date(
                      subscriptionPayment.createdAt
                    )} · ${formatAmount(
                      i18n,
                      subscriptionPayment.amount,
                      subscriptionPayment.currency
                    )}`}
                    isDownloading={downloadingId === subscriptionPayment.id}
                    disabled={!!downloadingId}
                    onDownload={() =>
                      downloadInvoice(i18n, subscriptionPayment.id, userId =>
                        generateSubscriptionPaymentInvoice(
                          getAuthorizationHeader,
                          userId,
                          subscriptionPayment
                        )
                      )
                    }
                  />
                ))
              )}
              <Text size="block-title">
                <Trans>Purchases</Trans>
              </Text>
              {invoiceablePurchases.length === 0 ? (
                <Text color="secondary">
                  <Trans>No purchases.</Trans>
                </Text>
              ) : (
                invoiceablePurchases.map(invoiceablePurchase => (
                  <InvoiceRow
                    key={invoiceablePurchase.id}
                    title={
                      invoiceablePurchase.productName ||
                      getProductTypeLabel(invoiceablePurchase.productType)
                    }
                    details={getPurchaseDetails(i18n, invoiceablePurchase)}
                    isDownloading={downloadingId === invoiceablePurchase.id}
                    disabled={!!downloadingId}
                    onDownload={() =>
                      downloadInvoice(i18n, invoiceablePurchase.id, userId =>
                        generatePurchaseInvoice(
                          getAuthorizationHeader,
                          userId,
                          invoiceablePurchase.id
                        )
                      )
                    }
                  />
                ))
              )}
              <Text size="body-small" color="secondary">
                <Trans>
                  Payments made in the mobile app are billed by the App Store or
                  Google Play, which provide their receipts.
                </Trans>
              </Text>
            </ColumnStackLayout>
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default InvoicesDialog;

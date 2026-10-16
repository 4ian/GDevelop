// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../PaperDecorator';
import InvoicesDialog from '../../../Profile/InvoicesDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';
import {
  apiClient as usageApiAxiosClient,
  type SubscriptionPayment,
} from '../../../Utils/GDevelopServices/Usage';
import {
  client as shopApiAxiosClient,
  type InvoiceablePurchase,
} from '../../../Utils/GDevelopServices/Shop';

export default {
  title: 'Profile/InvoicesDialog',
  component: InvoicesDialog,
  decorators: [paperDecorator],
};

const subscriptionPayments: Array<SubscriptionPayment> = [
  {
    id: 'in_1PaidWithStripe',
    createdAt: '2026-09-12T10:00:00.000Z',
    amount: 1099,
    currency: 'EUR',
    planNameByLocale: { en: 'Gold', fr: 'Or' },
    invoiceRequest: { stripeInvoiceId: 'in_1PaidWithStripe' },
  },
  {
    id: 'in_2PaidWithStripe',
    createdAt: '2026-08-12T10:00:00.000Z',
    amount: 1099,
    currency: 'EUR',
    planNameByLocale: { en: 'Gold', fr: 'Or' },
    invoiceRequest: { stripeInvoiceId: 'in_2PaidWithStripe' },
  },
  {
    id: 'PAYPAL-TRANSACTION-1',
    createdAt: '2025-03-02T08:30:00.000Z',
    amount: 4999,
    currency: 'USD',
    planNameByLocale: null,
    invoiceRequest: {
      paypalSubscriptionId: 'I-PAYPALSUBSCRIPTION',
      paypalTransactionId: 'PAYPAL-TRANSACTION-1',
    },
  },
];

const invoiceablePurchases: Array<InvoiceablePurchase> = [
  {
    id: '6f2a3c1e-0000-4000-8000-000000000001',
    productId: 'product-1',
    productType: 'BUNDLE',
    productName: 'Platformer starter bundle',
    createdAt: '2026-07-01T14:00:00.000Z',
    total: 2999,
    currency: 'USD',
  },
  {
    id: '6f2a3c1e-0000-4000-8000-000000000002',
    productId: 'product-2',
    productType: 'ASSET_PACK',
    productName: 'Medieval Fantasy Pack',
    createdAt: '2026-05-20T09:15:00.000Z',
    total: 1499,
    currency: 'EUR',
  },
  {
    id: '6f2a3c1e-0000-4000-8000-000000000003',
    productId: 'product-3',
    productType: 'CREDITS_PACKAGE',
    productName: null,
    createdAt: '2025-12-24T18:45:00.000Z',
    total: 999,
    currency: 'EUR',
  },
];

const fakeInvoicePdf = new Blob(['%PDF-1.4 fake invoice'], {
  type: 'application/pdf',
});

const mockApis = ({
  subscriptionPaymentsReply,
  invoiceablePurchasesReply,
  invoiceReply,
}: {|
  subscriptionPaymentsReply: [number, any],
  invoiceablePurchasesReply: [number, any],
  invoiceReply: [number, any],
|}) => {
  const usageServiceMock = new MockAdapter(usageApiAxiosClient, {
    delayResponse: 300,
  });
  usageServiceMock
    .onGet('/subscription-payment')
    .reply(subscriptionPaymentsReply[0], subscriptionPaymentsReply[1])
    .onPost('/subscription-v2/action/generate-invoice')
    .reply(config => {
      action('Generate subscription invoice')(config.data);
      return invoiceReply;
    })
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse: 300,
  });
  shopServiceMock
    .onGet('/purchase/invoiceable')
    .reply(invoiceablePurchasesReply[0], invoiceablePurchasesReply[1])
    .onPost(/\/purchase\/.*\/action\/generate-invoice/)
    .reply(config => {
      action('Generate purchase invoice')(config.url);
      return invoiceReply;
    })
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
};

const InvoicesDialogWithUser = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <InvoicesDialog onClose={() => action('close')()} />
  </AuthenticatedUserContext.Provider>
);

export const WithPaymentsAndPurchases = (): React.Node => {
  mockApis({
    subscriptionPaymentsReply: [200, subscriptionPayments],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const OnlyPurchases = (): React.Node => {
  mockApis({
    subscriptionPaymentsReply: [200, []],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const NothingToInvoice = (): React.Node => {
  mockApis({
    subscriptionPaymentsReply: [200, []],
    invoiceablePurchasesReply: [200, []],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const LoadingError = (): React.Node => {
  mockApis({
    subscriptionPaymentsReply: [500, null],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const InvoiceGenerationError = (): React.Node => {
  mockApis({
    subscriptionPaymentsReply: [200, subscriptionPayments],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [500, null],
  });
  return <InvoicesDialogWithUser />;
};

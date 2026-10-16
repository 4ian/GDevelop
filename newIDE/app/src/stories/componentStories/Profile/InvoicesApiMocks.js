// @flow
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import {
  apiClient as usageApiAxiosClient,
  type SubscriptionPayment,
} from '../../../Utils/GDevelopServices/Usage';
import {
  client as shopApiAxiosClient,
  type PurchaseWithProductName,
} from '../../../Utils/GDevelopServices/Shop';

export const subscriptionPayments: Array<SubscriptionPayment> = [
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

export const invoiceablePurchases: Array<PurchaseWithProductName> = [
  {
    id: '6f2a3c1e-0000-4000-8000-000000000001',
    productId: 'product-1',
    productType: 'BUNDLE',
    productName: 'Platformer starter bundle',
    createdAt: '2026-07-01T14:00:00.000Z',
    usageType: 'default',
    buyerId: 'fake-user-id',
    receiverId: 'fake-user-id',
    stripeCheckoutSessionId: 'cs_fake_session',
    paymentDetails: { total: 2999, currency: 'USD' },
  },
  {
    id: '6f2a3c1e-0000-4000-8000-000000000002',
    productId: 'product-2',
    productType: 'ASSET_PACK',
    productName: 'Medieval Fantasy Pack',
    createdAt: '2026-05-20T09:15:00.000Z',
    usageType: 'default',
    buyerId: 'fake-user-id',
    receiverId: 'fake-user-id',
    stripeCheckoutSessionId: 'cs_fake_session',
    paymentDetails: { total: 1499, currency: 'EUR' },
  },
  {
    id: '6f2a3c1e-0000-4000-8000-000000000003',
    productId: 'product-3',
    productType: 'CREDITS_PACKAGE',
    productName: null,
    createdAt: '2025-12-24T18:45:00.000Z',
    usageType: 'default',
    buyerId: 'fake-user-id',
    receiverId: 'fake-user-id',
    stripeCheckoutSessionId: 'cs_fake_session',
    paymentDetails: { total: 999, currency: 'EUR' },
  },
];

// A minimal valid one-page PDF (the xref offsets must match the content).
export const fakeInvoicePdf: Blob = new Blob(
  [
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 43 >>\nstream\nBT /F1 24 Tf 72 720 Td (Fake invoice) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000241 00000 n \n0000000334 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n404\n%%EOF\n',
  ],
  { type: 'application/pdf' }
);

export const mockInvoicesApis = ({
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
    .onGet('/purchase')
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

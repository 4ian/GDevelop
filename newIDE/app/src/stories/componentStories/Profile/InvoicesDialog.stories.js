// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import InvoicesDialog from '../../../Profile/InvoicesDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';
import {
  subscriptionPayments,
  invoiceablePurchases,
  fakeInvoicePdf,
  mockInvoicesApis,
} from './InvoicesApiMocks';

export default {
  title: 'Profile/InvoicesDialog',
  component: InvoicesDialog,
  decorators: [paperDecorator],
};

const InvoicesDialogWithUser = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <InvoicesDialog onClose={() => action('close')()} />
  </AuthenticatedUserContext.Provider>
);

export const WithPaymentsAndPurchases = (): React.Node => {
  mockInvoicesApis({
    subscriptionPaymentsReply: [200, subscriptionPayments],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const OnlyPurchases = (): React.Node => {
  mockInvoicesApis({
    subscriptionPaymentsReply: [200, []],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const NothingToInvoice = (): React.Node => {
  mockInvoicesApis({
    subscriptionPaymentsReply: [200, []],
    invoiceablePurchasesReply: [200, []],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const LoadingError = (): React.Node => {
  mockInvoicesApis({
    subscriptionPaymentsReply: [500, null],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [200, fakeInvoicePdf],
  });
  return <InvoicesDialogWithUser />;
};

export const InvoiceGenerationError = (): React.Node => {
  mockInvoicesApis({
    subscriptionPaymentsReply: [200, subscriptionPayments],
    invoiceablePurchasesReply: [200, invoiceablePurchases],
    invoiceReply: [500, null],
  });
  return <InvoicesDialogWithUser />;
};

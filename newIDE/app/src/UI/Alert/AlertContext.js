// @flow
import * as React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type ShowAlertDialogOptions = {|
  title: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
|};

export type ShowConfirmDialogOptions = {|
  title: MessageDescriptor,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
|};

export type ShowConfirmDeleteDialogOptions = {|
  title: MessageDescriptor,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
  fieldMessage: MessageDescriptor,
  confirmText: string,
|};

export type ConfirmState = {|
  showAlertDialog: ShowAlertDialogOptions => Promise<void>,
  showConfirmDialog: ShowConfirmDialogOptions => Promise<boolean>,
  showConfirmDeleteDialog: ShowConfirmDeleteDialogOptions => Promise<boolean>,
|};

const initialConfirmState = {
  showAlertDialog: async () => {},
  showConfirmDialog: async () => {
    return false;
  },
  showConfirmDeleteDialog: async () => {
    return false;
  },
};

const AlertContext = React.createContext<ConfirmState>(initialConfirmState);

export default AlertContext;

// @flow
import * as React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

// Alert
export type ShowAlertDialogOptions = {|
  title: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
|};
export type ShowAlertDialogOptionsWithCallback = {|
  ...ShowAlertDialogOptions,
  callback: Function,
|};
export type ShowAlertFunction = ShowAlertDialogOptions => Promise<void>;

// Confirm
export type ShowConfirmDialogOptions = {|
  title: MessageDescriptor,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
  level?: 'info' | 'warning',
  makeDismissButtonPrimary?: boolean,
|};
export type ShowConfirmDialogOptionsWithCallback = {|
  ...ShowConfirmDialogOptions,
  callback: Function,
|};
export type ShowConfirmFunction = ShowConfirmDialogOptions => Promise<boolean>;

// Confirm Delete
export type ShowConfirmDeleteDialogOptions = {|
  title: MessageDescriptor,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  message: MessageDescriptor,
  fieldMessage: MessageDescriptor,
  confirmText: string,
|};
export type ShowConfirmDeleteDialogOptionsWithCallback = {|
  ...ShowConfirmDeleteDialogOptions,
  callback: Function,
|};
export type ShowConfirmDeleteFunction = ShowConfirmDeleteDialogOptions => Promise<boolean>;

export type ConfirmState = {|
  showAlertDialog: ShowAlertDialogOptionsWithCallback => void,
  showConfirmDialog: ShowConfirmDialogOptionsWithCallback => void,
  showConfirmDeleteDialog: ShowConfirmDeleteDialogOptionsWithCallback => void,
|};

const initialConfirmState = {
  showAlertDialog: ShowAlertDialogOptionsWithCallback => {},
  showConfirmDialog: ShowConfirmDialogOptionsWithCallback => {},
  showConfirmDeleteDialog: ShowConfirmDeleteDialogOptionsWithCallback => {},
};

const AlertContext = React.createContext<ConfirmState>(initialConfirmState);

export default AlertContext;

// @flow
import React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

// Alert
export type ShowAlertDialogOptions = {|
  title: MessageDescriptor,
  message: MessageDescriptor,
|};
export type ShowAlertDialogOptionsWithCallback = {|
  ...ShowAlertDialogOptions,
  callback: Function,
|};

// Confirm
export type ShowConfirmDialogOptions = {|
  title: MessageDescriptor,
  message: MessageDescriptor,
|};
export type ShowConfirmDialogOptionsWithCallback = {|
  ...ShowConfirmDialogOptions,
  callback: Function,
|};

// Confirm Delete
export type ShowConfirmDeleteDialogOptions = {|
  title: MessageDescriptor,
  message: MessageDescriptor,
  fieldMessage: MessageDescriptor,
  confirmText: string,
|};
export type ShowConfirmDeleteDialogOptionsWithCallback = {|
  ...ShowConfirmDeleteDialogOptions,
  callback: Function,
|};

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

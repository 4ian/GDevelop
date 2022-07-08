// @flow
import React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type ShowConfirmDialogOptions = {|
  title: MessageDescriptor,
  message: MessageDescriptor,
|};

export type ShowConfirmDialogOptionsWithCallback = {|
  ...ShowConfirmDialogOptions,
  callback: Function,
|};

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
  showConfirmDialog: ShowConfirmDialogOptionsWithCallback => void,
  showConfirmDeleteDialog: ShowConfirmDeleteDialogOptionsWithCallback => void,
|};

const initialConfirmState = {
  showConfirmDialog: ShowConfirmDialogOptionsWithCallback => {},
  showConfirmDeleteDialog: ShowConfirmDeleteDialogOptionsWithCallback => {},
};

const ConfirmContext = React.createContext<ConfirmState>(initialConfirmState);

export default ConfirmContext;

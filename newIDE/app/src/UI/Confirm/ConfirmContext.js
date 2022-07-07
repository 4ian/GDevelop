// @flow
import React from 'react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type ShowConfirmDialogOptions = {
  title: MessageDescriptor,
  message: MessageDescriptor,
  actionCallback: Function,
};
export type ConfirmState = {|
  showConfirmDialog: ShowConfirmDialogOptions => void,
|};

const initialConfirmState = {
  showConfirmDialog: ShowConfirmDialogOptions => {},
};

const ConfirmContext = React.createContext<ConfirmState>(initialConfirmState);

export default ConfirmContext;

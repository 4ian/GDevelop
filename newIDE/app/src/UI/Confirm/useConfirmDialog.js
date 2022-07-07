// @flow
import * as React from 'react';
import ConfirmContext from './ConfirmContext';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export type ConfirmProps = {|
  title: MessageDescriptor,
  message: MessageDescriptor,
|};

const useConfirmDialog = () => {
  const { showConfirmDialog } = React.useContext(ConfirmContext);

  const getConfirmation = (options: ConfirmProps): Promise<boolean> =>
    new Promise((resolve, reject) => {
      showConfirmDialog({ actionCallback: resolve, ...options });
    });

  return { getConfirmation };
};

export default useConfirmDialog;

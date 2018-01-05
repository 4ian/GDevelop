// @flow

import Window from '../../Utils/Window';
import { sendErrorMessage } from '../../Utils/Analytics/EventSender';

export const showMessageBox = (message: string) => {
  Window.showMessageBox(message, 'info');
};

export const showErrorBox = (message: string, rawError: any) => {
  Window.showMessageBox(message, 'error');
  sendErrorMessage(message, 'error', rawError);
  console.error(message, 'raw error:', rawError);
};

export const showWarningBox = (message: string, rawError: any) => {
  Window.showMessageBox(message, 'warning');
  sendErrorMessage(message, 'warning', rawError);
  console.warn(message, 'raw error:', rawError);
};

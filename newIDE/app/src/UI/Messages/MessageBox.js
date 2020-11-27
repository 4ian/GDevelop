// @flow

import Window from '../../Utils/Window';
import { sendErrorMessage } from '../../Utils/Analytics/EventSender';

export const showMessageBox = (message: string) => {
  Window.showMessageBox(message, 'info');
};

export const showWarningBox = (message: string) => {
  Window.showMessageBox(message, 'warning');
};

type ErrorArgs = {|
  message: string,
  rawError: ?Error | Object,
  errorId: string,
  doNotReport?: boolean,
|};

export const showErrorBox = ({
  message,
  rawError,
  errorId,
  doNotReport,
}: ErrorArgs) => {
  Window.showMessageBox(message, 'error');
  if (!doNotReport) {
    sendErrorMessage(message, 'error', rawError, errorId);
  }
  console.error(`${errorId}: "${message}". Raw error:`, rawError);
};

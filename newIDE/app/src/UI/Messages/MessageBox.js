// @flow

import Window from '../../Utils/Window';
import { sendErrorMessage } from '../../Utils/Analytics/EventSender';

export const showMessageBox = (message: string) => {
  Window.showMessageBox(message, 'info');
};

type WarningOptions = {|
  /**
   * Delay the display of the warning to the next tick, not blocking the current function
   * execution. This can be useful to work around freezing issues on Linux.
   */
  delayToNextTick: boolean,
|};

export const showWarningBox = (message: string, options?: WarningOptions) => {
  if (options && options.delayToNextTick) {
    setTimeout(() => {
      Window.showMessageBox(message, 'warning');
    });
  } else {
    Window.showMessageBox(message, 'warning');
  }
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

// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';
import AlertProvider from './AlertProvider';
import useAlertDialog from './useAlertDialog';
import { type ShowConfirmFunction } from './AlertContext';

jest.mock('../../Utils/Window', () => ({
  __esModule: true,
  default: { isRunningCommandFromCli: () => false },
}));

let mockConfirmDialogProps: any = null;
jest.mock('./ConfirmDialog', () => (props: Object) => {
  mockConfirmDialogProps = props;
  return null;
});

let showConfirmation: ?ShowConfirmFunction = null;
const ConfirmationConsumer = () => {
  showConfirmation = useAlertDialog().showConfirmation;
  return null;
};

describe('AlertProvider', () => {
  it('dismisses a confirmation when its abort signal fires', async () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(
        <AlertProvider>
          <ConfirmationConsumer />
        </AlertProvider>
      );
    });
    const activeShowConfirmation = showConfirmation;
    if (!activeShowConfirmation) {
      throw new Error('Expected the confirmation function to be available.');
    }

    const dismissController = new AbortController();
    let confirmationPromise = Promise.resolve(true);
    act(() => {
      confirmationPromise = activeShowConfirmation({
        title: { id: 'Test confirmation' },
        message: { id: 'Test message' },
        dismissOnAbortSignal: dismissController.signal,
      });
    });
    expect(mockConfirmDialogProps.open).toBe(true);

    await act(async () => {
      dismissController.abort();
      await Promise.resolve();
    });

    await expect(confirmationPromise).resolves.toBe(false);
    expect(mockConfirmDialogProps.open).toBe(false);
    act(() => renderer.unmount());
  });
});

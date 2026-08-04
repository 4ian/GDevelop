// @flow

import { safelyRemoveWindowEventListener } from './CrossOriginWindowEventListener';

describe('safelyRemoveWindowEventListener', () => {
  it('removes a listener from a same-origin window', () => {
    const listener: any = jest.fn();
    const removeEventListener: any = jest.fn();

    expect(
      safelyRemoveWindowEventListener(
        { removeEventListener },
        'dragenter',
        listener,
        true
      )
    ).toBe(true);
    expect(removeEventListener).toHaveBeenCalledWith(
      'dragenter',
      listener,
      true
    );
  });

  it('does not throw when an iframe window has navigated cross-origin', () => {
    const securityError = new Error(
      'Blocked a frame from accessing a cross-origin frame.'
    );
    securityError.name = 'SecurityError';
    const listener: any = jest.fn();
    const removeEventListener: any = jest.fn(() => {
      throw securityError;
    });

    expect(
      safelyRemoveWindowEventListener(
        { removeEventListener },
        'dragenter',
        listener,
        true
      )
    ).toBe(false);
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('does not hide unrelated listener cleanup failures', () => {
    const cleanupError = new Error('Unexpected listener cleanup failure.');
    const listener: any = jest.fn();
    const removeEventListener: any = jest.fn(() => {
      throw cleanupError;
    });

    expect(() =>
      safelyRemoveWindowEventListener(
        { removeEventListener },
        'dragenter',
        listener,
        true
      )
    ).toThrow(cleanupError);
  });
});

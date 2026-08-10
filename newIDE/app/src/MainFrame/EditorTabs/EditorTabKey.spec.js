// @flow
import { getEditorTabKey } from './EditorTabKey';

describe('getEditorTabKey', () => {
  it('uses the test script name for gameplay test editor keys', () => {
    expect(getEditorTabKey('gameplay-test', 'Player can jump')).toBe(
      'gameplay-test Player can jump'
    );
  });

  it('keeps singleton editor keys independent from project item names', () => {
    expect(getEditorTabKey('debugger', 'ignored')).toBe('debugger');
  });
});

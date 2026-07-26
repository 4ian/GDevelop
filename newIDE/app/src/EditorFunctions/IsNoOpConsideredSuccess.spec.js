// @flow
import { isNoOpConsideredSuccess } from './IsNoOpConsideredSuccess';

describe('isNoOpConsideredSuccess', () => {
  it('treats a no-op as a success from tools v12 onwards', () => {
    expect(isNoOpConsideredSuccess('v12')).toBe(true);
    expect(isNoOpConsideredSuccess('v13')).toBe(true);
    expect(isNoOpConsideredSuccess('v20')).toBe(true);
    expect(isNoOpConsideredSuccess('v100')).toBe(true);
  });

  it('keeps a no-op as a failure before v12 (shipped tool-call behavior)', () => {
    expect(isNoOpConsideredSuccess('v11')).toBe(false);
    expect(isNoOpConsideredSuccess('v8')).toBe(false);
    expect(isNoOpConsideredSuccess('v3')).toBe(false);
    expect(isNoOpConsideredSuccess('v1')).toBe(false);
  });

  it('treats an unknown/missing/garbage version as pre-v12 (keeps the failure)', () => {
    expect(isNoOpConsideredSuccess(null)).toBe(false);
    expect(isNoOpConsideredSuccess(undefined)).toBe(false);
    expect(isNoOpConsideredSuccess('')).toBe(false);
    expect(isNoOpConsideredSuccess('not-a-version')).toBe(false);
    expect(isNoOpConsideredSuccess('v')).toBe(false);
    expect(isNoOpConsideredSuccess('version12')).toBe(false);
  });
});

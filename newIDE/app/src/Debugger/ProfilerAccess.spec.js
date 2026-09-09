// @flow
import { isProfilerAccessAllowed } from './ProfilerAccess';

const makeProfile = (username: ?string) => ({ username });

describe('ProfilerAccess', () => {
  it('allows everyone in development', () => {
    expect(isProfilerAccessAllowed(null, true)).toBe(true);
    expect(isProfilerAccessAllowed(makeProfile('Anyone'), true)).toBe(true);
  });

  it('allows only the listed usernames in production', () => {
    expect(isProfilerAccessAllowed(null, false)).toBe(false);
    expect(isProfilerAccessAllowed(makeProfile(null), false)).toBe(false);
    expect(isProfilerAccessAllowed(makeProfile('Anyone'), false)).toBe(false);
    expect(isProfilerAccessAllowed(makeProfile('Bouh'), false)).toBe(true);
    expect(isProfilerAccessAllowed(makeProfile('crowbar_coder'), false)).toBe(
      true
    );
    expect(isProfilerAccessAllowed(makeProfile(' VegeTato '), false)).toBe(
      true
    );
    expect(isProfilerAccessAllowed(makeProfile('GDevelop'), false)).toBe(true);
  });
});

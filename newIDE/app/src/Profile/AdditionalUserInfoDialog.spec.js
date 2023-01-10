// @flow
import { indieUserProfile } from '../fixtures/GDevelopServicesTestData';
import { shouldAskForAdditionalUserInfo } from './AdditionalUserInfoDialog';

describe('AdditionalUserInfoDialog', () => {
  describe('shouldAskForAdditionalUserInfo', () => {
    test('Require additional info when needed', () => {
      // Nothing filled.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
        })
      ).toBe(true);

      // Everything filled.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'fully-filled',
          teamOrCompanySize: 'fully-filled',
          companyName: 'fully-filled',
          creationExperience: 'fully-filled',
          creationGoal: 'fully-filled',
          hearFrom: 'fully-filled',
        })
      ).toBe(false);

      // Personal usage, fully filled.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'personal',
          teamOrCompanySize: 'filled',
          companyName: 'filled',
          creationExperience: 'filled',
          creationGoal: 'filled',
          hearFrom: 'filled',
        })
      ).toBe(false);

      // Personal usage, partially filled but with a creation goal set.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'personal',
          teamOrCompanySize: '',
          companyName: '',
          creationExperience: '',
          creationGoal: 'filled',
          hearFrom: '',
        })
      ).toBe(false);

      // Unset usage, without creation goal.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: '',
          teamOrCompanySize: 'filled',
          companyName: 'filled',
          creationExperience: 'filled',
          creationGoal: '',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Personal or student, without creation goal.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'student',
          teamOrCompanySize: 'filled',
          companyName: 'filled',
          creationExperience: 'filled',
          creationGoal: '',
          hearFrom: 'filled',
        })
      ).toBe(true);
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'personal',
          teamOrCompanySize: 'filled',
          companyName: 'filled',
          creationExperience: 'filled',
          creationGoal: '',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Teacher or training but without goal.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'teacher',
          teamOrCompanySize: 'filled',
          companyName: 'filled',
          creationExperience: 'filled',
          creationGoal: '',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Game studio, without company size or company name.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'work-gamedev',
          teamOrCompanySize: '',
          companyName: '',
          creationExperience: 'filled',
          creationGoal: 'filled',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Other work, without company size or company name.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'work-marketing',
          teamOrCompanySize: '',
          companyName: '',
          creationExperience: 'filled',
          creationGoal: 'filled',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Other work, without company size or company name.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'work-other',
          teamOrCompanySize: '',
          companyName: '',
          creationExperience: 'filled',
          creationGoal: 'filled',
          hearFrom: 'filled',
        })
      ).toBe(true);

      // Teacher, without university size or university name.
      expect(
        shouldAskForAdditionalUserInfo({
          ...indieUserProfile,
          gdevelopUsage: 'work-other',
          teamOrCompanySize: '',
          companyName: '',
          creationExperience: 'filled',
          creationGoal: 'filled',
          hearFrom: 'filled',
        })
      ).toBe(true);
    });
  });
});

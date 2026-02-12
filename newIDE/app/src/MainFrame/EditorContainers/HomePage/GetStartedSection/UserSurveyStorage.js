// @flow
import { type UserAnswers } from './UserSurvey';
const localStoreUserSurveyKey = 'gd-user-survey';
const TEN_MINUTES = 10 * 60 * 1000;

export const getRecentPersistedState = () => {
  try {
    const serializedState = localStorage.getItem(localStoreUserSurveyKey);
    if (!serializedState) return null;
    const state = JSON.parse(serializedState);
    if (
      !state.lastModifiedAt ||
      Date.now() - state.lastModifiedAt > TEN_MINUTES
    ) {
      // After a delay, the user will have forgotten what they were doing
      // or the previous questions.
      return null;
    }
    return state;
  } catch (error) {
    console.log('An error occurred when reading local storage:', error);
    return null;
  }
};

export const persistState = (state: {|
  userAnswers: UserAnswers,
  questionId: string,
|}) => {
  try {
    localStorage.setItem(
      localStoreUserSurveyKey,
      JSON.stringify({
        ...state,
        lastModifiedAt: Date.now(),
      })
    );
  } catch (error) {
    console.log(
      'An error occurred when storing user survey in local storage:',
      error
    );
  }
};

export const clearUserSurveyPersistedState = () => {
  try {
    localStorage.removeItem(localStoreUserSurveyKey);
  } catch (error) {
    console.log(
      'An error occurred when clearing user survey in local storage:',
      error
    );
  }
};

export const hasStartedUserSurvey = () => {
  try {
    return localStorage.hasOwnProperty(localStoreUserSurveyKey);
  } catch (error) {
    console.log(
      'An error occurred when checking for user survey persisted state in local storage:',
      error
    );
  }
};

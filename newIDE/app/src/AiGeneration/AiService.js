// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

export type AiGenerationService = {|
  userId: ?string,
  getAuthorizationHeader: () => Promise<?string>,
|};

export const useAiGenerationService = (): AiGenerationService => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  return {
    userId: profile ? profile.id : null,
    getAuthorizationHeader,
  };
};

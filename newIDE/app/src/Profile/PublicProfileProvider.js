// @flow

import * as React from 'react';

import PublicProfileDialog from './PublicProfileDialog';
import PublicProfileContext, {
  type PublicProfileState,
} from './PublicProfileContext';

type Props = {|
  children: React.Node,
|};

const PublicProfileProvider = ({ children }: Props) => {
  const [
    visitedPublicProfileUserId,
    setVisitedPublicProfileUserId,
  ] = React.useState<?string>(null);

  const openUserPublicProfile = React.useCallback(
    (userId: string): void => {
      setVisitedPublicProfileUserId(userId);
    },
    [setVisitedPublicProfileUserId]
  );

  const closeUserPublicProfile = React.useCallback(
    (): void => {
      setVisitedPublicProfileUserId(null);
    },
    [setVisitedPublicProfileUserId]
  );

  const publicProfileState: PublicProfileState = React.useMemo(
    () => ({
      openUserPublicProfile: openUserPublicProfile,
    }),
    [openUserPublicProfile]
  );

  return (
    <React.Fragment>
      <PublicProfileContext.Provider value={publicProfileState}>
        {children}
      </PublicProfileContext.Provider>
      {visitedPublicProfileUserId && (
        <PublicProfileDialog
          userId={visitedPublicProfileUserId}
          onClose={closeUserPublicProfile}
        />
      )}
    </React.Fragment>
  );
};

export default PublicProfileProvider;

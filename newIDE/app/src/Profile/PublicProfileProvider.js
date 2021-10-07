// @flow

import * as React from 'react';

import PublicProfileDialog from './PublicProfileDialog';
import PublicProfileContext from './PublicProfileContext';

type Props = {|
  children: React.Node,
|};

export default ({ children }: Props) => {
  const [visitedPublicProfileUserId, setVisitedPublicProfileUserId] = React.useState<?string>(null);

  const openUserPublicProfile = (userId: string): void => {
    setVisitedPublicProfileUserId(userId);
  };

  const closeUserPublicProfile = (): void => {
    setVisitedPublicProfileUserId(null);
  };

  return (
    <React.Fragment>
      <PublicProfileContext.Provider value={{openUserPublicProfile: openUserPublicProfile}}>
        {children}
      </PublicProfileContext.Provider>
      {visitedPublicProfileUserId && (
        <PublicProfileDialog userId={visitedPublicProfileUserId} onClose={closeUserPublicProfile} />
      )}
    </React.Fragment>
  );
};

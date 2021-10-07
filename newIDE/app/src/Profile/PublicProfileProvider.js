// @flow

import * as React from 'react';

import PublicProfile from './PublicProfile';
import PublicProfileDataContext from './PublicProfileContext';

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
      <PublicProfileDataContext.Provider value={{openUserPublicProfile: openUserPublicProfile}}>
        {children}
      </PublicProfileDataContext.Provider>
      {visitedPublicProfileUserId && (
        <PublicProfile userId={visitedPublicProfileUserId} onClose={closeUserPublicProfile} />
      )}
    </React.Fragment>
  );
};

// @flow

import * as React from 'react';

import PublicProfile from './PublicProfile';
import PublicProfileDataContext from './PublicProfileContext';

type Props = {|
  children: React.Node,
|};

export default ({children}: Props) => {
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = React.useState(null);

  const setUserAndOpenProfile = (userId: string): void => {
    setUserId(userId);
    setOpen(true);
  }

  const closeProfile = (): void => {
    setUserId(null);
    setOpen(false);
  }

  return (
    <React.Fragment>
      <PublicProfileDataContext.Provider value={setUserAndOpenProfile}>
        {children}
      </PublicProfileDataContext.Provider>
      {open && userId && (
        <PublicProfile userId={userId} onClose={closeProfile} />
      )}
    </React.Fragment>
  )
}
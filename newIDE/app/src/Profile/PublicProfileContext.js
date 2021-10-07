// @flow
import * as React from 'react';

type PublicProfileState = {
  openUserPublicProfile: string => void,
};

const initialPublicProfileState = {
  openUserPublicProfile: (userId: string) => {},
};

const PublicProfileContext = React.createContext<PublicProfileState>(
  initialPublicProfileState
);

export default PublicProfileContext;

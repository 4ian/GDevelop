// @flow
import * as React from 'react';

export type PublicProfileOpener = {
  openUserPublicProfile: string => void,
};

export const initialPublicProfileOpener = {
  openUserPublicProfile: (userId: string) => {},
};

const PublicProfileContext = React.createContext<PublicProfileOpener>(
  initialPublicProfileOpener
);

export default PublicProfileContext;

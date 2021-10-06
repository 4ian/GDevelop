// @flow
import * as React from 'react';

export type PublicProfileOpenerType = (string) => void;

export const initialPublicProfileOpener = (userId: string) => {};

const PublicProfileContext = React.createContext<PublicProfileOpenerType>(
  initialPublicProfileOpener
);

export default PublicProfileContext;

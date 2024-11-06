// @flow

import * as React from 'react';
import RouterContext from './RouterContext';

const useRouteArguments = ({
  openHomePage,
  closeDialogs,
}: {|
  openHomePage: () => void,
  closeDialogs: () => void,
|}) => {
  const { navigateToRoute, routeArguments } = React.useContext(RouterContext);

  // Open the homepage if not already open and close some dialogs.
  React.useEffect(
    () => {
      const initialDialog = routeArguments['initial-dialog'];
      if (!initialDialog) return;

      if (
        [
          'games-dashboard',
          'asset-store',
          'store',
          'build',
          'education',
          'play',
          'community',
          'get-started',
        ].includes(initialDialog)
      ) {
        closeDialogs();
        openHomePage();
      }
    },
    [routeArguments, openHomePage, closeDialogs]
  );
  return {
    navigateToRoute,
  };
};

export default useRouteArguments;

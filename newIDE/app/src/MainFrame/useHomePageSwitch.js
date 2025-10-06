// @flow

import * as React from 'react';
import RouterContext, { type Route } from './RouterContext';

const homePageRoutes: Route[] = [
  'play',
  'learn',
  'build',
  'create',
  'games-dashboard',
  'asset-store',
  'store',
  'education',
];

/**
 * This hook is used to be able to use route arguments from anywhere to open the homepage.
 * It should close dialogs that prevent the navigation to the homepage.
 */
const useHomePageSwitch = ({
  openHomePage,
  closeDialogs,
}: {|
  openHomePage: () => void,
  closeDialogs: () => void,
|}) => {
  const {
    navigateToRoute,
    removeRouteArguments,
    routeArguments,
  } = React.useContext(RouterContext);

  // Open the homepage if not already open and close some dialogs.
  React.useEffect(
    () => {
      const initialDialog = routeArguments['initial-dialog'];
      if (!initialDialog) return;

      if (homePageRoutes.includes(initialDialog)) {
        closeDialogs();
        openHomePage();
      }
    },
    [routeArguments, openHomePage, closeDialogs, removeRouteArguments]
  );
  return {
    navigateToRoute,
  };
};

export default useHomePageSwitch;

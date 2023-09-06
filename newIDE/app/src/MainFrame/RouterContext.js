// @flow
import * as React from 'react';
import Window from '../Utils/Window';

export type Route =
  | 'onboarding' // For compatibility when there was only one tutorial.
  | 'guided-lesson' // New way of opening a tutorial.
  | 'subscription'
  | 'games-dashboard'
  | 'asset-store' // For compatibility when there was only asset packs.
  | 'store'; // New way of opening the store.
type RouteKey =
  | 'initial-dialog'
  | 'game-id'
  | 'games-dashboard-tab'
  | 'asset-pack'
  | 'game-template'
  | 'tutorial-id';
export type RouteArguments = { [RouteKey]: string };

export type Router = {|
  routeArguments: RouteArguments,
  removeRouteArguments: (RouteKey[]) => void,
  addRouteArguments: RouteArguments => void,
  navigateToRoute: (route: Route, additionalArgument?: RouteArguments) => void,
|};

const initialState: Router = {
  routeArguments: {},
  removeRouteArguments: () => {},
  addRouteArguments: () => {},
  navigateToRoute: () => {},
};

const RouterContext = React.createContext<Router>(initialState);

export default RouterContext;

type Props = {|
  children?: React.Node,
|};

export const RouterContextProvider = ({ children }: Props) => {
  // Put value in the state, so we can control when the DOM re-renders.
  const [routeArguments, setRouteArguments] = React.useState<RouteArguments>(
    // $FlowFixMe - Assume that the arguments are always valid.
    Window.getArguments()
  );

  const removeRouteArguments = React.useCallback(
    (argumentsToRemove: RouteKey[]) => {
      // Remove them from the window. (only for web)
      // $FlowFixMe - Assume that the arguments are always valid.
      Window.removeArguments(argumentsToRemove);
      // Update the state accordingly, based on the previous state.
      setRouteArguments(oldArguments => {
        const newArguments = { ...oldArguments };
        argumentsToRemove.forEach(argument => {
          delete newArguments[argument];
        });
        return newArguments;
      });
    },
    []
  );

  const addRouteArguments = React.useCallback(
    (argumentsToAdd: RouteArguments) => {
      // Add them to the window. (only for web)
      // $FlowFixMe - Assume that the arguments are always valid.
      Window.addArguments(argumentsToAdd);
      // Update the state accordingly, based on the previous state.
      setRouteArguments(oldArguments => ({
        ...oldArguments,
        ...argumentsToAdd,
      }));
    },
    []
  );

  const navigateToRoute = React.useCallback(
    (route: Route, additionalArguments?: RouteArguments) => {
      // add the new route, assumed to be a dialog, and possible additional arguments to the router.
      addRouteArguments({ ...additionalArguments, 'initial-dialog': route });
    },
    [addRouteArguments]
  );

  return (
    <RouterContext.Provider
      value={{
        routeArguments,
        addRouteArguments,
        removeRouteArguments,
        navigateToRoute,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

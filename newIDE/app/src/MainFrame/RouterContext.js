// @flow
import * as React from 'react';
import Window, { type AppArguments } from '../Utils/Window';

export type Router = {|
  routeArguments: AppArguments,
  removeRouteArguments: (string[]) => void,
  addRouteArguments: AppArguments => void,
  navigateToRoute: (route: string, additionalArgument?: AppArguments) => void,
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
  const initialWindowArguments = Window.getArguments();
  // Put value in the state, so we can control when the DOM re-renders.
  const [routeArguments, setRouteArguments] = React.useState(
    initialWindowArguments
  );

  const removeRouteArguments = React.useCallback(
    (argumentsToRemove: string[]) => {
      // Remove them from the window. (only for web)
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
    (argumentsToAdd: AppArguments) => {
      // Add them to the window. (only for web)
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
    (route: string, additionalArguments?: AppArguments) => {
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

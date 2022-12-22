// @flow
import * as React from 'react';
import Window, { type AppArguments } from '../Utils/Window';

export type Router = {|
  appArguments: AppArguments,
  removeArguments: (string[]) => void,
  addArguments: AppArguments => void,
|};

const initialState: Router = {
  appArguments: {},
  removeArguments: () => {},
  addArguments: () => {},
};

const RouterContext = React.createContext<Router>(initialState);

export default RouterContext;

type Props = {|
  children?: React.Node,
|};

export const RouterContextProvider = ({ children }: Props) => {
  const initialWindowArguments = Window.getArguments();
  // Put value in the state, so we can control when the DOM re-renders.
  const [cleanedArguments, setCleanedArguments] = React.useState(
    initialWindowArguments
  );

  const removeArguments = React.useCallback((argumentsToRemove: string[]) => {
    const argumentStrings = argumentsToRemove.map(argument => argument);
    // Remove them from the window. (only for web)
    Window.removeArguments(argumentStrings);
    // Update the state accordingly, based on the previous state.
    setCleanedArguments(oldArguments => {
      const newArguments = { ...oldArguments };
      argumentsToRemove.forEach(argument => {
        delete newArguments[argument];
      });
      return newArguments;
    });
  }, []);

  const addArguments = React.useCallback((argumentsToAdd: AppArguments) => {
    // Add them to the window. (only for web)
    Window.addArguments(argumentsToAdd);
    // Update the state accordingly, based on the previous state.
    setCleanedArguments(oldArguments => ({
      ...oldArguments,
      ...argumentsToAdd,
    }));
  }, []);

  return (
    <RouterContext.Provider
      value={{
        appArguments: cleanedArguments,
        removeArguments,
        addArguments,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

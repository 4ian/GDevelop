// @flow
import * as React from 'react';
import CommandManager from './CommandManager';

const CommandsContext = React.createContext<CommandManager>(
  new CommandManager()
);

type Props = {
  children: React.Node,
};

export const CommandsContextProvider = (props: Props) => {
  const managerRef = React.useRef<CommandManager>(new CommandManager());

  return (
    <CommandsContext.Provider value={managerRef.current}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContext;

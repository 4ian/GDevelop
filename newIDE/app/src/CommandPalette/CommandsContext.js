// @flow
import * as React from 'react';
import CommandManager from './CommandManager';
import useRefInit from './UseRefInitHook';

const CommandsContext = React.createContext<CommandManager>(
  new CommandManager()
);

type Props = {
  children: React.Node,
};

export const CommandsContextProvider = (props: Props) => {
  const commandManager = useRefInit<CommandManager>(() => new CommandManager());

  return (
    <CommandsContext.Provider value={commandManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContext;

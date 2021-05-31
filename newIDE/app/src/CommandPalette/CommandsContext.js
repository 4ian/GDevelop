// @flow
import * as React from 'react';
import CommandManager, { CommandManagerInterface } from './CommandManager';
import useRefInit from './UseRefInitHook';

const CommandsContext: React$Context<CommandManagerInterface> = React.createContext<CommandManagerInterface>(
  new CommandManager()
);

type Props = {
  children: React.Node,
};

export const CommandsContextProvider = (props: Props): React.Node => {
  const commandManager = useRefInit<CommandManager>(() => new CommandManager());

  return (
    <CommandsContext.Provider value={commandManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContext;

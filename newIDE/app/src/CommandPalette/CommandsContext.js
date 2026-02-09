// @flow
import * as React from 'react';
// $FlowFixMe[import-type-as-value]
import CommandManager, { CommandManagerInterface } from './CommandManager';
import useValueWithInit from '../Utils/UseRefInitHook';

const CommandsContext: React.Context<any> = React.createContext<CommandManagerInterface>(
  new CommandManager()
);

type Props = {
  children: React.Node,
};

export const CommandsContextProvider = (props: Props): React.MixedElement => {
  const commandManager = useValueWithInit<CommandManager>(
    () => new CommandManager()
  );

  return (
    <CommandsContext.Provider value={commandManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContext;

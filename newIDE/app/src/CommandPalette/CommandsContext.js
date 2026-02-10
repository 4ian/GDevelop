// @flow
import * as React from 'react';
// $FlowFixMe[import-type-as-value]
import CommandManager, { CommandManagerInterface } from './CommandManager';
import useValueWithInit from '../Utils/UseRefInitHook';

// $FlowFixMe[signature-verification-failure]
const CommandsContext = React.createContext<CommandManagerInterface>(
  new CommandManager()
);

type Props = {
  children: React.Node,
};

// $FlowFixMe[signature-verification-failure]
export const CommandsContextProvider = (props: Props) => {
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

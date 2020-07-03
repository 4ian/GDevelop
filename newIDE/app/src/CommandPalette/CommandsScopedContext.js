// @flow
import * as React from 'react';
import CommandManager from './CommandManager';
import CommandsContext from './CommandsContext';
import useRefInit from './UseRefInitHook';

type Props = {
  children: React.Node,
  active: boolean,
};

const CommandsContextScopedProvider = (props: Props) => {
  const centralManager = React.useContext(CommandsContext);
  const scopedManager = useRefInit(() => new CommandManager(true));

  React.useEffect(
    () => {
      if (!props.active) return;
      const scopedCommands = scopedManager.commands;
      // Forward all registered commands to central manager
      Object.keys(scopedCommands).forEach(commandName => {
        console.warn(`SCOPED PROVIDER: Registering command ${commandName}`);
        centralManager.registerCommand(
          commandName,
          scopedCommands[commandName]
        );
      });
      return () => {
        // Withdraw all registered commands from central manager
        Object.keys(scopedCommands).forEach(commandName => {
          console.warn(`SCOPED PROVIDER: Deregistering command ${commandName}`);
          centralManager.deregisterCommand(commandName);
        });
      };
    },
    [props.active, centralManager, scopedManager.commands]
  );

  return (
    <CommandsContext.Provider value={scopedManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContextScopedProvider;

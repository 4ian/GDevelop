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
      const scopedCompoundCommands = scopedManager.compoundCommands;
      // Forward all registered compound commands to central manager
      Object.keys(scopedCompoundCommands).forEach(commandName => {
        console.warn(`SCOPED PROVIDER: Registering command ${commandName}`);
        centralManager.registerCompoundCommand(
          commandName,
          scopedCompoundCommands[commandName]
        );
      });
      return () => {
        // Withdraw all registered compound commands from central manager
        Object.keys(scopedCompoundCommands).forEach(commandName => {
          console.warn(`SCOPED PROVIDER: Deregistering command ${commandName}`);
          centralManager.deregisterCompoundCommand(commandName);
        });
      };
    },
    [props.active, centralManager, scopedManager.compoundCommands]
  );

  return (
    <CommandsContext.Provider value={scopedManager}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContextScopedProvider;

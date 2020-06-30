// @flow
import * as React from 'react';
import CommandManager from './CommandManager';
import CommandsContext from './CommandsContext';

type Props = {
  children: React.Node,
  active: boolean,
};

const CommandsContextScopedProvider = (props: Props) => {
  const centralManager = React.useContext(CommandsContext);
  const scopedManagerRef = React.useRef(new CommandManager(true));

  React.useEffect(
    () => {
      if (!props.active) return;
      const scopedCompoundCommands = scopedManagerRef.current.compoundCommands;
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
    [props.active, centralManager]
  );

  return (
    <CommandsContext.Provider value={scopedManagerRef.current}>
      {props.children}
    </CommandsContext.Provider>
  );
};

export default CommandsContextScopedProvider;

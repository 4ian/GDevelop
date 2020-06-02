// @flow
import * as React from 'react';
import { type GlobalCommand } from './CommandManager';
import CommandsContext from './CommandsContext';

export const useGlobalCommand = (cmdName: string, cmdOpts: GlobalCommand) => {
  const manager = React.useContext(CommandsContext);
  React.useEffect(
    () => {
      if (cmdOpts.enabled) {
        manager.registerGlobal(cmdName, cmdOpts);
        return () => manager.deregisterGlobal(cmdName);
      }
    },
    [manager, cmdName, cmdOpts.displayText, cmdOpts.enabled, cmdOpts.handler]
  );
};

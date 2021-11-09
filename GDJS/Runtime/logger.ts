namespace gdjs {
  /**
   * A LoggerOutput specifies a single method to be called to display
   * or register a log.
   */
  export interface LoggerOutput {
    log(
      group: string,
      message: string,
      type: 'info' | 'warning' | 'error',
      internal?: boolean
    ): void;
  }

  const supportedConsoleFunctions = {
    info: console.log,
    warning: console.warn,
    error: console.error,
  };

  /**
   * The default logging output: uses the JavaScript console.
   */
  class ConsoleLoggerOutput implements LoggerOutput {
    private readonly discardedConsoleGroups = new Set<string>();

    discardGroup(groupName: string) {
      this.discardedConsoleGroups.add(groupName);
    }

    enableGroup(groupName: string) {
      this.discardedConsoleGroups.delete(groupName);
    }

    log(
      group: string,
      message: string,
      type: 'info' | 'warning' | 'error' = 'info',
      internal = true
    ): void {
      if (this.discardedConsoleGroups.has(group)) return;

      const logger =
        supportedConsoleFunctions[type] || supportedConsoleFunctions.info;
      logger(`[${group}] ${message}`);
    }
  }

  const consoleLoggerOutput = new ConsoleLoggerOutput();

  /**
   * The current output method - can be changed at runtime.
   * By default, output to the JavaScript console.
   */
  let loggerOutput: LoggerOutput = consoleLoggerOutput;

  function objectsToString(objects: any[]): string {
    return objects.reduce(
      (accumulator, value) => accumulator + value.toString(),
      ''
    );
  }

  /**
   * A Console API like class for logging in a GDevelop game.
   */
  export class Logger {
    private readonly group: string;

    /**
     * Create a new logger with the given group name.
     * You can then use log, info, warn and error on this object.
     */
    constructor(group: string) {
      this.group = group;
    }

    log(...messages: any[]): void {
      loggerOutput.log(this.group, objectsToString(messages), 'info');
    }

    info(...messages: any[]): void {
      loggerOutput.log(this.group, objectsToString(messages), 'info');
    }

    warn(...messages: any[]): void {
      loggerOutput.log(this.group, objectsToString(messages), 'warning');
    }

    error(...messages: any[]): void {
      loggerOutput.log(this.group, objectsToString(messages), 'error');
    }

    /**
     * Give access to the console output used by default by the logger.
     * This can be useful to restore the default log method if you overrode it
     * or to disable some logging in the console.
     */
    static getDefaultConsoleLoggerOutput() {
      return consoleLoggerOutput;
    }

    /**
     * Return the current logger output (common to all gdjs.Logger instances).
     */
    static getLoggerOutput(): LoggerOutput {
      return loggerOutput;
    }

    /**
     * Change the logger output (common to all gdjs.Logger instances).
     */
    static setLoggerOutput(newLoggerOutput: LoggerOutput) {
      loggerOutput = newLoggerOutput;
    }
  }
}

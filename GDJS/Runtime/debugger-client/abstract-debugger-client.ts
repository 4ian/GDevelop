namespace gdjs {
  const logger = new gdjs.Logger('Debugger client');

  const originalConsole = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
  };

  /**
   * A function used to replace circular references with a new value.
   * @param key - The key corresponding to the value.
   * @param value - The value.
   * @returns The new value.
   */
  type DebuggerClientCycleReplacer = (key: string, value: any) => any;

  /**
   * Generates a JSON serializer that prevent circular references and stop if maxDepth is reached.
   * @param [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
   * @param [cycleReplacer] - Function used to replace circular references with a new value.
   * @param [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
   */
  const depthLimitedSerializer = (
    replacer?: DebuggerClientCycleReplacer,
    cycleReplacer?: DebuggerClientCycleReplacer,
    maxDepth?: number
  ): DebuggerClientCycleReplacer => {
    const stack: Array<string> = [],
      keys: Array<string> = [];
    if (cycleReplacer === undefined || cycleReplacer === null) {
      cycleReplacer = function (key, value) {
        if (stack[0] === value) {
          return '[Circular ~]';
        }
        return (
          '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']'
        );
      };
    }

    return function (key: string, value: any): any {
      if (stack.length > 0) {
        const thisPos = stack.indexOf(this);
        ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
        ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
        if (maxDepth != null && thisPos > maxDepth) {
          return '[Max depth reached]';
        } else {
          if (~stack.indexOf(value)) {
            value = (cycleReplacer as DebuggerClientCycleReplacer).call(
              this,
              key,
              value
            );
          }
        }
      } else {
        stack.push(value);
      }
      return replacer == null ? value : replacer.call(this, key, value);
    };
  };

  /**
   * This is an alternative to JSON.stringify that ensure that circular references
   * are replaced by a placeholder.
   *
   * @param obj - The object to serialize.
   * @param [replacer] - A function called for each property on the object or array being stringified, with the property key and its value, and that returns the new value. If not specified, values are not altered.
   * @param [maxDepth] - The maximum depth, after which values are replaced by a string ("[Max depth reached]"). If not specified, there is no maximum depth.
   * @param [spaces] - The number of spaces for indentation.
   * @param [cycleReplacer] - Function used to replace circular references with a new value.
   */
  const circularSafeStringify = (
    obj: any,
    replacer?: DebuggerClientCycleReplacer,
    maxDepth?: number,
    spaces?: number,
    cycleReplacer?: DebuggerClientCycleReplacer
  ) => {
    return JSON.stringify(
      obj,
      depthLimitedSerializer(replacer, cycleReplacer, maxDepth),
      spaces
    );
  };

  /**
   * The base class describing a debugger client, that can be used to inspect
   * a runtime game (dump its state) or alter it.
   */
  export abstract class AbstractDebuggerClient {
    _runtimegame: gdjs.RuntimeGame;
    _hotReloader: gdjs.HotReloader;
    _originalConsole = originalConsole;
    _inGameDebugger: gdjs.InGameDebugger;

    constructor(runtimeGame: RuntimeGame) {
      this._runtimegame = runtimeGame;
      this._hotReloader = new gdjs.HotReloader(runtimeGame);
      this._inGameDebugger = new gdjs.InGameDebugger(runtimeGame);

      const redirectJsLog = (
        type: 'info' | 'warning' | 'error',
        ...messages: any[]
      ) => {
        this.log(
          'JavaScript',
          messages.reduce((accumulator, value) => accumulator + value, ''),
          type,
          false
        );
      };

      // Hook the console logging functions to log to the Debugger as well
      console.log = (...messages: any[]) => {
        originalConsole.log(...messages);
        redirectJsLog('info', ...messages);
      };

      console.debug = (...messages: any[]) => {
        originalConsole.debug(...messages);
        redirectJsLog('info', ...messages);
      };

      console.info = (...messages: any[]) => {
        originalConsole.info(...messages);
        redirectJsLog('info', ...messages);
      };

      console.warn = (...messages: any[]) => {
        originalConsole.warn(...messages);
        redirectJsLog('warning', ...messages);
      };

      console.error = (...messages: any[]) => {
        originalConsole.error(...messages);
        redirectJsLog('error', ...messages);
      };

      // Overwrite the default GDJS log outputs so that they
      // both go to the console (or wherever they were configured to go)
      // and sent to the remote debugger.
      const existingLoggerOutput = gdjs.Logger.getLoggerOutput();
      gdjs.Logger.setLoggerOutput({
        log: (
          group: string,
          message: string,
          type: 'info' | 'warning' | 'error' = 'info',
          internal = true
        ) => {
          existingLoggerOutput.log(group, message, type, internal);
          this.log(group, message, type, internal);
        },
      });
    }

    /**
     * Should be called by derived class to handle a command
     * received from the debugger server.
     *
     * @param data An object containing the command to do.
     */
    protected handleCommand(data: any) {
      const that = this;
      const runtimeGame = this._runtimegame;
      if (!data || !data.command) {
        // Not a command that's meant to be handled by the debugger, return silently to
        // avoid polluting the console.
        return;
      }

      if (data.command === 'play') {
        runtimeGame.pause(false);
      } else if (data.command === 'pause') {
        runtimeGame.pause(true);
        that.sendRuntimeGameDump();
      } else if (data.command === 'refresh') {
        that.sendRuntimeGameDump();
      } else if (data.command === 'set') {
        that.set(data.path, data.newValue);
      } else if (data.command === 'call') {
        that.call(data.path, data.args);
      } else if (data.command === 'profiler.start') {
        runtimeGame.startCurrentSceneProfiler(function (stoppedProfiler) {
          that.sendProfilerOutput(
            stoppedProfiler.getFramesAverageMeasures(),
            stoppedProfiler.getStats()
          );
          that.sendProfilerStopped();
        });
        that.sendProfilerStarted();
      } else if (data.command === 'profiler.stop') {
        runtimeGame.stopCurrentSceneProfiler();
      } else if (data.command === 'hotReload') {
        that._hotReloader.hotReload().then((logs) => {
          that.sendHotReloaderLogs(logs);
        });
      } else {
        logger.info(
          'Unknown command "' + data.command + '" received by the debugger.'
        );
      }
    }

    /**
     * Should be re-implemented by derived class to send a stringified message object
     * to the debugger server.
     * @param message
     */
    protected abstract _sendMessage(message: string): void;

    onUncaughtException(exception: Error): void {
      logger.error('Uncaught exception: ' + exception);

      this._inGameDebugger.setUncaughtException(exception);
    }

    /**
     * Send a message (a log) to debugger server.
     */
    log(
      group: string,
      message: string,
      type: 'info' | 'warning' | 'error',
      internal: boolean
    ) {
      this._sendMessage(
        JSON.stringify({
          command: 'console.log',
          payload: {
            message,
            type,
            group,
            internal,
            timestamp: performance.now(),
          },
        })
      );
    }

    /**
     * Update a value, specified by a path starting from the {@link RuntimeGame} instance.
     * @param path - The path to the variable, starting from {@link RuntimeGame}.
     * @param newValue - The new value.
     * @return Was the operation successful?
     */
    set(path: string[], newValue: any): boolean {
      if (!path || !path.length) {
        logger.warn('No path specified, set operation from debugger aborted');
        return false;
      }
      let object = this._runtimegame;
      let currentIndex = 0;
      while (currentIndex < path.length - 1) {
        const key = path[currentIndex];
        if (!object || !object[key]) {
          logger.error('Incorrect path specified. No ' + key + ' in ', object);
          return false;
        }
        object = object[key];
        currentIndex++;
      }

      // Ensure the newValue is properly typed to avoid breaking anything in
      // the game engine.
      const currentValue = object[path[currentIndex]];
      if (typeof currentValue === 'number') {
        newValue = parseFloat(newValue);
      } else {
        if (typeof currentValue === 'string') {
          newValue = '' + newValue;
        }
      }
      logger.log('Updating', path, 'to', newValue);
      object[path[currentIndex]] = newValue;
      return true;
    }

    /**
     * Call a method, specified by a path starting from the {@link RuntimeGame} instance.
     * @param path - The path to the method, starting from {@link RuntimeGame}.
     * @param args - The arguments to pass the method.
     * @return Was the operation successful?
     */
    call(path: string[], args: any[]): boolean {
      if (!path || !path.length) {
        logger.warn('No path specified, call operation from debugger aborted');
        return false;
      }
      let object = this._runtimegame;
      let currentIndex = 0;
      while (currentIndex < path.length - 1) {
        const key = path[currentIndex];
        if (!object || !object[key]) {
          logger.error('Incorrect path specified. No ' + key + ' in ', object);
          return false;
        }
        object = object[key];
        currentIndex++;
      }
      if (!object[path[currentIndex]]) {
        logger.error('Unable to call', path);
        return false;
      }
      logger.log('Calling', path, 'with', args);
      object[path[currentIndex]].apply(object, args);
      return true;
    }

    /**
     * Dump all the relevant data from the {@link RuntimeGame} instance and send it to the server.
     */
    sendRuntimeGameDump(): void {
      const that = this;
      const message = { command: 'dump', payload: this._runtimegame };
      const serializationStartTime = Date.now();

      // Stringify the message, excluding some known data that are big and/or not
      // useful for the debugger.
      const excludedValues = [that._runtimegame.getGameData()];
      const excludedKeys = [
        // Exclude reference to the debugger
        '_debuggerClient',
        // Exclude some RuntimeScene fields:
        '_allInstancesList',
        // Exclude circular references to parent runtimeGame or runtimeScene:
        '_runtimeGame',
        '_runtimeScene',
        // Exclude some runtimeObject duplicated data:
        '_behaviorsTable',
        // Exclude some objects data:
        '_animations',
        '_animationFrame',
        // Exclude linked objects to avoid too much repetitions:
        'linkedObjectsManager',
        // Could be improved by using private fields and excluding these (_)
        // Exclude some behaviors data:
        '_platformRBush',
        // PlatformBehavior
        'HSHG',
        // Pathfinding
        '_obstaclesHSHG',
        // Pathfinding
        'owner',
        // Avoid circular reference from behavior to parent runtimeObject
        // Exclude rendering related objects:
        '_renderer',
        '_gameRenderer',
        '_imageManager',
        '_rendererEffects',
        // Exclude PIXI textures:
        'baseTexture',
        '_baseTexture',
        '_invalidTexture',
      ];
      const stringifiedMessage = circularSafeStringify(
        message,
        function (key, value) {
          if (
            excludedValues.indexOf(value) !== -1 ||
            excludedKeys.indexOf(key) !== -1
          ) {
            return '[Removed from the debugger]';
          }
          return value;
        },
        /* Limit maximum depth to prevent any crashes */
        18
      );
      const serializationDuration = Date.now() - serializationStartTime;
      logger.log(
        'RuntimeGame serialization took ' + serializationDuration + 'ms'
      );
      if (serializationDuration > 500) {
        logger.warn(
          'Serialization took a long time: please check if there is a need to remove some objects from serialization'
        );
      }
      this._sendMessage(stringifiedMessage);
    }

    /**
     * Send logs from the hot reloader to the server.
     * @param logs The hot reloader logs.
     */
    sendHotReloaderLogs(logs: HotReloaderLog[]): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'hotReloader.logs',
          payload: logs,
        })
      );
    }

    /**
     * Callback called when profiling is starting.
     */
    sendProfilerStarted(): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'profiler.started',
          payload: null,
        })
      );
    }

    /**
     * Callback called when profiling is ending.
     */
    sendProfilerStopped(): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'profiler.stopped',
          payload: null,
        })
      );
    }

    /**
     * Callback called when the game is paused.
     */
    sendGamePaused(): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'game.paused',
          payload: null,
        })
      );
    }

    /**
     * Callback called when the game is resumed.
     */
    sendGameResumed(): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'game.resumed',
          payload: null,
        })
      );
    }

    /**
     * Send profiling results.
     * @param framesAverageMeasures The measures made for each frames.
     * @param stats Other measures done during the profiler run.
     */
    sendProfilerOutput(
      framesAverageMeasures: FrameMeasure,
      stats: ProfilerStats
    ): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'profiler.output',
          payload: {
            framesAverageMeasures: framesAverageMeasures,
            stats: stats,
          },
        })
      );
    }
  }
}

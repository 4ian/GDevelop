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

  /** Replacer function for JSON.stringify to convert Error objects into plain objects that can be logged. */
  const errorReplacer = (_, value: any) => {
    if (value instanceof Error) {
      // See https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
      const errorObject = {};
      Object.getOwnPropertyNames(value).forEach((prop) => {
        errorObject[prop] = value[prop];
      });

      return errorObject;
    }
    // Return the value unchanged if it's not an Error object.
    return value;
  };

  const buildGameCrashReport = (
    exception: Error,
    runtimeGame: gdjs.RuntimeGame
  ) => {
    const currentScene = runtimeGame.isInGameEdition()
      ? runtimeGame.getInGameEditor()?.getCurrentScene()
      : runtimeGame.getSceneStack().getCurrentScene();
    const sceneNames = runtimeGame.isInGameEdition()
      ? [currentScene?.getName()]
      : runtimeGame.getSceneStack().getAllSceneNames();
    return {
      type: 'javascript-uncaught-exception',
      exception,
      platformInfo: runtimeGame.getPlatformInfo(),
      playerId: runtimeGame.getPlayerId(),
      sessionId: runtimeGame.getSessionId(),
      isPreview: runtimeGame.isPreview(),
      isInGameEdition: runtimeGame.isInGameEdition(),
      gdevelop: {
        previewContext: runtimeGame.getAdditionalOptions().previewContext,
        isNativeMobileApp: runtimeGame.getAdditionalOptions().nativeMobileApp,
        versionWithHash:
          runtimeGame.getAdditionalOptions().gdevelopVersionWithHash,
        environment: runtimeGame.getAdditionalOptions().environment,
      },
      game: {
        gameId: gdjs.projectData.properties.projectUuid,
        name: runtimeGame.getGameData().properties.name || '',
        packageName: runtimeGame.getGameData().properties.packageName || '',
        version: runtimeGame.getGameData().properties.version || '',
        location: window.location.href,
        projectTemplateSlug:
          runtimeGame.getAdditionalOptions().projectTemplateSlug,
        sourceGameId: runtimeGame.getAdditionalOptions().sourceGameId,
      },
      gameState: {
        sceneNames,
        isWebGLSupported: runtimeGame.getRenderer().isWebGLSupported(),
        hasPixiRenderer: !!runtimeGame.getRenderer().getPIXIRenderer(),
        hasThreeRenderer: !!runtimeGame.getRenderer().getThreeRenderer(),
        resourcesTotalCount:
          runtimeGame.getGameData().resources.resources.length,
        antialiasingMode: runtimeGame.getAntialiasingMode(),
        isAntialisingEnabledOnMobile:
          runtimeGame.isAntialisingEnabledOnMobile(),
        scriptFiles: runtimeGame.getAdditionalOptions().scriptFiles,
        currentSceneTimeFromStart: currentScene
          ? currentScene.getTimeManager().getTimeFromStart()
          : null,
        gdjsKeys: Object.keys(gdjs).slice(0, 1000),
      },
    };
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

    _hasLoggedUncaughtException = false;

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
      const inGameEditor = runtimeGame.getInGameEditor();
      if (!data || !data.command) {
        // Not a command that's meant to be handled by the debugger, return silently to
        // avoid polluting the console.
        return;
      }

      try {
        if (data.command === 'play') {
          runtimeGame.pause(false);
        } else if (data.command === 'pause') {
          runtimeGame.pause(true);
          that.sendRuntimeGameDump();
        } else if (data.command === 'refresh') {
          that.sendRuntimeGameDump();
        } else if (data.command === 'getStatus') {
          that.sendRuntimeGameStatus();
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
          const runtimeGameOptions: RuntimeGameOptions =
            data.payload.runtimeGameOptions;
          if (
            (runtimeGameOptions.initialRuntimeGameStatus?.isInGameEdition ||
              false) === runtimeGame.isInGameEdition()
          ) {
            this._hasLoggedUncaughtException = false;
            that._hotReloader
              .hotReload({
                projectData: data.payload.projectData,
                runtimeGameOptions,
                shouldReloadResources:
                  data.payload.shouldReloadResources || false,
              })
              .then((logs) => {
                that.sendHotReloaderLogs(logs);
              });
          }
        } else if (data.command === 'hotReloadObjects') {
          if (inGameEditor) {
            const editedInstanceContainer =
              inGameEditor.getEditedInstanceContainer();
            if (editedInstanceContainer) {
              that._hotReloader.hotReloadRuntimeSceneObjects(
                data.payload.updatedObjects,
                editedInstanceContainer
              );
            }
          }
        } else if (data.command === 'hotReloadLayers') {
          if (inGameEditor) {
            const editedInstanceContainer =
              inGameEditor.getEditedInstanceContainer();
            if (editedInstanceContainer) {
              inGameEditor.onLayersDataChange(
                data.payload.layers,
                data.payload.areEffectsHidden
              );
              that._hotReloader.hotReloadRuntimeSceneLayers(
                data.payload.layers,
                editedInstanceContainer
              );
              // Apply `areEffectsHidden` to all the layers of the project data.
              // It avoids inconsistency when switching scene later on.
              // We do it after `hotReloadRuntimeSceneLayers` because it relies
              // on the differences with old project data.
              inGameEditor.setEffectsHiddenInEditor(
                data.payload.areEffectsHidden
              );
            }
          }
        } else if (data.command === 'setBackgroundColor') {
          if (inGameEditor) {
            const editedInstanceContainer =
              inGameEditor.getEditedInstanceContainer();
            if (editedInstanceContainer) {
              const backgroundColor = data.payload.backgroundColor;
              if (
                backgroundColor &&
                editedInstanceContainer instanceof gdjs.RuntimeScene
              ) {
                const sceneData = runtimeGame.getSceneData(
                  editedInstanceContainer.getScene().getName()
                );
                if (sceneData) {
                  editedInstanceContainer._backgroundColor =
                    gdjs.rgbToHexNumber(
                      backgroundColor[0],
                      backgroundColor[1],
                      backgroundColor[2]
                    );
                  sceneData.r = backgroundColor[0];
                  sceneData.v = backgroundColor[1];
                  sceneData.b = backgroundColor[2];
                }
              }
            }
          }
        } else if (data.command === 'hotReloadAllInstances') {
          if (inGameEditor) {
            const editedInstanceContainer =
              inGameEditor.getEditedInstanceContainer();
            if (editedInstanceContainer) {
              that._hotReloader.hotReloadRuntimeInstances(
                inGameEditor.getEditedInstanceDataList(),
                data.payload.instances,
                editedInstanceContainer
              );
            }
          }
        } else if (data.command === 'switchForInGameEdition') {
          if (!this._runtimegame.isInGameEdition()) return;

          const sceneName = data.sceneName || null;
          const eventsBasedObjectType = data.eventsBasedObjectType || null;
          if (!sceneName && !eventsBasedObjectType) {
            logger.warn(
              'No scene name specified, switchForInGameEdition aborted'
            );
            return;
          }
          if (inGameEditor) {
            const wasPaused = this._runtimegame.isPaused();
            this._runtimegame.pause(true);
            inGameEditor.switchToSceneOrVariant(
              data.editorId || null,
              sceneName,
              data.externalLayoutName || null,
              eventsBasedObjectType,
              data.eventsBasedObjectVariantName || null,
              data.editorCamera3D || null
            );
            this._runtimegame.pause(wasPaused);
          }
        } else if (data.command === 'setVisibleStatus') {
          if (inGameEditor) {
            inGameEditor.setVisibleStatus(data.visible);
          }
        } else if (data.command === 'updateInstances') {
          if (inGameEditor) {
            inGameEditor.reloadInstances(data.payload.instances);
          }
        } else if (data.command === 'addInstances') {
          if (inGameEditor) {
            inGameEditor.addInstances(data.payload.instances);
            inGameEditor.setSelectedObjects(
              data.payload.instances.map((instance) => instance.persistentUuid)
            );
            if (data.payload.moveUnderCursor) {
              inGameEditor.moveSelectionUnderCursor();
            }
          }
        } else if (data.command === 'deleteSelection') {
          if (inGameEditor) {
            inGameEditor.deleteSelection();
          }
        } else if (data.command === 'dragNewInstance') {
          const gameCoords = runtimeGame
            .getRenderer()
            .convertPageToGameCoords(data.x, data.y);
          runtimeGame
            .getInputManager()
            .onMouseMove(gameCoords[0], gameCoords[1]);

          if (inGameEditor)
            inGameEditor.dragNewInstance({
              name: data.name,
              dropped: data.dropped,
              isAltPressed: data.isAltPressed,
            });
        } else if (data.command === 'cancelDragNewInstance') {
          if (inGameEditor) inGameEditor.cancelDragNewInstance();
        } else if (data.command === 'setInstancesEditorSettings') {
          if (inGameEditor)
            inGameEditor.updateInstancesEditorSettings(
              data.payload.instancesEditorSettings
            );
        } else if (data.command === 'zoomToInitialPosition') {
          if (inGameEditor) {
            inGameEditor.zoomToInitialPosition(data.payload.visibleScreenArea);
          }
        } else if (data.command === 'zoomToFitContent') {
          if (inGameEditor) {
            inGameEditor.zoomToFitContent(data.payload.visibleScreenArea);
          }
        } else if (data.command === 'setSelectedLayer') {
          if (inGameEditor) {
            inGameEditor.setSelectedLayerName(data.payload.layerName);
          }
        } else if (data.command === 'zoomToFitSelection') {
          if (inGameEditor) {
            inGameEditor.zoomToFitSelection(data.payload.visibleScreenArea);
          }
        } else if (data.command === 'zoomBy') {
          if (inGameEditor) {
            inGameEditor.zoomBy(data.payload.zoomFactor);
          }
        } else if (data.command === 'setZoom') {
          if (inGameEditor) {
            inGameEditor.setZoom(data.payload.zoom);
          }
        } else if (data.command === 'setSelectedInstances') {
          if (inGameEditor) {
            inGameEditor.setSelectedObjects(data.payload.instanceUuids);
          }
        } else if (data.command === 'centerViewOnLastSelectedInstance') {
          if (inGameEditor) {
            // TODO: use data.payload.visibleScreenArea
            inGameEditor.centerViewOnLastSelectedInstance();
          }
        } else if (data.command === 'updateInnerArea') {
          if (inGameEditor) {
            inGameEditor.updateInnerArea(
              data.payload.areaMinX,
              data.payload.areaMinY,
              data.payload.areaMinZ,
              data.payload.areaMaxX,
              data.payload.areaMaxY,
              data.payload.areaMaxZ
            );
          }
        } else if (data.command === 'getSelectionAABB') {
          if (inGameEditor) {
            this.sendSelectionAABB(data.messageId);
          }
        } else if (data.command === 'hardReload') {
          // This usually means that the preview was modified so much that an entire reload
          // is needed, or that the runtime itself could have been modified.
          this.launchHardReload();
        } else {
          logger.info(
            'Unknown command "' + data.command + '" received by the debugger.'
          );
        }
      } catch (error) {
        this.onUncaughtException(error);
      }
    }

    /**
     * Should be re-implemented by derived class to send a stringified message object
     * to the debugger server.
     * @param message
     */
    protected abstract _sendMessage(message: string): void;

    static isErrorComingFromJavaScriptCode(exception: Error | null): boolean {
      if (!exception || !exception.stack) return false;

      return exception.stack.includes('GDJSInlineCode');
    }

    async _reportCrash(exception: Error) {
      const gameCrashReport = buildGameCrashReport(
        exception,
        this._runtimegame
      );

      // Let a debugger server know about the crash.
      this._sendMessage(
        circularSafeStringify(
          {
            command: 'game.crashed',
            payload: gameCrashReport,
          },
          errorReplacer
        )
      );

      // Send the report to the APIs, if allowed.
      if (
        !this._runtimegame.getAdditionalOptions().crashReportUploadLevel ||
        this._runtimegame.getAdditionalOptions().crashReportUploadLevel ===
          'none' ||
        (this._runtimegame.getAdditionalOptions().crashReportUploadLevel ===
          'exclude-javascript-code-events' &&
          AbstractDebuggerClient.isErrorComingFromJavaScriptCode(exception))
      ) {
        return;
      }

      const rootApi = this._runtimegame.isUsingGDevelopDevelopmentEnvironment()
        ? 'https://api-dev.gdevelop.io'
        : 'https://api.gdevelop.io';
      const baseUrl = `${rootApi}/analytics`;

      try {
        await fetch(`${baseUrl}/game-crash-report`, {
          body: circularSafeStringify(gameCrashReport, errorReplacer),
          method: 'POST',
        });
      } catch (error) {
        logger.error('Error while sending the crash report:', error);
      }
    }

    onUncaughtException(exception: Error): void {
      logger.error('Uncaught exception: ', exception, exception.stack);

      const runtimeGame = this._runtimegame;
      if (!runtimeGame.isInGameEdition()) {
        this._inGameDebugger.setUncaughtException(exception);
      }

      if (!this._hasLoggedUncaughtException) {
        // Only log an uncaught exception once, to avoid spamming the debugger server
        // in case of an exception at each frame.
        this._hasLoggedUncaughtException = true;

        this._reportCrash(exception);
      }
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

    sendRuntimeGameStatus(): void {
      const currentScene = this._runtimegame.getSceneStack().getCurrentScene();
      this._sendMessage(
        circularSafeStringify({
          command: 'status',
          payload: {
            isPaused: this._runtimegame.isPaused(),
            isInGameEdition: this._runtimegame.isInGameEdition(),
            sceneName: currentScene ? currentScene.getName() : null,
          },
        })
      );
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
          payload: {
            isInGameEdition: this._runtimegame.isInGameEdition(),
            logs,
          },
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

    sendInstanceChanges(changes: {
      isSendingBackSelectionForDefaultSize: boolean;
      updatedInstances: Array<InstanceData>;
      addedInstances: Array<InstanceData>;
      selectedInstances: Array<InstancePersistentUuidData>;
      removedInstances: Array<InstancePersistentUuidData>;
    }): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'updateInstances',
          editorId: inGameEditor.getEditorId(),
          payload: changes,
        })
      );
    }

    sendOpenContextMenu(cursorX: float, cursorY: float): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'openContextMenu',
          editorId: inGameEditor.getEditorId(),
          payload: { cursorX, cursorY },
        })
      );
    }

    sendCameraState(cameraState: EditorCameraState): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'setCameraState',
          editorId: inGameEditor.getEditorId(),
          payload: cameraState,
        })
      );
    }

    sendUndo(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'undo',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    sendRedo(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'redo',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    sendCopy(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'copy',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    sendPaste(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'paste',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    sendCut(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'cut',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    sendSelectionAABB(messageId: number): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      const selectionAABB = inGameEditor.getSelectionAABB();
      this._sendMessage(
        circularSafeStringify({
          command: 'selectionAABB',
          editorId: inGameEditor.getEditorId(),
          messageId,
          payload: selectionAABB
            ? {
                minX: selectionAABB.min[0],
                minY: selectionAABB.min[1],
                minZ: selectionAABB.min[2],
                maxX: selectionAABB.max[0],
                maxY: selectionAABB.max[1],
                maxZ: selectionAABB.max[2],
              }
            : {
                minX: 0,
                minY: 0,
                minZ: 0,
                maxX: 0,
                maxY: 0,
                maxZ: 0,
              },
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

    launchHardReload(): void {
      try {
        const reloadUrl = new URL(location.href);

        // Construct the initial status to be restored.
        const initialRuntimeGameStatus =
          this._runtimegame.getAdditionalOptions().initialRuntimeGameStatus;
        // We use empty strings to avoid `null` to become `"null"`.
        const runtimeGameStatus: RuntimeGameStatus = {
          editorId: initialRuntimeGameStatus?.editorId || '',
          isPaused: this._runtimegame.isPaused(),
          isInGameEdition: this._runtimegame.isInGameEdition(),
          sceneName: initialRuntimeGameStatus?.sceneName || '',
          injectedExternalLayoutName:
            initialRuntimeGameStatus?.injectedExternalLayoutName || '',
          skipCreatingInstancesFromScene:
            initialRuntimeGameStatus?.skipCreatingInstancesFromScene || false,
          eventsBasedObjectType:
            initialRuntimeGameStatus?.eventsBasedObjectType || '',
          eventsBasedObjectVariantName:
            initialRuntimeGameStatus?.eventsBasedObjectVariantName || '',
          editorCamera3D: this._runtimegame.getInGameEditor()?.getCameraState(),
        };

        reloadUrl.searchParams.set(
          'runtimeGameStatus',
          JSON.stringify(runtimeGameStatus)
        );
        location.replace(reloadUrl);
      } catch (error) {
        logger.error(
          'Could not reload the game with the new initial status',
          error
        );
        location.reload();
      }
    }
  }
}

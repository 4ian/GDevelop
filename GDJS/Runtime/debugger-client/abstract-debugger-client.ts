namespace gdjs {
  const logger = new gdjs.Logger('Debugger client');

  /** The only debugger commands processed while a gameplay test is running:
   * read-only inspection and the gameplay test commands themselves. Every
   * other command is ignored (fail closed: a command added later cannot
   * accidentally mutate the game state or stepping the harness owns). */
  const DEBUGGER_COMMANDS_ALLOWED_DURING_GAMEPLAY_TESTS = new Set([
    'refresh',
    'getStatus',
    'profiler.start',
    'profiler.stop',
    'gameplayTest.run',
    'gameplayTest.stop',
  ]);

  const originalConsole = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
  };

  const mergeResourcesByName = (
    currentResources: ResourceData[],
    newResources: ResourceData[]
  ): ResourceData[] => {
    const resourcesByName = new Map<string, ResourceData>();
    currentResources.forEach((resource) => {
      resourcesByName.set(resource.name, resource);
    });
    newResources.forEach((resource) => {
      resourcesByName.set(resource.name, resource);
    });
    return Array.from(resourcesByName.values());
  };

  const getUsedResourcesForObjectData = (
    objectData: ObjectData
  ): ResourceReference[] => {
    if (Array.isArray(objectData.usedResources)) {
      return objectData.usedResources;
    }

    const modelResourceName =
      objectData.type === 'Scene3D::Model3DObject'
        ? (objectData as any).content &&
          (objectData as any).content.modelResourceName
        : null;
    return typeof modelResourceName === 'string' && modelResourceName
      ? [{ name: modelResourceName }]
      : [];
  };

  const getObjectDataWithUsedResources = (
    objectData: ObjectData
  ): ObjectData => {
    const usedResources = getUsedResourcesForObjectData(objectData);
    return usedResources.length ? { ...objectData, usedResources } : objectData;
  };

  const upsertObjectData = (
    objectDatas: ObjectData[],
    objectData: ObjectData
  ): void => {
    const objectIndex = objectDatas.findIndex(
      (existingObjectData) => existingObjectData.name === objectData.name
    );
    if (objectIndex >= 0) {
      objectDatas[objectIndex] = objectData;
    } else {
      objectDatas.push(objectData);
    }
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
   * @category Debugging > Debugger Client
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

      // While a gameplay test runs, the harness owns the game stepping and
      // state: only read-only and gameplay test commands are processed (an
      // unpause would make the main loop step in parallel, a hot-reload
      // would reset instances mid-test).
      if (
        gdjs.gameplayTests &&
        gdjs.gameplayTests.isGameplayTestRunning() &&
        !DEBUGGER_COMMANDS_ALLOWED_DURING_GAMEPLAY_TESTS.has(data.command)
      ) {
        logger.warn(
          `Ignored debugger command "${data.command}" while a gameplay test is running.`
        );
        this._sendMessage(
          circularSafeStringify({
            command: 'commandIgnored',
            payload: {
              ignoredCommand: data.command,
              reason: 'gameplay-test-running',
            },
          })
        );
        return;
      }

      try {
        if (data.command === 'play') {
          runtimeGame.pause(false);
          if (data.messageId) {
            that.sendRuntimeGameStatus(data.messageId);
          }
        } else if (data.command === 'pause') {
          runtimeGame.pause(true);
          if (data.messageId) {
            that.sendRuntimeGameStatus(data.messageId);
          }
          if (!data.skipDump) {
            // Let the pause status flush before the heavier runtime dump.
            setTimeout(() => {
              that.sendRuntimeGameDump();
            }, 0);
          }
        } else if (data.command === 'refresh') {
          that.sendRuntimeGameDump();
        } else if (data.command === 'getStatus') {
          that.sendRuntimeGameStatus(data.messageId);
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
        } else if (data.command === 'hotReloadObjectsAndAddInstances') {
          if (inGameEditor) {
            const editor = inGameEditor;
            const editedInstanceContainer = editor.getEditedInstanceContainer();
            if (editedInstanceContainer) {
              const resources = data.payload.resources || [];
              const updatedObjects = (data.payload.updatedObjects || []).map(
                getObjectDataWithUsedResources
              );
              const instances = data.payload.instances || [];
              const sceneName =
                editedInstanceContainer instanceof gdjs.RuntimeScene
                  ? editedInstanceContainer.getName()
                  : undefined;
              const projectData = runtimeGame._data;
              if (resources.length) {
                projectData.resources.resources = mergeResourcesByName(
                  projectData.resources.resources,
                  resources
                );
                runtimeGame.getResourceLoader().upsertResources(resources);
              }
              if (sceneName) {
                const sceneData = runtimeGame.getSceneData(sceneName);
                if (sceneData) {
                  updatedObjects.forEach((objectData: ObjectData) => {
                    upsertObjectData(sceneData.objects, objectData);
                  });
                }
              }
              that._hotReloader.hotReloadRuntimeSceneObjects(
                updatedObjects,
                editedInstanceContainer
              );

              const objectNames = updatedObjects
                .map((objectData: ObjectData) => objectData.name)
                .filter(
                  (objectName: string | null): objectName is string =>
                    !!objectName
                );
              objectNames.forEach((objectName: string) => {
                runtimeGame.loadObjectOrGroupAssets(objectName, sceneName);
              });

              const waitForAssets = async () => {
                const startTime = Date.now();
                while (
                  objectNames.some(
                    (objectName: string) =>
                      !runtimeGame.areObjectOrGroupAssetsLoaded(
                        objectName,
                        sceneName
                      )
                  ) &&
                  Date.now() - startTime < 30000
                ) {
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }
              };

              waitForAssets()
                .catch((error) => {
                  logger.error(
                    'Unable to load object resources before adding instances: ' +
                      error
                  );
                })
                .then(() => {
                  editor.addInstances(instances);
                  editor.setSelectedObjects(
                    instances.map(
                      (instance: InstanceData) => instance.persistentUuid
                    )
                  );
                });
            }
          }
        } else if (data.command === 'hotReloadLayers') {
          if (inGameEditor) {
            const editedInstanceContainer =
              inGameEditor.getEditedInstanceContainer();
            const editedLayerDataList = inGameEditor.getEditedLayerDataList();
            if (editedInstanceContainer) {
              inGameEditor.onLayersDataChange(
                data.payload.layers,
                data.payload.areEffectsHidden
              );
              that._hotReloader.hotReloadRuntimeSceneLayers(
                data.payload.layers,
                editedLayerDataList,
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
        } else if (data.command === 'getInGameEditorDropPosition') {
          const gameCoords = runtimeGame
            .getRenderer()
            .convertPageToGameCoords(data.x, data.y);
          runtimeGame
            .getInputManager()
            .onMouseMove(gameCoords[0], gameCoords[1]);

          if (data.messageId) {
            this.sendInGameEditorDropPosition(data.messageId);
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
        } else if (data.command === 'setInGameEditorSettings') {
          if (inGameEditor && data.payload?.inGameEditorSettings) {
            inGameEditor.setInGameEditorSettings(
              data.payload.inGameEditorSettings
            );
          }
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
        } else if (data.command === 'getContentAABB') {
          if (inGameEditor) {
            this.sendContentAABB(data.messageId);
          }
        } else if (data.command === 'captureScreenshot') {
          this.sendScreenshot(data.messageId);
        } else if (data.command === 'simulateInput') {
          this.simulateInput(data.inputs, data.messageId);
        } else if (data.command === 'stepFrames') {
          this.stepFrames(data.count, data.fakeElapsedTimeMs, data.messageId);
        } else if (data.command === 'runFrames') {
          this.runFrames(
            data.inputs,
            data.postInputs,
            data.count,
            data.fakeElapsedTimeMs,
            data.messageId,
            data.autoRelease,
            data.includeCursorWorldCoordinates,
            data.cursorLayers
          );
        } else if (data.command === 'setRuntimeState') {
          this.setRuntimeState(data.operations, data.messageId);
        } else if (data.command === 'getInputState') {
          this.sendInputState(data.messageId);
        } else if (data.command === 'getActiveSounds') {
          this.sendActiveSounds(data.messageId);
        } else if (data.command === 'gameplayTest.run') {
          if (gdjs.gameplayTests) {
            gdjs.gameplayTests
              .runGameplayTest(runtimeGame, data.payload, (frame) => {
                that.sendGameplayTestProgress(data.messageId, frame);
              })
              .then((result) => {
                that.sendGameplayTestResult(data.messageId, result);
              })
              .catch((error) => {
                // `runGameplayTest` is not supposed to throw - this is a
                // safety net so the editor always gets an answer.
                that.sendGameplayTestResult(data.messageId, {
                  testName: (data.payload && data.payload.testName) || '',
                  status: 'error',
                  errors: ['Unexpected error while running the test: ' + error],
                });
              });
          } else {
            this.sendGameplayTestResult(data.messageId, {
              testName: (data.payload && data.payload.testName) || '',
              status: 'error',
              errors: [
                'Gameplay tests are not included in this preview - relaunch the preview from the editor.',
              ],
            });
          }
        } else if (data.command === 'gameplayTest.stop') {
          if (gdjs.gameplayTests) {
            gdjs.gameplayTests.stopCurrentGameplayTest();
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
        this.onUncaughtException(error as Error);
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

    sendRuntimeGameStatus(messageId?: number): void {
      const currentScene = this._runtimegame.getSceneStack().getCurrentScene();
      // Recently played sounds since the last status (cleared after reporting),
      // so a harness can confirm a PlaySound action actually fired.
      const recentlyPlayedSounds = this._takeRecentlyPlayedSounds();
      this._sendMessage(
        circularSafeStringify({
          command: 'status',
          messageId,
          payload: {
            isPaused: this._runtimegame.isPaused(),
            isInGameEdition: this._runtimegame.isInGameEdition(),
            sceneName: currentScene ? currentScene.getName() : null,
            recentlyPlayedSounds,
          },
        })
      );
    }

    private _takeRecentlyPlayedSounds(): Array<Object> {
      let recentlyPlayedSounds: Array<Object> = [];
      try {
        const soundManager = this._runtimegame.getSoundManager();
        if (
          soundManager &&
          typeof (soundManager as any).getRecentlyPlayedSounds === 'function'
        ) {
          recentlyPlayedSounds = (soundManager as any).getRecentlyPlayedSounds(
            true
          );
        }
      } catch (e) {
        // Ignore — sound reporting is best-effort.
      }
      return recentlyPlayedSounds;
    }

    /**
     * Send the latest signal diagnostics to the debugger server.
     */
    sendSignalDiagnostics(
      signalDiagnostics: gdjs.SignalDebugInfo | null
    ): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'signalDiagnostics',
          payload: signalDiagnostics,
        })
      );
    }

    /**
     * Dump all the relevant data from the {@link RuntimeGame} instance and send it to the server.
     */
    sendRuntimeGameDump(): void {
      const that = this;
      const message = {
        command: 'dump',
        payload: this._runtimegame,
        rendererDiagnostics: this._getRendererDiagnostics(),
      };
      const serializationStartTime = Date.now();

      // Stringify the message, excluding some known data that are big and/or not
      // useful for the debugger.
      const excludedValues = [that._runtimegame.getGameData()];
      const excludedKeys = [
        // Exclude reference to the debugger
        '_debuggerClient',
        '_debuggerRenderer',
        // Exclude some RuntimeScene fields:
        '_allInstancesList',
        '_signalBus',
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
     * Build a bounded, JSON-safe renderer summary before normal debugger dump
     * serialization redacts all renderer fields.
     */
    private _getRendererDiagnostics(): Object {
      const maxScenes = 16;
      const maxLayers = 64;
      const scenes = this._runtimegame.getSceneStack().getAllScenes();
      const sceneDiagnostics: Array<Object> = [];
      let returnedLayerCount = 0;
      let totalLayerCount = 0;

      scenes.slice(0, maxScenes).forEach((scene) => {
        const layerNames: Array<string> = [];
        scene.getAllLayerNames(layerNames);
        totalLayerCount += layerNames.length;
        const layers: Array<Object> = [];
        for (
          let index = 0;
          index < layerNames.length && returnedLayerCount < maxLayers;
          index++
        ) {
          const layerName = layerNames[index];
          returnedLayerCount++;
          try {
            const layer = scene.getLayer(layerName);
            const renderer = layer.getRenderer();
            layers.push(
              renderer &&
                typeof (renderer as any).getRendererDebugInfo === 'function'
                ? (renderer as any).getRendererDebugInfo()
                : {
                    layerName,
                    available: false,
                    error:
                      'The active layer renderer does not expose diagnostics.',
                  }
            );
          } catch (error) {
            layers.push({
              layerName,
              available: false,
              error:
                error && (error as Error).message
                  ? (error as Error).message
                  : String(error),
            });
          }
        }
        sceneDiagnostics.push({
          sceneName: scene.getName(),
          layers,
          totalLayerCount: layerNames.length,
          returnedLayerCount: layers.length,
          truncated: layers.length < layerNames.length,
        });
      });

      return {
        available: true,
        scenes: sceneDiagnostics,
        totalSceneCount: scenes.length,
        returnedSceneCount: sceneDiagnostics.length,
        totalLayerCount,
        returnedLayerCount,
        truncated:
          scenes.length > maxScenes || returnedLayerCount < totalLayerCount,
        limits: {
          scenes: maxScenes,
          layers: maxLayers,
          threeNodesPerLayer: 5000,
        },
      };
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
      objectNameToEdit: string | null;
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

    sendKeyboardShortcut(keyEventLike: {
      keyCode: number;
      metaKey: boolean;
      ctrlKey: boolean;
      altKey: boolean;
      shiftKey: boolean;
    }): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'handleKeyboardShortcutFromInGameEditor',
          editorId: inGameEditor.getEditorId(),
          payload: keyEventLike,
        })
      );
    }

    /**
     * Send a progress update about the gameplay test being run.
     */
    sendGameplayTestProgress(messageId: number, frame: number): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'gameplayTest.progress',
          messageId,
          payload: { frame },
        })
      );
    }

    /**
     * Send the result of a gameplay test run.
     */
    sendGameplayTestResult(messageId: number, result: Object): void {
      this._sendMessage(
        circularSafeStringify({
          command: 'gameplayTest.result',
          messageId,
          payload: result,
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

    sendContentAABB(messageId: number): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      const contentAABB = inGameEditor.getContentAABB();
      this._sendMessage(
        circularSafeStringify({
          command: 'contentAABB',
          editorId: inGameEditor.getEditorId(),
          messageId,
          payload: contentAABB
            ? {
                minX: contentAABB.min[0],
                minY: contentAABB.min[1],
                minZ: contentAABB.min[2],
                maxX: contentAABB.max[0],
                maxY: contentAABB.max[1],
                maxZ: contentAABB.max[2],
              }
            : null,
        })
      );
    }

    sendInGameEditorDropPosition(messageId: number): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      this._sendMessage(
        circularSafeStringify({
          command: 'inGameEditorDropPosition',
          editorId: inGameEditor ? inGameEditor.getEditorId() : null,
          messageId,
          payload: {
            position: inGameEditor
              ? inGameEditor.getNewInstanceDropPosition()
              : null,
          },
        })
      );
    }

    /**
     * Capture the current rendered frame as a PNG data URL and send it back to
     * the debugger server, addressed by messageId so the editor can resolve a
     * pending sendMessageWithResponse() call. Works in any preview (not only the
     * in-game editor) because it reads the shared game canvas directly.
     */
    sendScreenshot(messageId: number): void {
      let dataUrl: string | null = null;
      let width = 0;
      let height = 0;
      let error: string | null = null;
      let rendered = false;
      try {
        // Force one render pass without advancing game logic. This makes the
        // canvas capture deterministic while the preview is paused and avoids
        // reading a partially composited frame left by a throttled rAF loop.
        rendered = this._runtimegame.getSceneStack().renderWithoutStep();
        const canvas = this._runtimegame.getRenderer().getCanvas();
        if (!canvas) {
          error = 'No game canvas is available to capture.';
        } else {
          width = canvas.width;
          height = canvas.height;
          // preserveDrawingBuffer is enabled on the renderers so this captures
          // the composited 2D + 3D frame.
          dataUrl = canvas.toDataURL('image/png');
        }
      } catch (e) {
        error = (e as Error).message || 'Failed to capture the canvas.';
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'screenshot',
          messageId,
          payload: {
            dataUrl,
            width,
            height,
            error,
            rendered,
            capturedAt: Date.now(),
          },
        })
      );
    }

    /**
     * Inject simulated input events into the running game's InputManager, so an
     * automated harness can drive the game (press keys, move/click the mouse,
     * touch). Each input is an object: { type, ... }.
     *   keyPressed/keyReleased: { type, keyCode, location? }
     *   releaseAllKeys: { type }
     *   mouseMove: { type, x, y }   (game coordinates)
     *   mouseButtonPressed/mouseButtonReleased: { type, button }
     *   touchStart/touchMove: { type, identifier, x, y }
     *   touchEnd: { type, identifier }
     * Mouse/touch coordinates are in game (scene) coordinates.
     */
    simulateInput(inputs: Array<any>, messageId: number): void {
      const applied: Array<string> = [];
      let error: string | null = null;
      try {
        (inputs || []).forEach((input) => {
          this._applySimulatedInput(input, applied);
        });
      } catch (e) {
        error = (e as Error).message || 'Failed to simulate input.';
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'inputSimulated',
          messageId,
          payload: { applied, error },
        })
      );
    }

    /**
     * Apply a single simulated input event to the InputManager. Shared by
     * `simulateInput` and the atomic `runFrames` command so the two stay in sync.
     */
    private _applySimulatedInput(input: any, applied: Array<string>): void {
      const inputManager = this._runtimegame.getInputManager();
      if (!input || typeof input !== 'object') return;
      switch (input.type) {
        case 'keyPressed':
          inputManager.onKeyPressed(input.keyCode, input.location);
          applied.push('keyPressed:' + input.keyCode);
          break;
        case 'keyReleased':
          inputManager.onKeyReleased(input.keyCode, input.location);
          applied.push('keyReleased:' + input.keyCode);
          break;
        case 'releaseAllKeys':
          inputManager.releaseAllPressedKeys();
          applied.push('releaseAllKeys');
          break;
        case 'mouseMove':
          inputManager.onMouseMove(input.x, input.y);
          applied.push('mouseMove');
          break;
        case 'mouseButtonPressed':
          inputManager.onMouseButtonPressed(input.button || 0);
          applied.push('mouseButtonPressed:' + (input.button || 0));
          break;
        case 'mouseButtonReleased':
          inputManager.onMouseButtonReleased(input.button || 0);
          applied.push('mouseButtonReleased:' + (input.button || 0));
          break;
        case 'touchStart':
          inputManager.onTouchStart(input.identifier || 0, input.x, input.y);
          applied.push('touchStart');
          break;
        case 'touchMove':
          inputManager.onTouchMove(input.identifier || 0, input.x, input.y);
          applied.push('touchMove');
          break;
        case 'touchEnd':
          inputManager.onTouchEnd(input.identifier || 0);
          applied.push('touchEnd');
          break;
        default:
          applied.push('unknown:' + input.type);
      }
    }

    /**
     * Atomic runtime-test primitive: inject inputs, then step exactly `count`
     * frames, then reply ONCE with the full game dump — all synchronously on the
     * websocket callback, with NO dependency on requestAnimationFrame. This is
     * what makes runtime verification work even when the OS has throttled a
     * backgrounded/occluded preview window (whose rAF loop is paused): the game
     * logic still advances because we drive `step()` directly here.
     *
     * The single reply (`framesRan`) carries the same serialized RuntimeGame the
     * `dump` command produces, so a harness gets injected-input + N-frame-advance
     * + resulting state in one round-trip that cannot half-fail mid-sequence.
     */
    runFrames(
      inputs: Array<any>,
      postInputs: Array<any>,
      count: number,
      fakeElapsedTimeMs: number,
      messageId: number,
      autoRelease?: boolean,
      includeCursorWorldCoordinates?: boolean,
      cursorLayers?: Array<string>
    ): void {
      const applied: Array<string> = [];
      let error: string | null = null;
      const frames = Math.max(1, Math.min(2000, count || 1));
      const delta =
        typeof fakeElapsedTimeMs === 'number' && fakeElapsedTimeMs > 0
          ? fakeElapsedTimeMs
          : 1000 / 60;
      let steppedFrames = 0;
      let stoppedEarly = false;
      let failedFrame: number | null = null;
      let failure: any = null;
      const cleanup = {
        attempted: !!autoRelease || !!(postInputs && postInputs.length),
        postInputsApplied: 0,
        keysReleased: false,
        success: true,
        error: null as string | null,
      };
      try {
        // 1. Inject inputs (held keys persist across the stepped frames).
        (inputs || []).forEach((input) => {
          this._applySimulatedInput(input, applied);
        });
        // 2. Pause so the rAF loop (if it is running at all) does not also step.
        if (!this._runtimegame.isPaused()) {
          this._runtimegame.pause(true);
        }
        // 3. Step the simulation directly — independent of rendering.
        for (let i = 0; i < frames; i++) {
          const keepGoing = this._runtimegame.getSceneStack().step(delta);
          steppedFrames++;
          if (!keepGoing) {
            stoppedEarly = true;
            break;
          }
        }
      } catch (e) {
        failure = e;
        error = (e as Error).message || 'Failed to run frames.';
        failedFrame = Math.min(frames, steppedFrames + 1);
        stoppedEarly = true;
      } finally {
        // Post-inputs and key release are cleanup operations: they must run even
        // when game events throw in the middle of a stepped frame.
        try {
          (postInputs || []).forEach((input) => {
            this._applySimulatedInput(input, applied);
            cleanup.postInputsApplied++;
          });
        } catch (cleanupError) {
          cleanup.success = false;
          cleanup.error =
            (cleanupError as Error).message ||
            'Runtime post-input cleanup failed.';
          if (!error) error = cleanup.error;
        }

        // Keep key release in its own guarded block. A malformed post-input must
        // never prevent auto_release from clearing keys held before the failure.
        if (autoRelease) {
          try {
            const inputManager: any = this._runtimegame.getInputManager();
            if (typeof inputManager.releaseAllPressedKeys !== 'function') {
              throw new Error(
                'The runtime input manager cannot release all pressed keys.'
              );
            }
            inputManager.releaseAllPressedKeys();
            applied.push('autoReleasedKeys');
            cleanup.keysReleased = true;
          } catch (cleanupError) {
            cleanup.success = false;
            const releaseError =
              (cleanupError as Error).message || 'Runtime key release failed.';
            cleanup.error = cleanup.error
              ? cleanup.error + ' ' + releaseError
              : releaseError;
            if (!error) error = releaseError;
          }
        }
      }
      // 5. Reply once with the full dump plus the run metadata (including which
      // keys are STILL held), so the bridge can summarize live state without a
      // 2nd call and the caller can see lingering held keys and sounds fired by
      // the stepped events.
      const recentlyPlayedSounds = this._takeRecentlyPlayedSounds();
      this._sendRuntimeGameDumpWith({
        command: 'framesRan',
        messageId,
        runFrames: {
          applied,
          requestedFrames: frames,
          steppedFrames,
          deltaMs: delta,
          stoppedEarly: stoppedEarly || steppedFrames < frames,
          failedFrame,
          partialStateAvailable: steppedFrames > 0,
          failure:
            failure && typeof failure === 'object'
              ? {
                  code: failure.code,
                  name: failure.name,
                  usage: failure.usage,
                  pickedInstancesCount: failure.pickedInstancesCount,
                  eventId: failure.eventId || failure.aiGeneratedEventId,
                  instructionId: failure.instructionId,
                  suggestedEventStructure: failure.suggestedEventStructure,
                  stack: failure.stack,
                }
              : undefined,
          cleanup,
          paused: this._runtimegame.isPaused(),
          heldKeys: this._getHeldKeyCodes(),
          recentlyPlayedSounds,
          cursorWorldCoordinates: includeCursorWorldCoordinates
            ? this._getCursorWorldCoordinates(cursorLayers)
            : undefined,
          error,
        },
      });
    }

    // The key codes currently held down in the InputManager (truthy entries in
    // _pressedKeys.items). Used by runFrames to surface lingering held keys.
    private _getHeldKeyCodes(): Array<number> {
      const held: Array<number> = [];
      try {
        const inputManager: any = this._runtimegame.getInputManager();
        const pressedItems =
          inputManager._pressedKeys && inputManager._pressedKeys.items;
        if (pressedItems) {
          for (const keyCode in pressedItems) {
            if (
              Object.prototype.hasOwnProperty.call(pressedItems, keyCode) &&
              pressedItems[keyCode]
            ) {
              held.push(parseInt(keyCode, 10));
            }
          }
        }
      } catch (e) {
        // ignore
      }
      return held;
    }

    private _getCursorWorldCoordinates(cursorLayers?: Array<string>): Object {
      const payload: any = {
        sceneName: null,
        canvasX: 0,
        canvasY: 0,
        layers: [],
        error: null,
      };
      try {
        const inputManager: any = this._runtimegame.getInputManager();
        payload.canvasX = inputManager.getCursorX
          ? inputManager.getCursorX()
          : 0;
        payload.canvasY = inputManager.getCursorY
          ? inputManager.getCursorY()
          : 0;

        const scene = this._runtimegame.getSceneStack().getCurrentScene();
        if (!scene) {
          payload.error = 'No current scene.';
          return payload;
        }
        payload.sceneName = scene.getName();

        const layerNames =
          cursorLayers && cursorLayers.length ? cursorLayers.slice(0, 50) : [];
        if (!layerNames.length) {
          scene.getAllLayerNames(layerNames);
        }

        layerNames.forEach((layerName) => {
          const exists = scene.hasLayer(layerName);
          if (!exists) {
            payload.layers.push({
              layerName,
              exists,
              error: 'Layer does not exist.',
            });
            return;
          }
          const layer = scene.getLayer(layerName);
          const point = layer.convertCoords(
            payload.canvasX,
            payload.canvasY,
            0,
            [0, 0]
          );
          payload.layers.push({
            layerName,
            exists,
            worldX: point[0],
            worldY: point[1],
            cameraX:
              typeof layer.getCameraX === 'function'
                ? layer.getCameraX(0)
                : undefined,
            cameraY:
              typeof layer.getCameraY === 'function'
                ? layer.getCameraY(0)
                : undefined,
            cameraZoom:
              typeof layer.getCameraZoom === 'function'
                ? layer.getCameraZoom(0)
                : undefined,
            cameraRotation:
              typeof layer.getCameraRotation === 'function'
                ? layer.getCameraRotation(0)
                : undefined,
          });
        });
      } catch (e) {
        payload.error =
          (e as Error).message || 'Failed to read cursor coordinates.';
      }
      return payload;
    }

    /**
     * Serialize the RuntimeGame dump (same exclusions/limits as
     * `sendRuntimeGameDump`) but merge extra top-level fields into the message
     * and send it under a caller-chosen command. Lets `runFrames` return the
     * dump in a single matched reply.
     */
    private _sendRuntimeGameDumpWith(extraTopLevel: Object): void {
      const that = this;
      const message = {
        ...extraTopLevel,
        command: (extraTopLevel as any).command || 'dump',
        payload: this._runtimegame,
        rendererDiagnostics: this._getRendererDiagnostics(),
      };
      const excludedValues = [that._runtimegame.getGameData()];
      const excludedKeys = [
        '_debuggerClient',
        '_debuggerRenderer',
        '_allInstancesList',
        '_signalBus',
        '_runtimeGame',
        '_runtimeScene',
        '_behaviorsTable',
        '_animations',
        '_animationFrame',
        'linkedObjectsManager',
        '_platformRBush',
        'HSHG',
        '_obstaclesHSHG',
        'owner',
        '_renderer',
        '_gameRenderer',
        '_imageManager',
        '_rendererEffects',
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
        18
      );
      this._sendMessage(stringifiedMessage);
    }

    /**
     * Advance the game by exactly `count` frames using a fixed per-frame delta,
     * for deterministic, reproducible testing. The game is paused first so the
     * normal rAF loop only renders; each manual step runs full event logic. This
     * lets a harness do: pause → inject input → step N frames → read state.
     */
    stepFrames(
      count: number,
      fakeElapsedTimeMs: number,
      messageId: number
    ): void {
      const frames = Math.max(1, Math.min(1000, count || 1));
      // 16.667 ms ≈ one 60 FPS frame. Kept per-frame small so TimeManager's
      // minimal-framerate clamp does not distort the delta.
      const delta =
        typeof fakeElapsedTimeMs === 'number' && fakeElapsedTimeMs > 0
          ? fakeElapsedTimeMs
          : 1000 / 60;
      // Ensure the game is paused so the rAF loop does not also step.
      if (!this._runtimegame.isPaused()) {
        this._runtimegame.pause(true);
      }
      let steppedFrames = 0;
      let stoppedEarly = false;
      for (let i = 0; i < frames; i++) {
        const keepGoing = this._runtimegame.getSceneStack().step(delta);
        steppedFrames++;
        if (!keepGoing) {
          stoppedEarly = true;
          break;
        }
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'framesStepped',
          messageId,
          payload: {
            steppedFrames,
            deltaMs: delta,
            stoppedEarly,
            paused: this._runtimegame.isPaused(),
          },
        })
      );
    }

    /**
     * Apply test/debug state operations to the running game: set a scene/global
     * variable, move/spawn/delete an instance. Each op is { type, ... }.
     *   setVariable: { type, scope: 'scene'|'global', name, value }
     *   moveInstance: { type, objectName, index?, x, y }
     *   spawnInstance: { type, objectName, x?, y? }
     *   deleteInstance: { type, objectName, index? }
     *   deleteAllInstances: { type, objectName }
     */
    setRuntimeState(operations: Array<any>, messageId: number): void {
      const applied: Array<string> = [];
      let error: string | null = null;
      const scene = this._runtimegame.getSceneStack().getCurrentScene();
      try {
        (operations || []).forEach((op) => {
          if (!op || typeof op !== 'object') return;
          if (op.type === 'setVariable') {
            const container =
              op.scope === 'global'
                ? this._runtimegame.getVariables()
                : scene
                  ? scene.getVariables()
                  : null;
            if (!container) {
              applied.push('setVariable:no-scene');
              return;
            }
            const variable = container.get(op.name);
            if (typeof op.value === 'number') variable.setNumber(op.value);
            else if (typeof op.value === 'boolean')
              variable.setBoolean(op.value);
            else variable.setString('' + op.value);
            applied.push('setVariable:' + op.scope + '.' + op.name);
          } else if (op.type === 'moveInstance' && scene) {
            const instances = scene.getInstancesOf(op.objectName) || [];
            const target = instances[op.index || 0];
            if (target) {
              target.setPosition(op.x, op.y);
              applied.push('moveInstance:' + op.objectName);
            } else {
              applied.push('moveInstance:not-found:' + op.objectName);
            }
          } else if (op.type === 'spawnInstance' && scene) {
            const created = scene.createObject(op.objectName);
            if (created) {
              if (typeof op.x === 'number' && typeof op.y === 'number')
                created.setPosition(op.x, op.y);
              applied.push('spawnInstance:' + op.objectName);
            } else {
              applied.push('spawnInstance:unknown-object:' + op.objectName);
            }
          } else if (op.type === 'deleteInstance' && scene) {
            const instances = scene.getInstancesOf(op.objectName) || [];
            const target = instances[op.index || 0];
            if (target) {
              target.deleteFromScene();
              applied.push('deleteInstance:' + op.objectName);
            } else {
              applied.push('deleteInstance:not-found:' + op.objectName);
            }
          } else if (op.type === 'deleteAllInstances' && scene) {
            // Delete every live instance of the object in one op (no need to
            // know the count or call index-by-index).
            const instances = (
              scene.getInstancesOf(op.objectName) || []
            ).slice();
            for (const instance of instances) {
              instance.deleteFromScene();
            }
            applied.push(
              'deleteAllInstances:' + op.objectName + ':' + instances.length
            );
          } else {
            applied.push('unknown:' + op.type);
          }
        });
      } catch (e) {
        error = (e as Error).message || 'Failed to apply runtime state.';
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'runtimeStateSet',
          messageId,
          payload: { applied, error },
        })
      );
    }

    /**
     * Report the InputManager's CURRENT state (pressed keys, last pressed key,
     * mouse position/buttons). Lets a harness confirm simulated input actually
     * reached the game (distinguishes "input not received" from "logic bug").
     */
    sendInputState(messageId: number): void {
      const payload: any = {
        pressedKeyCodes: [],
        lastPressedKey: 0,
        mouseX: 0,
        mouseY: 0,
        pressedMouseButtons: [],
        error: null,
      };
      try {
        const inputManager: any = this._runtimegame.getInputManager();
        // Enumerate currently-pressed keys (truthy values in _pressedKeys.items).
        const pressedItems =
          inputManager._pressedKeys && inputManager._pressedKeys.items;
        if (pressedItems) {
          for (const keyCode in pressedItems) {
            if (
              Object.prototype.hasOwnProperty.call(pressedItems, keyCode) &&
              pressedItems[keyCode]
            ) {
              payload.pressedKeyCodes.push(parseInt(keyCode, 10));
            }
          }
        }
        payload.lastPressedKey =
          typeof inputManager.getLastPressedKey === 'function'
            ? inputManager.getLastPressedKey()
            : inputManager._lastPressedKey || 0;
        payload.anyKeyPressed =
          typeof inputManager.anyKeyPressed === 'function'
            ? inputManager.anyKeyPressed()
            : payload.pressedKeyCodes.length > 0;
        payload.mouseX = inputManager.getCursorX
          ? inputManager.getCursorX()
          : 0;
        payload.mouseY = inputManager.getCursorY
          ? inputManager.getCursorY()
          : 0;
        for (let button = 0; button < 5; button++) {
          if (
            inputManager.isMouseButtonPressed &&
            inputManager.isMouseButtonPressed(button)
          ) {
            payload.pressedMouseButtons.push(button);
          }
        }
      } catch (e) {
        payload.error = (e as Error).message || 'Failed to read input state.';
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'inputState',
          messageId,
          payload,
        })
      );
    }

    /**
     * Report currently-playing sounds and musics (channel, resource name,
     * looping). Lets a harness confirm a looping BGM is actually playing, even
     * when the recentlyPlayedSounds history buffer is flooded by SFX.
     */
    sendActiveSounds(messageId: number): void {
      const sounds: Array<any> = [];
      const musics: Array<any> = [];
      let error: string | null = null;
      try {
        const soundManager: any = this._runtimegame.getSoundManager();
        const describe = (sound: any, channel: number | null) => {
          if (!sound || typeof sound.playing !== 'function') return null;
          if (!sound.playing()) return null;
          const data =
            typeof sound.getNetworkSyncData === 'function'
              ? sound.getNetworkSyncData()
              : null;
          return {
            channel,
            soundName: data ? data.resourceName : undefined,
            looping:
              typeof sound.getLoop === 'function' ? sound.getLoop() : undefined,
          };
        };
        (soundManager._freeSounds || []).forEach((sound: any) => {
          const d = describe(sound, null);
          if (d) sounds.push(d);
        });
        (soundManager._freeMusics || []).forEach((music: any) => {
          const d = describe(music, null);
          if (d) musics.push(d);
        });
        const soundChannels = soundManager._sounds || {};
        for (const channel in soundChannels) {
          if (Object.prototype.hasOwnProperty.call(soundChannels, channel)) {
            const d = describe(soundChannels[channel], parseInt(channel, 10));
            if (d) sounds.push(d);
          }
        }
        const musicChannels = soundManager._musics || {};
        for (const channel in musicChannels) {
          if (Object.prototype.hasOwnProperty.call(musicChannels, channel)) {
            const d = describe(musicChannels[channel], parseInt(channel, 10));
            if (d) musics.push(d);
          }
        }
      } catch (e) {
        error = (e as Error).message || 'Failed to read active sounds.';
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'activeSounds',
          messageId,
          payload: { sounds, musics, error },
        })
      );
    }

    sendGraphicsContextLost(): void {
      const inGameEditor = this._runtimegame.getInGameEditor();
      if (!inGameEditor) {
        return;
      }
      this._sendMessage(
        circularSafeStringify({
          command: 'notifyGraphicsContextLost',
          editorId: inGameEditor.getEditorId(),
          payload: {},
        })
      );
    }

    /**
     * Send profiling results.
     * @param framesAverageMeasures The measures made for each frames.
     * @param stats Other measures done during the profiler run.
     */
    sendProfilerOutput(
      framesAverageMeasures: FrameMeasureOutput,
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
      let hasDisposedRuntime = false;
      const disposeRuntimeBeforeReload = () => {
        if (hasDisposedRuntime) return;

        // A hard reload is used for resources such as 3D models that can't be
        // safely hot-reloaded in place. Explicitly dispose the current game so
        // cloned scenes, animation mixers, resource caches and WebGL renderers
        // don't stay alive while the next document is being loaded.
        hasDisposedRuntime = true;
        try {
          this._runtimegame.dispose(true);
        } catch (error) {
          logger.warn('Could not dispose the game before reloading it', error);
        }
      };

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
        disposeRuntimeBeforeReload();
        location.replace(reloadUrl);
      } catch (error) {
        logger.error(
          'Could not reload the game with the new initial status',
          error
        );
        disposeRuntimeBeforeReload();
        location.reload();
      }
    }
  }
}

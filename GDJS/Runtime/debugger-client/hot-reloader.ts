namespace gdjs {
  const logger = new gdjs.Logger('Hot reloader');
  export type HotReloaderLog = {
    message: string;
    kind: 'fatal' | 'error' | 'warning' | 'info';
  };

  export type ChangedRuntimeBehavior = {
    oldBehaviorConstructor: Function;
    newBehaviorConstructor: Function;
    behaviorTypeName: string;
  };

  /**
   * Reload scripts/data of an exported game and applies the changes
   * to the running runtime game.
   */
  export class HotReloader {
    _runtimeGame: gdjs.RuntimeGame;
    _reloadedScriptElement: Record<string, HTMLScriptElement> = {};
    _logs: HotReloaderLog[] = [];
    _alreadyLoadedScriptFiles: Record<string, boolean> = {};

    /**
     * @param runtimeGame - The `gdjs.RuntimeGame` to be hot-reloaded.
     */
    constructor(runtimeGame: gdjs.RuntimeGame) {
      this._runtimeGame = runtimeGame;
    }

    static groupByPersistentUuid<
      ObjectWithPersistentId extends { persistentUuid: string | null }
    >(
      objectsWithPersistentId: ObjectWithPersistentId[]
    ): Record<string, ObjectWithPersistentId> {
      return objectsWithPersistentId.reduce(function (objectsMap, object) {
        if (object.persistentUuid) {
          objectsMap[object.persistentUuid] = object;
        }
        return objectsMap;
      }, {});
    }

    _canReloadScriptFile(srcFilename: string): boolean {
      function endsWith(str: string, suffix: string): boolean {
        const suffixPosition = str.indexOf(suffix);
        return (
          suffixPosition !== -1 && suffixPosition === str.length - suffix.length
        );
      }

      // Never reload .h script files, as they are leaking by mistake from C++ extensions.
      if (endsWith(srcFilename, '.h')) {
        return false;
      }

      // Make sure some files are loaded only once.
      if (this._alreadyLoadedScriptFiles[srcFilename]) {
        if (
          // Don't reload Box2d as it would confuse and crash the asm.js library.
          endsWith(srcFilename, 'box2d.js') ||
          // Don't reload sha256.js library.
          endsWith(srcFilename, 'sha256.js') ||
          // Don't reload shifty.js library.
          endsWith(srcFilename, 'shifty.js') ||
          // Don't reload shopify-buy library.
          endsWith(srcFilename, 'shopify-buy.umd.polyfilled.min.js') ||
          // Don't reload pixi-multistyle-text library.
          endsWith(srcFilename, 'pixi-multistyle-text.umd.js') ||
          // Don't reload pixi-tilemap library.
          endsWith(srcFilename, 'pixi-tilemap.umd.js') ||
          // Don't reload bondage.js library.
          endsWith(srcFilename, 'bondage.min.js') ||
          // Don't reload pixi-particles library.
          endsWith(srcFilename, 'pixi-particles-pixi-renderer.min.js') ||
          // Don't reload pixi-tilemap amd pixi-tilemap-helper libraries.
          endsWith(srcFilename, 'pixi-tilemap.umd.js') ||
          endsWith(srcFilename, 'pixi-tilemap-helper.js') ||
          // Don't reload pako library (used in pixi-tilemap)
          endsWith(srcFilename, 'pako/dist/pako.min')
        ) {
          return false;
        }
      }
      return true;
    }

    _reloadScript(srcFilename: string): Promise<void> {
      function endsWith(str: string, suffix: string): boolean {
        const suffixPosition = str.indexOf(suffix);
        return (
          suffixPosition !== -1 && suffixPosition === str.length - suffix.length
        );
      }
      if (!this._canReloadScriptFile(srcFilename)) {
        this._logs.push({
          kind: 'info',
          message:
            'Not reloading ' +
            srcFilename +
            ' as it is blocked for hot-reloading.',
        });
        return Promise.resolve();
      }
      const head = document.getElementsByTagName('head')[0];
      if (!head) {
        return Promise.reject(
          new Error('No head element found, are you in a navigator?')
        );
      }
      return new Promise((resolve, reject) => {
        const existingScriptElement = this._reloadedScriptElement[srcFilename];
        if (existingScriptElement) {
          head.removeChild(existingScriptElement);
        } else {
          // Check if there is an existing scriptElement in head
          const headScriptElements = head.getElementsByTagName('script');
          for (let i = 0; i < headScriptElements.length; ++i) {
            const scriptElement = headScriptElements[i];
            if (endsWith(scriptElement.src, srcFilename)) {
              head.removeChild(scriptElement);
            }
          }
        }
        const reloadedScriptElement = document.createElement('script');
        reloadedScriptElement.src = srcFilename + '?timestamp=' + Date.now();
        reloadedScriptElement.onload = () => {
          resolve();
        };
        reloadedScriptElement.onerror = (event) => {
          reject(event);
        };
        head.appendChild(reloadedScriptElement);
        this._reloadedScriptElement[srcFilename] = reloadedScriptElement;
      });
    }

    hotReload(): Promise<HotReloaderLog[]> {
      logger.info('Hot reload started');
      this._runtimeGame.pause(true);
      this._logs = [];

      // Save old data of the project, to be used to compute
      // the difference between the old and new project data:

      const oldProjectData: ProjectData = gdjs.projectData;

      const oldScriptFiles = gdjs.runtimeGameOptions
        .scriptFiles as RuntimeGameOptionsScriptFile[];

      oldScriptFiles.forEach((scriptFile) => {
        this._alreadyLoadedScriptFiles[scriptFile.path] = true;
      });
      const oldBehaviorConstructors: { [key: string]: Function } = {};

      for (let behaviorTypeName in gdjs.behaviorsTypes.items) {
        oldBehaviorConstructors[behaviorTypeName] =
          gdjs.behaviorsTypes.items[behaviorTypeName];
      }

      // Reload projectData and runtimeGameOptions stored by convention in data.js:
      return this._reloadScript('data.js').then(() => {
        const newProjectData: ProjectData = gdjs.projectData;

        const newRuntimeGameOptions: RuntimeGameOptions =
          gdjs.runtimeGameOptions;

        const newScriptFiles = newRuntimeGameOptions.scriptFiles as RuntimeGameOptionsScriptFile[];
        const projectDataOnlyExport = !!newRuntimeGameOptions.projectDataOnlyExport;

        // Reload the changed scripts, which will have the side effects of re-running
        // the new scripts, potentially replacing the code of the free functions from
        // extensions (which is fine) and registering updated behaviors (which will
        // need to be re-instantiated in runtime objects).
        return this.reloadScriptFiles(
          newProjectData,
          oldScriptFiles,
          newScriptFiles,
          projectDataOnlyExport
        )
          .then(() => {
            const changedRuntimeBehaviors = this._computeChangedRuntimeBehaviors(
              oldBehaviorConstructors,
              gdjs.behaviorsTypes.items
            );
            return this._hotReloadRuntimeGame(
              oldProjectData,
              newProjectData,
              changedRuntimeBehaviors,
              this._runtimeGame
            );
          })
          .catch((error) => {
            const errorTarget = error.target;
            if (errorTarget instanceof HTMLScriptElement) {
              this._logs.push({
                kind: 'fatal',
                message: 'Unable to reload script:' + errorTarget.src,
              });
            } else {
              this._logs.push({
                kind: 'fatal',
                message:
                  'Unexpected error happened while hot-reloading:' +
                  error.message,
              });
            }
          })
          .then(() => {
            logger.info('Hot reload finished with logs:', this._logs);
            this._runtimeGame.pause(false);
            return this._logs;
          });
      });
    }

    _computeChangedRuntimeBehaviors(
      oldBehaviorConstructors: Record<string, Function>,
      newBehaviorConstructors: Record<string, Function>
    ): ChangedRuntimeBehavior[] {
      const changedRuntimeBehaviors: ChangedRuntimeBehavior[] = [];
      for (let behaviorTypeName in oldBehaviorConstructors) {
        const oldBehaviorConstructor =
          oldBehaviorConstructors[behaviorTypeName];
        const newBehaviorConstructor =
          newBehaviorConstructors[behaviorTypeName];
        if (!newBehaviorConstructor) {
          this._logs.push({
            kind: 'warning',
            message:
              'Behavior with type ' +
              behaviorTypeName +
              ' was removed from the registered behaviors in gdjs.',
          });
        } else {
          if (oldBehaviorConstructor !== newBehaviorConstructor) {
            this._logs.push({
              kind: 'info',
              message:
                'Behavior with type ' +
                behaviorTypeName +
                ' was changed, and will be re-instantiated in gdjs.RuntimeObjects using it.',
            });
            changedRuntimeBehaviors.push({
              oldBehaviorConstructor,
              newBehaviorConstructor,
              behaviorTypeName,
            });
          }
        }
      }
      return changedRuntimeBehaviors;
    }

    reloadScriptFiles(
      newProjectData: ProjectData,
      oldScriptFiles: RuntimeGameOptionsScriptFile[],
      newScriptFiles: RuntimeGameOptionsScriptFile[],
      projectDataOnlyExport: boolean
    ): Promise<void[]> {
      const reloadPromises: Array<Promise<void>> = [];

      // Reload events, only if they were exported.
      if (!projectDataOnlyExport) {
        newProjectData.layouts.forEach((_layoutData, index) => {
          reloadPromises.push(this._reloadScript('code' + index + '.js'));
        });
      }
      for (let i = 0; i < newScriptFiles.length; ++i) {
        const newScriptFile = newScriptFiles[i];
        const oldScriptFile = oldScriptFiles.filter(
          (scriptFile) => scriptFile.path === newScriptFile.path
        )[0];
        if (!oldScriptFile) {
          // Script file added
          this._logs.push({
            kind: 'info',
            message:
              'Loading ' +
              newScriptFile.path +
              ' as it was added to the list of scripts.',
          });
          reloadPromises.push(this._reloadScript(newScriptFile.path));
        } else {
          // Script file changed, which can be the case for extensions created
          // from the editor, containing free functions or behaviors.
          if (newScriptFile.hash !== oldScriptFile.hash) {
            this._logs.push({
              kind: 'info',
              message:
                'Reloading ' + newScriptFile.path + ' because it was changed.',
            });
            reloadPromises.push(this._reloadScript(newScriptFile.path));
          }
        }
      }
      for (let i = 0; i < oldScriptFiles.length; ++i) {
        const oldScriptFile = oldScriptFiles[i];
        const newScriptFile = newScriptFiles.filter(
          (scriptFile) => scriptFile.path === oldScriptFile.path
        )[0];

        // A file may be removed because of a partial preview.
        if (!newScriptFile && !projectDataOnlyExport) {
          this._logs.push({
            kind: 'warning',
            message: 'Script file ' + oldScriptFile.path + ' was removed.',
          });
        }
      }
      return Promise.all(reloadPromises);
    }

    async _hotReloadRuntimeGame(
      oldProjectData: ProjectData,
      newProjectData: ProjectData,
      changedRuntimeBehaviors: ChangedRuntimeBehavior[],
      runtimeGame: gdjs.RuntimeGame
    ): Promise<void> {
      const sceneStack = runtimeGame.getSceneStack();
      const currentScene = sceneStack.getCurrentScene();
      if (!currentScene) {
        // It can't actually happen.
        this._logs.push({
          kind: 'error',
          message: "Can't hot-reload as no scene are opened.",
        });
        return;
      }
      // Update project data and re-load assets (sound/image/font/json managers
      // will take care of reloading only what is needed).
      runtimeGame.setProjectData(newProjectData);
      await runtimeGame.loadFirstAssetsAndStartBackgroundLoading(
        currentScene.getName(),
        () => {}
      );
      this._hotReloadVariablesContainer(
        oldProjectData.variables,
        newProjectData.variables,
        runtimeGame.getVariables()
      );

      // Reload runtime scenes
      sceneStack._stack.forEach((runtimeScene) => {
        const oldLayoutData = oldProjectData.layouts.filter(
          (layoutData) => layoutData.name === runtimeScene.getName()
        )[0];
        const newLayoutData = newProjectData.layouts.filter(
          (layoutData) => layoutData.name === runtimeScene.getName()
        )[0];
        if (oldLayoutData && newLayoutData) {
          this._hotReloadRuntimeScene(
            oldLayoutData,
            newLayoutData,
            changedRuntimeBehaviors,
            runtimeScene
          );
        } else {
          // A scene was removed. Not hot-reloading this.
          this._logs.push({
            kind: 'error',
            message:
              'Scene ' +
              oldLayoutData.name +
              ' was removed. A fresh preview should be launched.',
          });
        }
      });

      // Reload changes in external layouts
      newProjectData.externalLayouts.forEach((newExternalLayoutData) => {
        const oldExternalLayoutData = oldProjectData.externalLayouts.filter(
          (externalLayoutData) =>
            externalLayoutData.name === newExternalLayoutData.name
        )[0];
        if (
          oldExternalLayoutData &&
          // Check if there are actual changes, to avoid useless work trying to
          // hot-reload all the scenes.
          !HotReloader.deepEqual(oldExternalLayoutData, newExternalLayoutData)
        ) {
          sceneStack._stack.forEach((runtimeScene) => {
            this._hotReloadRuntimeSceneInstances(
              oldExternalLayoutData.instances,
              newExternalLayoutData.instances,
              runtimeScene
            );
          });
        }
      });
    }

    _hotReloadVariablesContainer(
      oldVariablesData: RootVariableData[],
      newVariablesData: RootVariableData[],
      variablesContainer: gdjs.VariablesContainer
    ): void {
      newVariablesData.forEach((newVariableData) => {
        const variableName = newVariableData.name;
        const oldVariableData = oldVariablesData.find(
          (variable) => variable.name === variableName
        );
        const variable = variablesContainer.get(newVariableData.name);

        if (!oldVariableData) {
          // New variable
          variablesContainer.add(
            variableName,
            new gdjs.Variable(newVariableData)
          );
        } else if (
          gdjs.Variable.isPrimitive(newVariableData.type || 'number') &&
          (oldVariableData.value !== newVariableData.value ||
            !gdjs.Variable.isPrimitive(oldVariableData.type || 'number'))
        ) {
          // Variable value was changed or was converted from
          // a structure to a variable with value.
          variablesContainer.remove(variableName);
          variablesContainer.add(
            variableName,
            new gdjs.Variable(newVariableData)
          );
        } else if (
          !gdjs.Variable.isPrimitive(newVariableData.type || 'number')
        ) {
          // Variable is a structure or array (or was converted from a primitive
          // to one of those).
          if (newVariableData.type === 'structure')
            this._hotReloadStructureVariable(
              //@ts-ignore If the type is structure, it is assured that the children have a name
              oldVariableData.children,
              newVariableData.children,
              variable
            );
          else {
            // Arrays cannot be hot reloaded.
            // As indices can change at runtime, and in the IDE, they can be desynchronized.
            // It will in that case mess up the whole array,
            // and there is no way to know if that was the case.
            //
            // We therefore just replace the old array with the new one.
            variablesContainer.remove(variableName);
            variablesContainer.add(
              variableName,
              new gdjs.Variable(newVariableData)
            );
          }
        }
      });
      oldVariablesData.forEach((oldVariableData) => {
        const newVariableData = newVariablesData.find(
          (variable) => variable.name === oldVariableData.name
        );

        if (!newVariableData) {
          // Variable was removed
          variablesContainer.remove(oldVariableData.name);
        }
      });
    }

    _hotReloadStructureVariable(
      oldChildren: RootVariableData[],
      newChildren: RootVariableData[],
      variable: gdjs.Variable
    ): void {
      if (oldChildren) {
        oldChildren.forEach((oldChildVariableData) => {
          const newChildVariableData = newChildren.find(
            (childVariableData) =>
              childVariableData.name === oldChildVariableData.name
          );

          if (!newChildVariableData) {
            // Child variable was removed.
            variable.removeChild(oldChildVariableData.name);
          } else if (
            gdjs.Variable.isPrimitive(newChildVariableData.type || 'number') &&
            (oldChildVariableData.value !== newChildVariableData.value ||
              !gdjs.Variable.isPrimitive(oldChildVariableData.type || 'number'))
          ) {
            // The child variable value was changed or was converted from
            // structure to a variable with value.
            variable.addChild(
              newChildVariableData.name,
              new gdjs.Variable(newChildVariableData)
            );
          } else if (
            !gdjs.Variable.isPrimitive(newChildVariableData.type || 'number')
          ) {
            // Variable is a structure or array (or was converted from a primitive
            // to one of those).
            if (newChildVariableData.type === 'structure')
              this._hotReloadStructureVariable(
                //@ts-ignore If the type is structure, it is assured that the children have a name
                oldChildVariableData.children,
                newChildVariableData.children as Required<VariableData>[],
                variable.getChild(newChildVariableData.name)
              );
            else {
              // Arrays cannot be hot reloaded.
              // As indices can change at runtime, and in the IDE, they can be desynchronized.
              // It will in that case mess up the whole array,
              // and there is no way to know if that was the case.
              //
              // We therefore just replace the old array with the new one.
              variable.addChild(
                newChildVariableData.name,
                new gdjs.Variable(newChildVariableData)
              );
            }
          }
        });
        newChildren.forEach((newChildVariableData) => {
          const oldChildVariableData = oldChildren.find(
            (childVariableData) =>
              childVariableData.name === newChildVariableData.name
          );

          if (!oldChildVariableData) {
            // Child variable was added
            variable.addChild(
              newChildVariableData.name,
              new gdjs.Variable(newChildVariableData)
            );
          }
        });
      } else {
        // Variable was converted from a value to a structure:
        newChildren.forEach((newChildVariableData) => {
          variable.addChild(
            newChildVariableData.name,
            new gdjs.Variable(newChildVariableData)
          );
        });
      }
    }

    _hotReloadRuntimeScene(
      oldLayoutData: LayoutData,
      newLayoutData: LayoutData,
      changedRuntimeBehaviors: ChangedRuntimeBehavior[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      runtimeScene.setBackgroundColor(
        newLayoutData.r,
        newLayoutData.v,
        newLayoutData.b
      );
      if (oldLayoutData.title !== newLayoutData.title) {
        runtimeScene
          .getGame()
          .getRenderer()
          .setWindowTitle(newLayoutData.title);
      }
      this._hotReloadVariablesContainer(
        oldLayoutData.variables as Required<VariableData>[],
        newLayoutData.variables as Required<VariableData>[],
        runtimeScene.getVariables()
      );
      this._hotReloadRuntimeSceneBehaviorsSharedData(
        oldLayoutData.behaviorsSharedData,
        newLayoutData.behaviorsSharedData,
        runtimeScene
      );

      // Re-instantiate any gdjs.RuntimeBehavior that was changed.
      this._reinstantiateRuntimeSceneRuntimeBehaviors(
        changedRuntimeBehaviors,
        newLayoutData.objects,
        runtimeScene
      );
      this._hotReloadRuntimeSceneObjects(
        oldLayoutData.objects,
        newLayoutData.objects,
        runtimeScene
      );
      this._hotReloadRuntimeSceneInstances(
        oldLayoutData.instances,
        newLayoutData.instances,
        runtimeScene
      );
      this._hotReloadRuntimeSceneLayers(
        oldLayoutData.layers,
        newLayoutData.layers,
        runtimeScene
      );

      // Update the events generated code launched at each frame. Events generated code
      // script files were already reloaded at the beginning of the hot-reload. Note that
      // if they have not changed, it's still fine to call this, it will be basically a
      // no-op.
      runtimeScene.setEventsGeneratedCodeFunction(newLayoutData);
    }

    _hotReloadRuntimeSceneBehaviorsSharedData(
      oldBehaviorsSharedData: BehaviorSharedData[],
      newBehaviorsSharedData: BehaviorSharedData[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      oldBehaviorsSharedData.forEach((oldBehaviorSharedData) => {
        const name = oldBehaviorSharedData.name;
        const newBehaviorSharedData = newBehaviorsSharedData.filter(
          (behaviorSharedData) => behaviorSharedData.name === name
        )[0];
        if (!newBehaviorSharedData) {
          // Behavior shared data was removed.
          runtimeScene.setInitialSharedDataForBehavior(
            oldBehaviorSharedData.name,
            null
          );
        } else {
          if (
            !HotReloader.deepEqual(oldBehaviorSharedData, newBehaviorSharedData)
          ) {
            // Behavior shared data was modified
            runtimeScene.setInitialSharedDataForBehavior(
              newBehaviorSharedData.name,
              newBehaviorSharedData
            );
          }
        }
      });
      newBehaviorsSharedData.forEach((newBehaviorSharedData) => {
        const name = newBehaviorSharedData.name;
        const oldBehaviorSharedData = oldBehaviorsSharedData.filter(
          (behaviorSharedData) => behaviorSharedData.name === name
        )[0];
        if (!oldBehaviorSharedData) {
          // Behavior shared data was added
          runtimeScene.setInitialSharedDataForBehavior(
            newBehaviorSharedData.name,
            newBehaviorSharedData
          );
        }
      });
    }

    _reinstantiateRuntimeSceneRuntimeBehaviors(
      changedRuntimeBehaviors: ChangedRuntimeBehavior[],
      newObjects: ObjectData[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      newObjects.forEach((newObjectData) => {
        const objectName = newObjectData.name;
        const newBehaviors = newObjectData.behaviors;
        const runtimeObjects = runtimeScene.getObjects(objectName)!;
        changedRuntimeBehaviors.forEach((changedRuntimeBehavior) => {
          const behaviorTypeName = changedRuntimeBehavior.behaviorTypeName;

          // If the changed behavior is used by the object, re-instantiate
          // it.
          newBehaviors
            .filter((behaviorData) => behaviorData.type === behaviorTypeName)
            .forEach((changedBehaviorNewData) => {
              const name = changedBehaviorNewData.name;
              this._logs.push({
                kind: 'info',
                message:
                  'Re-instantiating behavior named "' +
                  name +
                  '" for instances of object "' +
                  objectName +
                  '".',
              });
              runtimeObjects.forEach((runtimeObject) => {
                this._reinstantiateRuntimeObjectRuntimeBehavior(
                  changedBehaviorNewData,
                  runtimeObject
                );
              });
            });
        });
      });
    }

    _reinstantiateRuntimeObjectRuntimeBehavior(
      behaviorData: BehaviorData,
      runtimeObject: gdjs.RuntimeObject
    ): void {
      const behaviorName = behaviorData.name;
      const oldRuntimeBehavior = runtimeObject.getBehavior(behaviorName);
      if (!oldRuntimeBehavior) {
        return;
      }

      // Remove and re-add the behavior so that it's using the newly
      // registered gdjs.RuntimeBehavior.
      runtimeObject.removeBehavior(behaviorName);
      runtimeObject.addNewBehavior(behaviorData);
      const newRuntimeBehavior = runtimeObject.getBehavior(behaviorName);
      if (!newRuntimeBehavior) {
        this._logs.push({
          kind: 'error',
          message:
            'Could not create behavior ' +
            behaviorName +
            ' (type: ' +
            behaviorData.type +
            ') for object ' +
            runtimeObject.getName(),
        });
        return;
      }

      // Copy the properties from the old behavior to the new one.
      for (let behaviorProperty in oldRuntimeBehavior) {
        if (!oldRuntimeBehavior.hasOwnProperty(behaviorProperty)) {
          continue;
        }
        if (behaviorProperty === '_behaviorData') {
          // For property "_behaviorData"  that we know to be an object,
          // do a copy of each property of
          // this object so that we keep the new ones (useful if a new property was added).
          newRuntimeBehavior[behaviorProperty] =
            newRuntimeBehavior[behaviorProperty] || {};
          for (let property in oldRuntimeBehavior[behaviorProperty]) {
            newRuntimeBehavior[behaviorProperty][property] =
              oldRuntimeBehavior[behaviorProperty][property];
          }
        } else {
          newRuntimeBehavior[behaviorProperty] =
            oldRuntimeBehavior[behaviorProperty];
        }
      }
      return;
    }

    _hotReloadRuntimeSceneObjects(
      oldObjects: ObjectData[],
      newObjects: ObjectData[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      oldObjects.forEach((oldObjectData) => {
        const name = oldObjectData.name;
        const newObjectData = newObjects.filter(
          (objectData) => objectData.name === name
        )[0];

        // Note: if an object is renamed in the editor, it will be considered as removed,
        // and the new object name as a new object to register.
        // It's not ideal because living instances of the object will be destroyed,
        // but it would be complex to iterate over instances of the object and change
        // its name (it's not expected to change).
        if (!newObjectData || oldObjectData.type !== newObjectData.type) {
          // Object was removed or object type was changed (considered as a removal of the old object)
          runtimeScene.unregisterObject(name);
        } else {
          if (runtimeScene.isObjectRegistered(name)) {
            this._hotReloadRuntimeSceneObject(
              oldObjectData,
              newObjectData,
              runtimeScene
            );
          }
        }
      });
      newObjects.forEach((newObjectData) => {
        const name = newObjectData.name;
        const oldObjectData = oldObjects.filter(
          (layerData) => layerData.name === name
        )[0];
        if (
          (!oldObjectData || oldObjectData.type !== newObjectData.type) &&
          !runtimeScene.isObjectRegistered(name)
        ) {
          // Object was added or object type was changed (considered as adding the new object)
          runtimeScene.registerObject(newObjectData);
        }
      });
    }

    _hotReloadRuntimeSceneObject(
      oldObjectData: ObjectData,
      newObjectData: ObjectData,
      runtimeScene: gdjs.RuntimeScene
    ): void {
      let hotReloadSucceeded = true;
      if (!HotReloader.deepEqual(oldObjectData, newObjectData)) {
        this._logs.push({
          kind: 'info',
          message:
            'Object "' +
            newObjectData.name +
            '" was modified and is hot-reloaded.',
        });

        // Register the updated object data, used for new instances.
        runtimeScene.updateObject(newObjectData);

        // Update existing instances
        const runtimeObjects = runtimeScene.getObjects(newObjectData.name)!;

        // Update instances state
        runtimeObjects.forEach((runtimeObject) => {
          // Update the runtime object
          hotReloadSucceeded =
            runtimeObject.updateFromObjectData(oldObjectData, newObjectData) &&
            hotReloadSucceeded;
        });

        // Don't update the variables, behaviors and effects for each runtime object to avoid
        // doing the check for differences for every single object.

        // Update variables
        runtimeObjects.forEach((runtimeObject) => {
          this._hotReloadVariablesContainer(
            oldObjectData.variables as Required<VariableData>[],
            newObjectData.variables as Required<VariableData>[],
            runtimeObject.getVariables()
          );
        });

        // Update behaviors
        this._hotReloadRuntimeObjectsBehaviors(
          oldObjectData.behaviors,
          newObjectData.behaviors,
          runtimeObjects
        );

        // Update effects
        this._hotReloadRuntimeObjectsEffects(
          oldObjectData.effects,
          newObjectData.effects,
          runtimeObjects
        );
      }
      if (!hotReloadSucceeded) {
        this._logs.push({
          kind: 'error',
          message:
            'Object "' +
            newObjectData.name +
            '" could not be hot-reloaded. A fresh preview should be run.',
        });
      }
    }

    _hotReloadRuntimeObjectsBehaviors(
      oldBehaviors: BehaviorData[],
      newBehaviors: BehaviorData[],
      runtimeObjects: gdjs.RuntimeObject[]
    ): void {
      oldBehaviors.forEach((oldBehaviorData) => {
        const name = oldBehaviorData.name;
        const newBehaviorData = newBehaviors.filter(
          (behaviorData) => behaviorData.name === name
        )[0];
        if (!newBehaviorData) {
          // Behavior was removed
          runtimeObjects.forEach((runtimeObject) => {
            if (runtimeObject.hasBehavior(name)) {
              if (!runtimeObject.removeBehavior(name)) {
                this._logs.push({
                  kind: 'error',
                  message:
                    'Behavior ' +
                    name +
                    ' could not be removed from object' +
                    runtimeObject.getName(),
                });
              }
            }
          });
        } else {
          if (!HotReloader.deepEqual(oldBehaviorData, newBehaviorData)) {
            let hotReloadSucceeded = true;
            runtimeObjects.forEach((runtimeObject) => {
              const runtimeBehavior = runtimeObject.getBehavior(
                newBehaviorData.name
              );
              if (runtimeBehavior) {
                hotReloadSucceeded =
                  this._hotReloadRuntimeBehavior(
                    oldBehaviorData,
                    newBehaviorData,
                    runtimeBehavior
                  ) && hotReloadSucceeded;
              }
            });
            if (!hotReloadSucceeded) {
              this._logs.push({
                kind: 'error',
                message:
                  newBehaviorData.name + ' behavior could not be hot-reloaded.',
              });
            }
          }
        }
      });
      newBehaviors.forEach((newBehaviorData) => {
        const name = newBehaviorData.name;
        const oldBehaviorData = oldBehaviors.filter(
          (layerData) => layerData.name === name
        )[0];
        if (!oldBehaviorData) {
          // Behavior was added
          let hotReloadSucceeded = true;
          runtimeObjects.forEach((runtimeObject) => {
            hotReloadSucceeded =
              runtimeObject.addNewBehavior(newBehaviorData) &&
              hotReloadSucceeded;
          });
          if (!hotReloadSucceeded) {
            this._logs.push({
              kind: 'error',
              message:
                newBehaviorData.name +
                ' behavior could not be added during hot-reload.',
            });
          }
        }
      });
    }

    _hotReloadRuntimeObjectsEffects(
      oldEffects: EffectData[],
      newEffects: EffectData[],
      runtimeObjects: RuntimeObject[]
    ): void {
      oldEffects.forEach((oldEffectData) => {
        const name = oldEffectData.name;
        const newEffectData = newEffects.filter(
          (effectData) => effectData.name === name
        )[0];
        if (!newEffectData) {
          // Effect was removed.
          runtimeObjects.forEach((runtimeObject) => {
            if (runtimeObject.hasEffect(name)) {
              if (!runtimeObject.removeEffect(name)) {
                this._logs.push({
                  kind: 'error',
                  message:
                    'Effect ' +
                    name +
                    ' could not be removed from object' +
                    runtimeObject.getName(),
                });
              }
            }
          });
        } else {
          if (!HotReloader.deepEqual(oldEffectData, newEffectData)) {
            let hotReloadSucceeded = true;
            runtimeObjects.forEach((runtimeObject) => {
              if (oldEffectData.effectType === newEffectData.effectType) {
                hotReloadSucceeded =
                  runtimeObject.updateAllEffectParameters(newEffectData) &&
                  hotReloadSucceeded;
              } else {
                // Another effect type was applied
                runtimeObject.removeEffect(oldEffectData.name);
                runtimeObject.addEffect(newEffectData);
              }
            });
            if (!hotReloadSucceeded) {
              this._logs.push({
                kind: 'error',
                message:
                  newEffectData.name + ' effect could not be hot-reloaded.',
              });
            }
          }
        }
      });
      newEffects.forEach((newEffectData) => {
        const name = newEffectData.name;
        const oldEffectData = oldEffects.filter(
          (oldEffectData) => oldEffectData.name === name
        )[0];
        if (!oldEffectData) {
          // Effect was added
          let hotReloadSucceeded = true;
          runtimeObjects.forEach((runtimeObject) => {
            hotReloadSucceeded =
              runtimeObject.addEffect(newEffectData) && hotReloadSucceeded;
          });
          if (!hotReloadSucceeded) {
            this._logs.push({
              kind: 'error',
              message:
                newEffectData.name +
                ' effect could not be added during hot-reload.',
            });
          }
        }
      });
    }

    /**
     * @returns true if hot-reload succeeded, false otherwise.
     */
    _hotReloadRuntimeBehavior(
      oldBehaviorData: BehaviorData,
      newBehaviorData: BehaviorData,
      runtimeBehavior: gdjs.RuntimeBehavior
    ): boolean {
      // Don't check here for deep equality between oldBehaviorData and newBehaviorData.
      // This would be too costly to do for each runtime object.
      // It's supposed to be done once by the caller.
      return runtimeBehavior.updateFromBehaviorData(
        oldBehaviorData,
        newBehaviorData
      );
    }

    _hotReloadRuntimeSceneLayers(
      oldLayers: LayerData[],
      newLayers: LayerData[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      oldLayers.forEach((oldLayerData) => {
        const name = oldLayerData.name;
        const newLayerData = newLayers.filter(
          (layerData) => layerData.name === name
        )[0];
        if (!newLayerData) {
          // Layer was removed
          runtimeScene.removeLayer(name);
        } else {
          if (runtimeScene.hasLayer(name)) {
            const layer = runtimeScene.getLayer(name);
            this._hotReloadRuntimeLayer(oldLayerData, newLayerData, layer);
          }
        }
      });
      newLayers.forEach((newLayerData) => {
        const name = newLayerData.name;
        const oldLayerData = oldLayers.filter(
          (layerData) => layerData.name === name
        )[0];
        if (!oldLayerData && !runtimeScene.hasLayer(name)) {
          // Layer was added
          runtimeScene.addLayer(newLayerData);
        }
      });
      newLayers.forEach((newLayerData, index) => {
        runtimeScene.setLayerIndex(newLayerData.name, index);
      });
    }

    _hotReloadRuntimeLayer(
      oldLayer: LayerData,
      newLayer: LayerData,
      runtimeLayer: gdjs.RuntimeLayer
    ): void {
      // Properties
      if (oldLayer.visibility !== newLayer.visibility) {
        runtimeLayer.show(newLayer.visibility);
      }
      if (newLayer.isLightingLayer) {
        if (
          oldLayer.ambientLightColorR !== newLayer.ambientLightColorR ||
          oldLayer.ambientLightColorG !== newLayer.ambientLightColorG ||
          oldLayer.ambientLightColorB !== newLayer.ambientLightColorB
        ) {
          runtimeLayer.setClearColor(
            newLayer.ambientLightColorR,
            newLayer.ambientLightColorG,
            newLayer.ambientLightColorB
          );
        }
        if (oldLayer.followBaseLayerCamera !== newLayer.followBaseLayerCamera) {
          runtimeLayer.setFollowBaseLayerCamera(newLayer.followBaseLayerCamera);
        }
      }

      // Rendering type can't be easily changed at runtime.
      if (oldLayer.renderingType !== newLayer.renderingType) {
        this._logs.push({
          kind: 'error',
          message: `Could not change the rendering type (2D, 3D...) layer at runtime (for layer "${newLayer.name}").`,
        });
      }
      if (newLayer.isLightingLayer !== oldLayer.isLightingLayer) {
        this._logs.push({
          kind: 'error',
          message: `Could not add/remove a lighting layer at runtime (for layer "${newLayer.name}").`,
        });
      }

      // Effects
      this._hotReloadRuntimeLayerEffects(
        oldLayer.effects,
        newLayer.effects,
        runtimeLayer
      );
    }

    _hotReloadRuntimeLayerEffects(
      oldEffectsData: EffectData[],
      newEffectsData: EffectData[],
      runtimeLayer: gdjs.RuntimeLayer
    ): void {
      oldEffectsData.forEach((oldEffectData) => {
        const name = oldEffectData.name;
        const newEffectData = newEffectsData.filter(
          (effectData) => effectData.name === name
        )[0];
        if (!newEffectData) {
          // Effect was removed
          runtimeLayer.removeEffect(name);
        } else {
          if (runtimeLayer.hasEffect(name)) {
            if (oldEffectData.effectType !== newEffectData.effectType) {
              // Effect changed type, consider it was removed and added back.
              runtimeLayer.removeEffect(name);
              runtimeLayer.addEffect(newEffectData);
            } else {
              this._hotReloadRuntimeLayerEffect(
                oldEffectData,
                newEffectData,
                runtimeLayer,
                name
              );
            }
          }
        }
      });
      newEffectsData.forEach((newEffectData) => {
        const name = newEffectData.name;
        const oldEffectData = oldEffectsData.filter(
          (layerData) => layerData.name === name
        )[0];
        if (!oldEffectData && !runtimeLayer.hasEffect(name)) {
          // Effect was added
          runtimeLayer.addEffect(newEffectData);
        }
      });
    }

    _hotReloadRuntimeLayerEffect(
      oldEffectData: EffectData,
      newEffectData: EffectData,
      runtimeLayer: gdjs.RuntimeLayer,
      effectName: string
    ): void {
      // We consider oldEffectData.effectType and newEffectData.effectType
      // are the same - it's responsibility of the caller to verify this.
      for (let parameterName in newEffectData.booleanParameters) {
        const value = newEffectData.booleanParameters[parameterName];
        if (value !== oldEffectData.booleanParameters[parameterName]) {
          runtimeLayer.setEffectBooleanParameter(
            effectName,
            parameterName,
            value
          );
        }
      }
      for (let parameterName in newEffectData.doubleParameters) {
        const value = newEffectData.doubleParameters[parameterName];
        if (value !== oldEffectData.doubleParameters[parameterName]) {
          runtimeLayer.setEffectDoubleParameter(
            effectName,
            parameterName,
            value
          );
        }
      }
      for (let parameterName in newEffectData.stringParameters) {
        const value = newEffectData.stringParameters[parameterName];
        if (value !== oldEffectData.stringParameters[parameterName]) {
          runtimeLayer.setEffectStringParameter(
            effectName,
            parameterName,
            value
          );
        }
      }
    }

    _hotReloadRuntimeSceneInstances(
      oldInstances: InstanceData[],
      newInstances: InstanceData[],
      runtimeScene: gdjs.RuntimeScene
    ): void {
      const runtimeObjects = runtimeScene.getAdhocListOfAllInstances();
      const groupedOldInstances: {
        [key: number]: InstanceData;
      } = HotReloader.groupByPersistentUuid(oldInstances);
      const groupedNewInstances: {
        [key: number]: InstanceData;
      } = HotReloader.groupByPersistentUuid(newInstances);
      const groupedRuntimeObjects: {
        [key: number]: gdjs.RuntimeObject;
      } = HotReloader.groupByPersistentUuid(runtimeObjects);
      for (let persistentUuid in groupedOldInstances) {
        const oldInstance = groupedOldInstances[persistentUuid];
        const newInstance = groupedNewInstances[persistentUuid];
        const runtimeObject = groupedRuntimeObjects[persistentUuid];
        if (
          oldInstance &&
          (!newInstance || oldInstance.name !== newInstance.name)
        ) {
          // Instance was deleted (or object name changed, in which case it will be re-created later)
          if (runtimeObject) {
            runtimeObject.deleteFromScene(runtimeScene);
          }
        } else {
          if (oldInstance && newInstance && runtimeObject) {
            // Instance was not deleted nor created, maybe modified (or not):
            this._hotReloadRuntimeInstance(
              oldInstance,
              newInstance,
              runtimeObject
            );
          }
        }
      }
      for (let persistentUuid in groupedNewInstances) {
        const oldInstance = groupedOldInstances[persistentUuid];
        const newInstance = groupedNewInstances[persistentUuid];
        const runtimeObject = groupedRuntimeObjects[persistentUuid];
        if (
          newInstance &&
          (!oldInstance || oldInstance.name !== newInstance.name) &&
          !runtimeObject
        ) {
          // Instance was created (or object name changed, in which case it was destroyed previously)
          // and we verified that runtimeObject does not exist.
          runtimeScene.createObjectsFrom(
            [newInstance],
            0,
            0,
            0,
            /*trackByPersistentUuid=*/
            true
          );
        }
      }
    }

    _hotReloadRuntimeInstance(
      oldInstance: InstanceData,
      newInstance: InstanceData,
      runtimeObject: gdjs.RuntimeObject
    ): void {
      let somethingChanged = false;

      // Check if default properties changed
      if (oldInstance.x !== newInstance.x) {
        runtimeObject.setX(newInstance.x);
        somethingChanged = true;
      }
      if (oldInstance.y !== newInstance.y) {
        runtimeObject.setY(newInstance.y);
        somethingChanged = true;
      }
      if (oldInstance.angle !== newInstance.angle) {
        runtimeObject.setAngle(newInstance.angle);
        somethingChanged = true;
      }
      if (oldInstance.zOrder !== newInstance.zOrder) {
        runtimeObject.setZOrder(newInstance.zOrder);
        somethingChanged = true;
      }
      if (oldInstance.layer !== newInstance.layer) {
        runtimeObject.setLayer(newInstance.layer);
        somethingChanged = true;
      }
      if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(runtimeObject)) {
        if (oldInstance.z !== newInstance.z && newInstance.z !== undefined) {
          runtimeObject.setZ(newInstance.z);
          somethingChanged = true;
        }
        if (
          oldInstance.rotationX !== newInstance.rotationX &&
          newInstance.rotationX !== undefined
        ) {
          runtimeObject.setRotationX(newInstance.rotationX);
          somethingChanged = true;
        }
        if (
          oldInstance.rotationY !== newInstance.rotationY &&
          newInstance.rotationY !== undefined
        ) {
          runtimeObject.setRotationY(newInstance.rotationY);
          somethingChanged = true;
        }
      }

      // Check if size changed
      let sizeChanged = false;
      if (newInstance.customSize) {
        if (!oldInstance.customSize) {
          // A custom size was set
          runtimeObject.setWidth(newInstance.width);
          runtimeObject.setHeight(newInstance.height);
          somethingChanged = true;
          sizeChanged = true;
        } else {
          // The custom size was changed
          if (oldInstance.width !== newInstance.width) {
            runtimeObject.setWidth(newInstance.width);
            somethingChanged = true;
            sizeChanged = true;
          }
          if (oldInstance.height !== newInstance.height) {
            runtimeObject.setHeight(newInstance.height);
            somethingChanged = true;
            sizeChanged = true;
          }
        }
      } else {
        if (!newInstance.customSize && oldInstance.customSize) {
          // The custom size was removed. Just flag the size as changed
          // and hope the object will handle this in
          // `extraInitializationFromInitialInstance`.
          sizeChanged = true;
        }
      }
      if (gdjs.Base3DHandler && gdjs.Base3DHandler.is3D(runtimeObject)) {
        // A custom depth was set or changed
        if (
          oldInstance.depth !== newInstance.depth &&
          newInstance.depth !== undefined
        ) {
          runtimeObject.setDepth(newInstance.depth);
          somethingChanged = true;
          sizeChanged = true;
        } else if (
          newInstance.depth === undefined &&
          oldInstance.depth !== undefined
        ) {
          // The custom depth was removed. Just flag the depth as changed
          // and hope the object will handle this in
          // `extraInitializationFromInitialInstance`.
          sizeChanged = true;
        }
      }

      // Update variables
      this._hotReloadVariablesContainer(
        oldInstance.initialVariables as Required<VariableData>[],
        newInstance.initialVariables as Required<VariableData>[],
        runtimeObject.getVariables()
      );

      // Check if custom properties changed (specific to each object type)
      const numberPropertiesChanged = newInstance.numberProperties.some(
        (numberProperty) => {
          const name = numberProperty.name;
          const value = numberProperty.value;
          const oldNumberProperty = oldInstance.numberProperties.filter(
            (numberProperty) => numberProperty.name === name
          )[0];
          return !oldNumberProperty || oldNumberProperty.value !== value;
        }
      );
      const stringPropertiesChanged = newInstance.stringProperties.some(
        (stringProperty) => {
          const name = stringProperty.name;
          const value = stringProperty.value;
          const oldStringProperty = oldInstance.stringProperties.filter(
            (stringProperty) => stringProperty.name === name
          )[0];
          return !oldStringProperty || oldStringProperty.value !== value;
        }
      );
      if (numberPropertiesChanged || stringPropertiesChanged || sizeChanged) {
        runtimeObject.extraInitializationFromInitialInstance(newInstance);
        somethingChanged = true;
      }
      if (somethingChanged) {
        // If we changed the runtime object position/size/angle or another property,
        // notify behaviors that the runtime object was reloaded.
        // This is useful for behaviors like the physics engine that are watching the
        // object position/size and need to be notified when changed (otherwise, they
        // would continue using the previous position, so the object would not be moved
        // or updated according to the changes made in the project instance).
        runtimeObject.notifyBehaviorsObjectHotReloaded();
      }
    }

    /**
     * Deep check equality between the two objects/arrays/primitives.
     *
     * Inspired from https://github.com/epoberezkin/fast-deep-equal
     * @param a The first object/array/primitive to compare
     * @param b The second object/array/primitive to compare
     */
    static deepEqual(a: any, b: any): boolean {
      if (a === b) {
        return true;
      }
      if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) {
          return false;
        }
        let length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) {
            return false;
          }
          for (i = length; i-- !== 0; ) {
            if (!HotReloader.deepEqual(a[i], b[i])) {
              return false;
            }
          }
          return true;
        }
        if (a.valueOf !== Object.prototype.valueOf) {
          return a.valueOf() === b.valueOf();
        }
        if (a.toString !== Object.prototype.toString) {
          return a.toString() === b.toString();
        }
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) {
          return false;
        }
        for (i = length; i-- !== 0; ) {
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
            return false;
          }
        }
        for (i = length; i-- !== 0; ) {
          const key = keys[i];
          if (!HotReloader.deepEqual(a[key], b[key])) {
            return false;
          }
        }
        return true;
      }

      // true if both NaN, false otherwise
      return a !== a && b !== b;
    }
  }
}

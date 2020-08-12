// @ts-check

/**
 * @typedef {Object} HotReloaderLog
 * @property {'fatal' | 'error' | 'warning' | 'info'} kind
 * @property {string} message
 */

/**
 * Reload scripts/data of an exported game and applies the changes
 * to the running runtime game.
 *
 * @memberof gdjs
 * @class HotReloader
 * @param {gdjs.RuntimeGame} runtimeGame - The `gdjs.RuntimeGame` to be hot-reloaded.
 */
gdjs.HotReloader = function (runtimeGame) {
  this._runtimeGame = runtimeGame;
  /** @type {Object.<string, HTMLScriptElement>} */
  this._reloadedScriptElement = {};

  /** @type {HotReloaderLog[]} */
  this._logs = [];

  /** @type {Object.<string, boolean>} */
  this._alreadyLoadedScriptFiles = {};
};

/**
 * @template {{ persistentUuid: ?string }} ObjectWithPersistentId
 * @param {ObjectWithPersistentId[]} objectsWithPersistentId
 * @returns {Object.<string, any>}
 * // (returning any because https://github.com/microsoft/TypeScript/issues/26883)
 */
gdjs.HotReloader.groupByPersistentUuid = function (objectsWithPersistentId) {
  return objectsWithPersistentId.reduce(function (objectsMap, object) {
    if (object.persistentUuid) objectsMap[object.persistentUuid] = object;
    return objectsMap;
  }, {});
};

/**
 * @param {string} srcFilename
 * @returns {boolean}
 */
gdjs.HotReloader.prototype._canReloadScriptFile = function (srcFilename) {
  function endsWith(str, suffix) {
    var suffixPosition = str.indexOf(suffix);
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
      // Don't reload shifty.js library.
      endsWith(srcFilename, 'shifty.js') ||
      // Don't reload shopify-buy library.
      endsWith(srcFilename, 'shopify-buy.umd.polyfilled.min.js') ||
      // Don't reload pixi-multistyle-text library.
      endsWith(srcFilename, 'pixi-multistyle-text.umd.js') ||
      // Don't reload bondage.js library.
      endsWith(srcFilename, 'bondage.min.js') ||
      // Don't reload pixi-particles library.
      endsWith(srcFilename, 'pixi-particles-pixi-renderer.min.js')
    ) {
      return false;
    }
  }

  return true;
};

/**
 * @param {string} srcFilename
 * @returns {Promise<void>}
 */
gdjs.HotReloader.prototype._reloadScript = function (srcFilename) {
  function endsWith(str, suffix) {
    var suffixPosition = str.indexOf(suffix);
    return (
      suffixPosition !== -1 && suffixPosition === str.length - suffix.length
    );
  }

  if (!this._canReloadScriptFile(srcFilename)) {
    this._logs.push({
      kind: 'info',
      message:
        'Not reloading ' + srcFilename + ' as it is blocked for hot-reloading.',
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
    if (existingScriptElement) head.removeChild(existingScriptElement);
    else {
      // Check if there is an existing scriptElement in head
      const headScriptElements = head.getElementsByTagName('script');
      for (var i = 0; i < headScriptElements.length; ++i) {
        var scriptElement = headScriptElements[i];
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
};

gdjs.HotReloader.prototype.hotReload = function () {
  console.info('Hot reload started');
  this._runtimeGame.pause(true);
  this._logs = [];

  // Save old data of the project, to be used to compute
  // the difference between the old and new project data:

  /** @type {ProjectData} */
  // @ts-ignore
  const oldProjectData = gdjs.projectData;

  /** @type {RuntimeGameOptionsScriptFile[]} */
  // @ts-ignore
  const oldScriptFiles = gdjs.runtimeGameOptions.scriptFiles;

  oldScriptFiles.forEach((scriptFile) => {
    this._alreadyLoadedScriptFiles[scriptFile.path] = true;
  });

  /** @type {Object.<string, Function>} */
  const oldBehaviorConstructors = {};

  // @ts-ignore - TODO: type gdjs.behaviorsType
  for (let behaviorTypeName in gdjs.behaviorsTypes.items) {
    oldBehaviorConstructors[behaviorTypeName] =
      // @ts-ignore - TODO: type gdjs.behaviorsType
      gdjs.behaviorsTypes.items[behaviorTypeName];
  }

  // Reload projectData and runtimeGameOptions stored by convention in data.js:
  return this._reloadScript('data.js').then(() => {
    /** @type {ProjectData} */
    // @ts-ignore
    const newProjectData = gdjs.projectData;

    /** @type {RuntimeGameOptions} */
    // @ts-ignore
    const newRuntimeGameOptions = gdjs.runtimeGameOptions;

    /** @type {RuntimeGameOptionsScriptFile[]} */
    // @ts-ignore
    const newScriptFiles = newRuntimeGameOptions.scriptFiles;
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
          // @ts-ignore - TODO: type gdjs.behaviorsType
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
              'Unexpected error happened while hot-reloading:' + error.message,
          });
        }
      })
      .then(() => {
        console.info('Hot reload finished with logs:', this._logs);
        this._runtimeGame.pause(false);
        return this._logs;
      });
  });
};

/**
 * @typedef {{oldBehaviorConstructor: Function, newBehaviorConstructor: Function, behaviorTypeName: string }} ChangedRuntimeBehavior
 */

/**
 * @param {Object.<string, Function>} oldBehaviorConstructors
 * @param {Object.<string, Function>} newBehaviorConstructors
 * @returns {ChangedRuntimeBehavior[]}
 */
gdjs.HotReloader.prototype._computeChangedRuntimeBehaviors = function (
  oldBehaviorConstructors,
  newBehaviorConstructors
) {
  /** @type {ChangedRuntimeBehavior[]} */
  const changedRuntimeBehaviors = [];
  for (let behaviorTypeName in oldBehaviorConstructors) {
    const oldBehaviorConstructor = oldBehaviorConstructors[behaviorTypeName];
    const newBehaviorConstructor = newBehaviorConstructors[behaviorTypeName];

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
};

/**
 * @param {ProjectData} newProjectData
 * @param {RuntimeGameOptionsScriptFile[]} oldScriptFiles
 * @param {RuntimeGameOptionsScriptFile[]} newScriptFiles
 * @param {boolean} projectDataOnlyExport
 */
gdjs.HotReloader.prototype.reloadScriptFiles = function (
  newProjectData,
  oldScriptFiles,
  newScriptFiles,
  projectDataOnlyExport
) {
  const reloadPromises = [];

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
};

/**
 * @param {ProjectData} oldProjectData
 * @param {ProjectData} newProjectData
 * @param {ChangedRuntimeBehavior[]} changedRuntimeBehaviors
 * @param {gdjs.RuntimeGame} runtimeGame
 */
gdjs.HotReloader.prototype._hotReloadRuntimeGame = function (
  oldProjectData,
  newProjectData,
  changedRuntimeBehaviors,
  runtimeGame
) {
  return new Promise((resolve) => {
    // Update project data and re-load assets (sound/image/font/json managers
    // will take care of reloading only what is needed).
    runtimeGame.setProjectData(newProjectData);
    runtimeGame.loadAllAssets(() => {
      this._hotReloadVariablesContainer(
        oldProjectData.variables,
        newProjectData.variables,
        runtimeGame.getVariables()
      );

      // Reload runtime scenes
      var sceneStack = runtimeGame.getSceneStack();
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
          !gdjs.HotReloader.deepEqual(
            oldExternalLayoutData,
            newExternalLayoutData
          )
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

      resolve();
    });
  });
};

/**
 * @param {VariableData[]} oldVariablesData
 * @param {VariableData[]} newVariablesData
 * @param {gdjs.VariablesContainer} variablesContainer
 */
gdjs.HotReloader.prototype._hotReloadVariablesContainer = function (
  oldVariablesData,
  newVariablesData,
  variablesContainer
) {
  newVariablesData.forEach((newVariableData) => {
    const variableName = newVariableData.name;
    const oldVariableData = oldVariablesData.filter(
      (variable) => variable.name === newVariableData.name
    )[0];
    const variable = variablesContainer.get(newVariableData.name);

    if (!oldVariableData) {
      // New variable
      variablesContainer.add(variableName, new gdjs.Variable(newVariableData));
    } else if (
      !newVariableData.children &&
      (oldVariableData.value !== newVariableData.value ||
        oldVariableData.children)
    ) {
      // Variable value was changed or was converted from
      // a structure to a variable with value.
      variablesContainer.remove(variableName);
      variablesContainer.add(variableName, new gdjs.Variable(newVariableData));
    } else if (newVariableData.children) {
      // Variable is a structure (or was converted from a non structure
      // to a structure).
      // Note: oldVariableData.children can be null!
      this._hotReloadStructureVariable(
        oldVariableData.children,
        newVariableData.children,
        variable
      );
    }
  });
  oldVariablesData.forEach((oldVariableData) => {
    const newVariableData = newVariablesData.filter(
      (variable) => variable.name === oldVariableData.name
    )[0];

    if (!newVariableData) {
      // Variable was removed
      variablesContainer.remove(oldVariableData.name);
    }
  });
};

/**
 * @param {VariableData[]?} oldChildren
 * @param {VariableData[]} newChildren
 * @param {gdjs.Variable} variable
 */
gdjs.HotReloader.prototype._hotReloadStructureVariable = function (
  oldChildren,
  newChildren,
  variable
) {
  if (oldChildren) {
    oldChildren.forEach((oldChildVariableData) => {
      const newChildVariableData = newChildren.filter(
        (childVariableData) =>
          childVariableData.name === oldChildVariableData.name
      )[0];

      if (!newChildVariableData) {
        // Child variable was removed.
        variable.removeChild(oldChildVariableData.name);
      } else if (
        !newChildVariableData.children &&
        (oldChildVariableData.value !== newChildVariableData.value ||
          !oldChildVariableData.children)
      ) {
        // The child variable value was changed or was converted from
        // structure to a variable with value.
        variable.addChild(
          newChildVariableData.name,
          new gdjs.Variable(newChildVariableData)
        );
      } else if (newChildVariableData.children) {
        // The child variable is a structure.
        this._hotReloadStructureVariable(
          oldChildVariableData.children,
          newChildVariableData.children,
          variable.getChild(newChildVariableData.name)
        );
      }
    });
    newChildren.forEach((newChildVariableData) => {
      const oldChildVariableData = oldChildren.filter(
        (childVariableData) =>
          childVariableData.name === newChildVariableData.name
      )[0];

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
};

/**
 * @param {LayoutData} oldLayoutData
 * @param {LayoutData} newLayoutData
 * @param {ChangedRuntimeBehavior[]} changedRuntimeBehaviors
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeScene = function (
  oldLayoutData,
  newLayoutData,
  changedRuntimeBehaviors,
  runtimeScene
) {
  runtimeScene.setBackgroundColor(
    newLayoutData.r,
    newLayoutData.v,
    newLayoutData.b
  );
  if (oldLayoutData.title !== newLayoutData.title) {
    runtimeScene.getGame().getRenderer().setWindowTitle(newLayoutData.title);
  }

  this._hotReloadVariablesContainer(
    oldLayoutData.variables,
    newLayoutData.variables,
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
};

/**
 * @param {BehaviorSharedData[]} oldBehaviorsSharedData
 * @param {BehaviorSharedData[]} newBehaviorsSharedData
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeSceneBehaviorsSharedData = function (
  oldBehaviorsSharedData,
  newBehaviorsSharedData,
  runtimeScene
) {
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
    } else if (
      !gdjs.HotReloader.deepEqual(oldBehaviorSharedData, newBehaviorSharedData)
    ) {
      // Behavior shared data was modified
      runtimeScene.setInitialSharedDataForBehavior(
        newBehaviorSharedData.name,
        newBehaviorSharedData
      );
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
};

/**
 * @param {ChangedRuntimeBehavior[]} changedRuntimeBehaviors
 * @param {ObjectData[]} newObjects
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._reinstantiateRuntimeSceneRuntimeBehaviors = function (
  changedRuntimeBehaviors,
  newObjects,
  runtimeScene
) {
  newObjects.forEach((newObjectData) => {
    const objectName = newObjectData.name;
    const newBehaviors = newObjectData.behaviors;
    const runtimeObjects = runtimeScene.getObjects(objectName);

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
};

/**
 * @param {BehaviorData} behaviorData
 * @param {gdjs.RuntimeObject} runtimeObject
 */
gdjs.HotReloader.prototype._reinstantiateRuntimeObjectRuntimeBehavior = function (
  behaviorData,
  runtimeObject
) {
  const behaviorName = behaviorData.name;
  const oldRuntimeBehavior = runtimeObject.getBehavior(behaviorName);
  if (!oldRuntimeBehavior) return;

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
    if (!oldRuntimeBehavior.hasOwnProperty(behaviorProperty)) continue;

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
};

/**
 * @param {ObjectData[]} oldObjects
 * @param {ObjectData[]} newObjects
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeSceneObjects = function (
  oldObjects,
  newObjects,
  runtimeScene
) {
  oldObjects.forEach((oldObjectData) => {
    const name = oldObjectData.name;
    const newObjectData = newObjects.filter(
      (objectData) => objectData.name === name
    )[0];

    if (!newObjectData || oldObjectData.type !== newObjectData.type) {
      // Object was removed or object type was changed (considered as a removal of the old object)
      runtimeScene.unregisterObject(name);
      // Note: if an object is renamed in the editor, it will be considered as removed,
      // and the new object name as a new object to register.
      // It's not ideal because living instances of the object will be destroyed,
      // but it would be complex to iterate over instances of the object and change
      // its name (it's not expected to change).
    } else if (runtimeScene.isObjectRegistered(name)) {
      this._hotReloadRuntimeSceneObject(
        oldObjectData,
        newObjectData,
        runtimeScene
      );
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
};

/**
 * @param {ObjectData} oldObjectData
 * @param {ObjectData} newObjectData
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeSceneObject = function (
  oldObjectData,
  newObjectData,
  runtimeScene
) {
  let hotReloadSucceeded = true;
  if (!gdjs.HotReloader.deepEqual(oldObjectData, newObjectData)) {
    this._logs.push({
      kind: 'info',
      message:
        'Object "' + newObjectData.name + '" was modified and is hot-reloaded.',
    });

    // Register the updated object data, used for new instances.
    runtimeScene.updateObject(newObjectData);

    // Update existing instances
    const runtimeObjects = runtimeScene.getObjects(newObjectData.name);

    // Update instances state
    runtimeObjects.forEach((runtimeObject) => {
      // Update the runtime object
      hotReloadSucceeded =
        runtimeObject.updateFromObjectData(oldObjectData, newObjectData) &&
        hotReloadSucceeded;

      // Don't update the variables and behaviors for each runtime object to avoid
      // doing the check for differences for every single object.
    });

    // Update variables
    runtimeObjects.forEach((runtimeObject) => {
      this._hotReloadVariablesContainer(
        oldObjectData.variables,
        newObjectData.variables,
        runtimeObject.getVariables()
      );
    });

    // Update behaviors
    this._hotReloadRuntimeObjectsBehaviors(
      oldObjectData.behaviors,
      newObjectData.behaviors,
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
};

/**
 * @param {BehaviorData[]} oldBehaviors
 * @param {BehaviorData[]} newBehaviors
 * @param {gdjs.RuntimeObject[]} runtimeObjects
 */
gdjs.HotReloader.prototype._hotReloadRuntimeObjectsBehaviors = function (
  oldBehaviors,
  newBehaviors,
  runtimeObjects
) {
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
    } else if (!gdjs.HotReloader.deepEqual(oldBehaviorData, newBehaviorData)) {
      let hotReloadSucceeded = true;
      runtimeObjects.forEach((runtimeObject) => {
        const runtimeBehavior = runtimeObject.getBehavior(newBehaviorData.name);
        if (runtimeBehavior)
          hotReloadSucceeded =
            this._hotReloadRuntimeBehavior(
              oldBehaviorData,
              newBehaviorData,
              runtimeBehavior
            ) && hotReloadSucceeded;
      });
      if (!hotReloadSucceeded) {
        this._logs.push({
          kind: 'error',
          message:
            newBehaviorData.name + ' behavior could not be hot-reloaded.',
        });
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
          runtimeObject.addNewBehavior(newBehaviorData) && hotReloadSucceeded;
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
};

/**
 * @param {BehaviorData} oldBehaviorData
 * @param {BehaviorData} newBehaviorData
 * @param {gdjs.RuntimeBehavior} runtimeBehavior
 * @returns {boolean} true if hot-reload succeeded, false otherwise.
 */
gdjs.HotReloader.prototype._hotReloadRuntimeBehavior = function (
  oldBehaviorData,
  newBehaviorData,
  runtimeBehavior
) {
  // Don't check here for deep equality between oldBehaviorData and newBehaviorData.
  // This would be too costly to do for each runtime object.
  // It's supposed to be done once by the caller.

  return runtimeBehavior.updateFromBehaviorData(
    oldBehaviorData,
    newBehaviorData
  );
};

/**
 * @param {LayerData[]} oldLayers
 * @param {LayerData[]} newLayers
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeSceneLayers = function (
  oldLayers,
  newLayers,
  runtimeScene
) {
  oldLayers.forEach((oldLayerData) => {
    const name = oldLayerData.name;
    const newLayerData = newLayers.filter(
      (layerData) => layerData.name === name
    )[0];

    if (!newLayerData) {
      // Layer was removed
      runtimeScene.removeLayer(name);
    } else if (runtimeScene.hasLayer(name)) {
      const layer = runtimeScene.getLayer(name);
      this._hotReloadRuntimeLayer(oldLayerData, newLayerData, layer);
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
  })
};

/**
 * @param {LayerData} oldLayer
 * @param {LayerData} newLayer
 * @param {gdjs.Layer} runtimeLayer
 */
gdjs.HotReloader.prototype._hotReloadRuntimeLayer = function (
  oldLayer,
  newLayer,
  runtimeLayer
) {
  // Properties
  if (oldLayer.visibility !== newLayer.visibility) {
    runtimeLayer.show(newLayer.visibility);
  }

  if(newLayer.isLightingLayer) {
    if (oldLayer.ambientLightColorR !== newLayer.ambientLightColorR) {
      runtimeLayer.setClearColor(newLayer.ambientLightColorR, null, null);
    }
  
    if (oldLayer.ambientLightColorG !== newLayer.ambientLightColorG) {
      runtimeLayer.setClearColor(null, newLayer.ambientLightColorG, null);
    }
  
    if (oldLayer.ambientLightColorB !== newLayer.ambientLightColorB) {
      runtimeLayer.setClearColor(null, null, newLayer.ambientLightColorB);
    }

    if (oldLayer.followBaseLayerCamera !== newLayer.followBaseLayerCamera) {
      runtimeLayer.setFollowBaseLayerCamera(newLayer.followBaseLayerCamera);
    }
  }

  // TODO: cameras

  // Effects
  this._hotReloadRuntimeLayerEffects(
    oldLayer.effects,
    newLayer.effects,
    runtimeLayer
  );
};

/**
 * @param {EffectData[]} oldEffectsData
 * @param {EffectData[]} newEffectsData
 * @param {gdjs.Layer} runtimeLayer
 */
gdjs.HotReloader.prototype._hotReloadRuntimeLayerEffects = function (
  oldEffectsData,
  newEffectsData,
  runtimeLayer
) {
  oldEffectsData.forEach((oldEffectData) => {
    const name = oldEffectData.name;
    const newEffectData = newEffectsData.filter(
      (effectData) => effectData.name === name
    )[0];

    if (!newEffectData) {
      // Effect was removed
      runtimeLayer.removeEffect(name);
    } else if (runtimeLayer.hasEffect(name)) {
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
};

/**
 * @param {EffectData} oldEffectData
 * @param {EffectData} newEffectData
 * @param {gdjs.Layer} runtimeLayer
 * @param {string} effectName
 */
gdjs.HotReloader.prototype._hotReloadRuntimeLayerEffect = function (
  oldEffectData,
  newEffectData,
  runtimeLayer,
  effectName
) {
  // We consider oldEffectData.effectType and newEffectData.effectType
  // are the same - it's responsibility of the caller to verify this.

  for (let parameterName in newEffectData.booleanParameters) {
    const value = newEffectData.booleanParameters[parameterName];

    if (value !== oldEffectData.booleanParameters[parameterName])
      runtimeLayer.setEffectBooleanParameter(effectName, parameterName, value);
  }
  for (let parameterName in newEffectData.doubleParameters) {
    const value = newEffectData.doubleParameters[parameterName];

    if (value !== oldEffectData.doubleParameters[parameterName])
      runtimeLayer.setEffectDoubleParameter(effectName, parameterName, value);
  }
  for (let parameterName in newEffectData.stringParameters) {
    const value = newEffectData.stringParameters[parameterName];

    if (value !== oldEffectData.stringParameters[parameterName])
      runtimeLayer.setEffectStringParameter(effectName, parameterName, value);
  }
};

/**
 * @param {InstanceData[]} oldInstances
 * @param {InstanceData[]} newInstances
 * @param {gdjs.RuntimeScene} runtimeScene
 */
gdjs.HotReloader.prototype._hotReloadRuntimeSceneInstances = function (
  oldInstances,
  newInstances,
  runtimeScene
) {
  const runtimeObjects = runtimeScene.getAdhocListOfAllInstances();

  /** @type {Object.<number, InstanceData>} */
  const groupedOldInstances = gdjs.HotReloader.groupByPersistentUuid(
    oldInstances
  );
  /** @type {Object.<number, InstanceData>} */
  const groupedNewInstances = gdjs.HotReloader.groupByPersistentUuid(
    newInstances
  );
  /** @type {Object.<number, gdjs.RuntimeObject>} */
  const groupedRuntimeObjects = gdjs.HotReloader.groupByPersistentUuid(
    runtimeObjects
  );

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
    } else if (oldInstance && newInstance && runtimeObject) {
      // Instance was not deleted nor created, maybe modified (or not):
      this._hotReloadRuntimeInstance(oldInstance, newInstance, runtimeObject);
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
        /*trackByPersistentUuid=*/ true
      );
    }
  }
};

/**
 * @param {InstanceData} oldInstance
 * @param {InstanceData} newInstance
 * @param {gdjs.RuntimeObject} runtimeObject
 */
gdjs.HotReloader.prototype._hotReloadRuntimeInstance = function (
  oldInstance,
  newInstance,
  runtimeObject
) {
  var somethingChanged = false;

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

  // Check if size changed
  var sizeChanged = false;
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
  } else if (!newInstance.customSize && oldInstance.customSize) {
    // The custom size was removed. Just flag the size as changed
    // and hope the object will handle this in
    // `extraInitializationFromInitialInstance`.
    sizeChanged = true;
  }

  // Update variables
  this._hotReloadVariablesContainer(
    oldInstance.initialVariables,
    newInstance.initialVariables,
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
};

/**
 * Deep check equality between the two objects/arrays/primitives.
 *
 * Inspired from https://github.com/epoberezkin/fast-deep-equal
 * @param {any} a The first object/array/primitive to compare
 * @param {any} b The second object/array/primitive to compare
 */
gdjs.HotReloader.deepEqual = function (a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; )
        if (!gdjs.HotReloader.deepEqual(a[i], b[i])) return false;
      return true;
    }

    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      var key = keys[i];

      if (!gdjs.HotReloader.deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
};

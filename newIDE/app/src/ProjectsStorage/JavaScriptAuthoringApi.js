// @flow

import { sha256 } from 'js-sha256';
import optionalRequire from '../Utils/OptionalRequire';
import { extractIfDoJavaScriptBlocks } from '../EventsSheet/IfDoEventsDsl';
import { encodeManagedName } from './MultiFileProjectFormat';

let cachedTypeScript = null;
const loadTypeScriptChecker = (): any => {
  if (cachedTypeScript) return cachedTypeScript;
  const typescript = optionalRequire('typescript');
  // Cache successful resolution only. Electron/npm setup can become available
  // later in the same process, so an early miss must not poison validation.
  if (typescript) cachedTypeScript = typescript;
  return typescript;
};

export const JAVASCRIPT_AUTHORING_API_VERSION = 1;
export const PROJECT_RUNTIME_API_RELATIVE_PATH = '.gdevelop/runtime-api.d.ts';
export const PROJECT_API_RELATIVE_PATH = '.gdevelop/project-api.d.ts';

const MAX_JAVASCRIPT_BLOCKS = 500;
const MAX_JAVASCRIPT_SOURCE_SIZE = 2 * 1024 * 1024;

export class JavaScriptAuthoringApiError extends Error {
  code: string;
  fileUri: ?string;
  line: ?number;
  column: ?number;

  constructor(diagnostic: Object) {
    super(diagnostic.message || 'JavaScript authoring API validation failed.');
    this.name = 'JavaScriptAuthoringApiError';
    this.code = diagnostic.code || 'JS_API_VALIDATION_FAILED';
    this.fileUri = diagnostic.fileUri || null;
    this.line = diagnostic.line || null;
    this.column = diagnostic.column || null;
  }
}

const addFinalNewline = (source: string): string =>
  `${source.replace(/\r\n?/g, '\n').replace(/\n+$/, '')}\n`;

const quoted = (value: any): string => JSON.stringify(String(value || ''));

const sortedUnique = (values: Array<string>): Array<string> =>
  Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));

const runtimeApiBody = `
declare namespace gdjs {
  /** @javascriptPublic A mutable GDevelop variable. */
  export class Variable {
    getAsNumber(): number;
    setNumber(value: number): void;
    getAsString(): string;
    setString(value: string): void;
    getAsBoolean(): boolean;
    setBoolean(value: boolean): void;
    toggle(): void;
    getValue(): string | number | boolean;
    setValue(value: string | number | boolean): void;
    getType(): "number" | "string" | "boolean" | "structure" | "array" | "enum";
    getChild(name: string | number): Variable;
    getChildNamed(name: string): Variable;
    getChildAt(index: number): Variable;
    hasChild(name: string): boolean;
    addChild(name: string, variable: Variable): this;
    removeChild(name: string): void;
    removeAtIndex(index: number): void;
    clearChildren(): void;
    getChildrenCount(): number;
    getAllChildrenArray(): Variable[];
    add(value: number): void;
    sub(value: number): void;
    mul(value: number): void;
    div(value: number): void;
    concatenateString(value: string): void;
    pushVariableCopy(variable: Variable): void;
    pushValue(value: string | number | boolean): void;
  }

  /** @javascriptPublic A named collection of GDevelop variables. */
  export class VariablesContainer {
    get(name: string): Variable;
    getFromIndex(index: number): Variable;
    has(name: string): boolean;
    add(name: string, variable: Variable): void;
    remove(name: string): void;
    getVariableFromPath(path: string[]): Variable | null;
  }

  /** @javascriptPublic A two-dimensional force. */
  export class Force {
    getX(): number;
    getY(): number;
    getAngle(): number;
    getLength(): number;
  }

  /** @javascriptPublic The supported base class for runtime behaviors. */
  export class RuntimeBehavior {
    getName(): string;
    activate(enable: boolean): void;
  }

  /** @javascriptPublic The supported base class for runtime object instances. */
  export class RuntimeObject {
    getName(): string;
    getUniqueId(): number;
    getNetworkId(): string | null;
    getRuntimeScene(): RuntimeScene;
    getElapsedTime(): number;
    getX(): number;
    setX(value: number): void;
    getY(): number;
    setY(value: number): void;
    setPosition(x: number, y: number): void;
    getCenterX(): number;
    getCenterY(): number;
    getCenterXInScene(): number;
    getCenterYInScene(): number;
    setCenterPositionInScene(x: number, y: number): void;
    getAngle(): number;
    setAngle(value: number): void;
    getWidth(): number;
    setWidth(value: number): void;
    getHeight(): number;
    setHeight(value: number): void;
    getLayer(): string;
    setLayer(name: string): void;
    getZOrder(): number;
    setZOrder(value: number): void;
    hide(enable: boolean): void;
    isVisible(): boolean;
    deleteFromScene(): void;
    getVariables(): VariablesContainer;
    hasVariable(name: string): boolean;
    hasBehavior(name: string): boolean;
    getBehavior(name: string): RuntimeBehavior | null;
    resetTimer(name: string): void;
    pauseTimer(name: string): void;
    unpauseTimer(name: string): void;
    removeTimer(name: string): void;
    getTimerElapsedTimeInSeconds(name: string): number;
    getTimerElapsedTimeInSecondsOrNaN(name: string): number;
    addForce(x: number, y: number, multiplier: number): void;
    addPolarForce(angle: number, length: number, multiplier: number): void;
    addForceTowardPosition(x: number, y: number, length: number, multiplier: number): void;
    addForceTowardObject(object: RuntimeObject, length: number, multiplier: number): void;
    clearForces(): void;
    hasNoForces(): boolean;
    getAverageForce(): Force;
    hasEffect(name: string): boolean;
    removeEffect(name: string): boolean;
    clearEffects(): boolean;
    setEffectDoubleParameter(effect: string, parameter: string, value: number): boolean;
    setEffectStringParameter(effect: string, parameter: string, value: string): boolean;
    setEffectBooleanParameter(effect: string, parameter: string, value: boolean): boolean;
  }

  /** @javascriptPublic A Sprite object instance. */
  export class SpriteRuntimeObject extends RuntimeObject {
    getAnimation(): number;
    setAnimation(index: number): void;
    getAnimationName(): string;
    setAnimationName(name: string): void;
    getAnimationFrame(): number;
    setAnimationFrame(index: number): void;
    isAnimationPaused(): boolean;
    pauseAnimation(): void;
    resumeAnimation(): void;
    hasAnimationEnded(): boolean;
    getOpacity(): number;
    setOpacity(value: number): void;
    flipX(enable: boolean): void;
    flipY(enable: boolean): void;
  }

  /** @javascriptPublic A Text object instance. */
  export class TextRuntimeObject extends RuntimeObject {
    getString(): string;
    setString(value: string): void;
    getCharacterSize(): number;
    setCharacterSize(value: number): void;
    getOpacity(): number;
    setOpacity(value: number): void;
  }

  /** @javascriptPublic A Tiled Sprite object instance. */
  export class TiledSpriteRuntimeObject extends RuntimeObject {
    getXOffset(): number;
    setXOffset(value: number): void;
    getYOffset(): number;
    setYOffset(value: number): void;
    getOpacity(): number;
    setOpacity(value: number): void;
  }

  /** @javascriptPublic A runtime layer and its camera. */
  export class RuntimeLayer {
    getName(): string;
    show(enable: boolean): void;
    isVisible(): boolean;
    getCameraX(cameraId?: number): number;
    setCameraX(value: number, cameraId?: number): void;
    getCameraY(cameraId?: number): number;
    setCameraY(value: number, cameraId?: number): void;
    getCameraWidth(cameraId?: number): number;
    getCameraHeight(cameraId?: number): number;
    getCameraZoom(cameraId?: number): number;
    setCameraZoom(value: number, cameraId?: number): void;
    getCameraRotation(cameraId?: number): number;
    setCameraRotation(value: number, cameraId?: number): void;
    getWidth(): number;
    getHeight(): number;
    getTimeScale(): number;
    setTimeScale(value: number): void;
    getElapsedTime(): number;
    hasEffect(name: string): boolean;
    removeEffect(name: string): void;
    setEffectDoubleParameter(effect: string, parameter: string, value: number): void;
    setEffectStringParameter(effect: string, parameter: string, value: string): void;
    setEffectBooleanParameter(effect: string, parameter: string, value: boolean): void;
  }

  /** @javascriptPublic The running game. */
  export class RuntimeGame {
    getVariables(): VariablesContainer;
    hasScene(name: string): boolean;
    getGameResolutionWidth(): number;
    getGameResolutionHeight(): number;
    setGameResolutionSize(width: number, height: number): void;
    getOriginalWidth(): number;
    getOriginalHeight(): number;
    getSceneLoadingProgress(name: string): number;
  }

  /** @javascriptPublic The scene being executed by a JavaScript event. */
  export class RuntimeScene {
    getName(): string;
    getGame(): RuntimeGame;
    getVariables(): VariablesContainer;
    /**
     * Return the live, engine-owned array of living instances. Creating or
     * deleting an instance mutates this array immediately. Iterate a slice()
     * snapshot or iterate backward when calling deleteFromScene().
     * @javascriptPublic
     */
    getObjects(name: string): RuntimeObject[];
    createObject(name: string): RuntimeObject | null;
    getInstancesCountOnScene(name: string): number;
    getObjectNamesInGroup(name: string): string[];
    hasLayer(name: string): boolean;
    getLayer(name: string): RuntimeLayer;
    getAllLayerNames(result: string[]): void;
    getElapsedTime(): number;
    getViewportWidth(): number;
    getViewportHeight(): number;
    getBackgroundColor(): number;
    setBackgroundColor(red: number, green: number, blue: number): void;
  }

  /** @javascriptPublic The supported function invocation context. */
  export interface EventsFunctionContext {
    returnValue: string | number | boolean;
    getObjects(name: string): RuntimeObject[];
    getObjectsLists(name: string): { [objectName: string]: RuntimeObject[] } | null;
    getBehaviorName(name: string): string;
    createObject(name: string): RuntimeObject;
    getInstancesCountOnScene(name: string): number;
    getArgument(name: string): string | number | Variable;
  }

  export namespace evtTools {
    export namespace runtimeScene {
      function replaceScene(runtimeScene: RuntimeScene, sceneName: string, clearOthers: boolean): void;
      function pushScene(runtimeScene: RuntimeScene, sceneName: string): void;
      function popScene(runtimeScene: RuntimeScene): void;
      function stopGame(runtimeScene: RuntimeScene): void;
      function getElapsedTimeInSeconds(runtimeScene: RuntimeScene): number;
      function getTimeFromStartInSeconds(runtimeScene: RuntimeScene): number;
      function resetTimer(runtimeScene: RuntimeScene, timerName: string): void;
      function pauseTimer(runtimeScene: RuntimeScene, timerName: string): void;
      function unpauseTimer(runtimeScene: RuntimeScene, timerName: string): void;
      function removeTimer(runtimeScene: RuntimeScene, timerName: string): void;
      function getTimerElapsedTimeInSeconds(runtimeScene: RuntimeScene, timerName: string): number;
    }
    export namespace input {
      function isKeyPressed(runtimeScene: RuntimeScene, key: string): boolean;
      function wasKeyReleased(runtimeScene: RuntimeScene, key: string): boolean;
      function isMouseButtonPressed(runtimeScene: RuntimeScene, button: string): boolean;
      function getCursorX(runtimeScene: RuntimeScene, layer: string, camera: number): number;
      function getCursorY(runtimeScene: RuntimeScene, layer: string, camera: number): number;
      function requestPointerLock(runtimeScene: RuntimeScene, reason?: string): boolean;
      function exitPointerLock(runtimeScene: RuntimeScene, reason?: string): void;
      function isPointerLocked(runtimeScene: RuntimeScene): boolean;
      function getPointerMovementX(runtimeScene: RuntimeScene): number;
      function getPointerMovementY(runtimeScene: RuntimeScene): number;
    }
    export namespace scene3d {
      interface RaycastResult {
        object: RuntimeObject;
        objectIndex: number;
        distance: number;
        pointX: number;
        pointY: number;
        pointZ: number;
      }
      function raycastObjects(
        originX: number,
        originY: number,
        originZ: number,
        directionX: number,
        directionY: number,
        directionZ: number,
        objects: RuntimeObject[],
        near?: number,
        far?: number,
        recursive?: boolean
      ): RaycastResult[];
    }
    export namespace common {
      function distanceBetweenPositions(x1: number, y1: number, x2: number, y2: number): number;
      function angleBetweenPositions(x1: number, y1: number, x2: number, y2: number): number;
      function clamp(value: number, min: number, max: number): number;
    }
  }
}
`;

const generatedHeader = (metadata: Array<[string, string]>): string =>
  [
    '// Generated by GDevelop. Do not edit.',
    `// javascriptAuthoringApiVersion: ${JAVASCRIPT_AUTHORING_API_VERSION}`,
    ...metadata.map(([name, value]) => `// ${name}: ${value}`),
    '',
  ].join('\n');

export const buildRuntimeApiDeclaration = (): string => {
  const body = addFinalNewline(runtimeApiBody.trim());
  return addFinalNewline(
    `${generatedHeader([['runtimeApiHash', `sha256:${sha256(body)}`]])}${body}`
  );
};

const runtimeTypeByObjectType = (objectType: string): string => {
  if (objectType === 'Sprite') return 'gdjs.SpriteRuntimeObject';
  if (objectType === 'TextObject::Text') return 'gdjs.TextRuntimeObject';
  if (objectType === 'TiledSpriteObject::TiledSprite')
    return 'gdjs.TiledSpriteRuntimeObject';
  return 'gdjs.RuntimeObject';
};

const variableDescriptorType = (
  variable: Object,
  depth: number = 0
): string => {
  if (depth >= 6) return 'unknown';
  const type = String(variable.type || 'number').toLowerCase();
  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'enum') {
    const values = Array.isArray(variable.values)
      ? sortedUnique(variable.values.map(String).filter(Boolean))
      : [];
    return values.length ? values.map(quoted).join(' | ') : 'string';
  }
  const children = Array.isArray(variable.children) ? variable.children : [];
  if (type === 'array') {
    if (!children.length) return 'unknown[]';
    const childTypes = sortedUnique(
      children.map(child => variableDescriptorType(child, depth + 1))
    );
    return `Array<${childTypes.join(' | ')}>`;
  }
  if (type === 'structure') {
    if (!children.length) return '{ [name: string]: unknown }';
    return `{ ${children
      .filter(child => child && child.name !== undefined)
      .map(
        child =>
          `readonly ${quoted(child.name)}: ${variableDescriptorType(
            child,
            depth + 1
          )};`
      )
      .join(' ')} }`;
  }
  return 'unknown';
};

const variableMapDeclaration = (variables: ?Array<Object>): string => {
  const entries = (variables || [])
    .filter(variable => variable && variable.name !== undefined)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(
      variable =>
        `      readonly ${quoted(variable.name)}: ${variableDescriptorType(
          variable
        )};`
    );
  return entries.length ? entries.join('\n') : '      // No variables.';
};

const behaviorMapDeclaration = (behaviors: ?Array<Object>): string => {
  const entries = (behaviors || [])
    .filter(behavior => behavior && behavior.name !== undefined)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(behavior => `readonly ${quoted(behavior.name)}: gdjs.RuntimeBehavior`);
  return entries.length ? `{ ${entries.join('; ')} }` : '{}';
};

const objectVariablesDeclaration = (variables: ?Array<Object>): string => {
  const entries = (variables || [])
    .filter(variable => variable && variable.name !== undefined)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(
      variable =>
        `readonly ${quoted(variable.name)}: ${variableDescriptorType(variable)}`
    );
  return entries.length ? `{ ${entries.join('; ')} }` : '{}';
};

const mergeNamedObjects = (
  globalObjects: ?Array<Object>,
  localObjects: ?Array<Object>
): Array<Object> => {
  const objectsByName: Map<string, Object> = new Map();
  (globalObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  (localObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  return Array.from(objectsByName.values()).sort((left, right) =>
    String(left.name || '').localeCompare(String(right.name || ''))
  );
};

const getGroupMembers = (group: Object): Array<string> =>
  sortedUnique(
    (group.objects || [])
      .map(object =>
        typeof object === 'string' ? object : String(object.name || '')
      )
      .filter(Boolean)
  );

const objectMapBody = (objects: Array<Object>, indent: string): string => {
  if (!objects.length) return `${indent}// No objects.`;
  return objects
    .map(object => {
      const type = runtimeTypeByObjectType(String(object.type || ''));
      return `${indent}readonly ${quoted(
        object.name
      )}: ObjectDefinition<${type}, ${objectVariablesDeclaration(
        object.variables
      )}, ${behaviorMapDeclaration(object.behaviors)}>;`;
    })
    .join('\n');
};

const groupMapBody = (groups: ?Array<Object>, indent: string): string => {
  const entries = (groups || [])
    .filter(group => group && group.name !== undefined)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(group => {
      const members = getGroupMembers(group);
      return `${indent}readonly ${quoted(group.name)}: ${
        members.length ? members.map(quoted).join(' | ') : 'never'
      };`;
    });
  return entries.length ? entries.join('\n') : `${indent}// No groups.`;
};

const layerUnion = (layout: Object): string => {
  const names = sortedUnique([
    '',
    ...(layout.layers || []).map(layer => String(layer.name || '')),
  ]);
  return names.map(quoted).join(' | ');
};

const functionParameterType = (parameter: Object): string => {
  const type = String(parameter.type || '').toLowerCase();
  if (type.includes('object')) return 'gdjs.RuntimeObject[]';
  if (type.includes('number')) return 'number';
  if (type.includes('boolean') || type.includes('yesorno')) return 'boolean';
  if (type.includes('variable')) return 'gdjs.Variable';
  return 'string';
};

const functionResultType = (eventsFunction: Object): string => {
  const functionType = String(eventsFunction.functionType || '').toLowerCase();
  if (functionType.includes('condition') || functionType.includes('boolean'))
    return 'boolean';
  if (functionType.includes('expression')) {
    return functionType.includes('string') ? 'string' : 'number';
  }
  return 'void';
};

const collectFunctionDeclarations = (
  serializedProject: Object
): Array<Object> => {
  const functions = [];
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    const addFunctions = (owner: string, ownerFunctions: ?Array<Object>) => {
      (ownerFunctions || []).forEach(eventsFunction => {
        functions.push({
          name: `${owner}::${String(eventsFunction.name || '')}`,
          kind: String(eventsFunction.functionType || 'Action'),
          parameters: eventsFunction.parameters || [],
          result: functionResultType(eventsFunction),
        });
      });
    };
    addFunctions(extensionName, extension.eventsFunctions);
    (extension.eventsBasedObjects || []).forEach(prefab =>
      addFunctions(
        `${extensionName}::${String(prefab.name || '')}`,
        prefab.eventsFunctions
      )
    );
    (extension.eventsBasedBehaviors || []).forEach(behavior =>
      addFunctions(
        `${extensionName}::${String(behavior.name || '')}`,
        behavior.eventsFunctions
      )
    );
  });
  return functions.sort((left, right) => left.name.localeCompare(right.name));
};

export const buildProjectApiModel = (serializedProject: Object): Object => {
  const globalObjects = serializedProject.objects || [];
  const scenes = (serializedProject.layouts || [])
    .map(layout => ({
      name: String(layout.name || ''),
      objects: mergeNamedObjects(globalObjects, layout.objects),
      groups: [
        ...(serializedProject.objectsGroups || []),
        ...(layout.objectsGroups || []),
      ],
      variables: layout.variables || [],
      layers: sortedUnique([
        '',
        ...(layout.layers || []).map(layer => String(layer.name || '')),
      ]),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
  return {
    projectName: String(
      (serializedProject.properties && serializedProject.properties.name) || ''
    ),
    scenes,
    globalObjects: mergeNamedObjects([], globalObjects),
    globalVariables: serializedProject.variables || [],
    resources:
      (serializedProject.resources && serializedProject.resources.resources) ||
      [],
    functions: collectFunctionDeclarations(serializedProject),
    externalEvents: (serializedProject.externalEvents || [])
      .map(external => ({
        name: String(external.name || ''),
        sceneName: String(external.associatedLayout || ''),
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
};

export const buildProjectApiDeclaration = (
  serializedProject: Object,
  runtimeApiDeclaration?: string
): string => {
  const model = buildProjectApiModel(serializedProject);
  const sceneDeclarations = model.scenes.length
    ? model.scenes
        .map(
          scene => `    readonly ${quoted(scene.name)}: {
      readonly objects: {
${objectMapBody(scene.objects, '        ')}
      };
      readonly groups: {
${groupMapBody(scene.groups, '        ')}
      };
      readonly variables: {
${variableMapDeclaration(scene.variables)}
      };
      readonly layers: ${layerUnion(scene)};
    };`
        )
        .join('\n')
    : '    // No scenes.';
  const resourceDeclarations = (model.resources || [])
    .filter(resource => resource && resource.name !== undefined)
    .sort((left, right) => String(left.name).localeCompare(String(right.name)))
    .map(
      resource =>
        `    readonly ${quoted(resource.name)}: { readonly kind: ${quoted(
          resource.kind || 'unknown'
        )} };`
    )
    .join('\n');
  const functionDeclarations = model.functions.length
    ? model.functions
        .map(eventsFunction => {
          const parameters = (eventsFunction.parameters || [])
            .filter(parameter => parameter && parameter.name !== undefined)
            .map(
              parameter =>
                `readonly ${quoted(parameter.name)}: ${functionParameterType(
                  parameter
                )}`
            );
          return `    readonly ${quoted(eventsFunction.name)}: {
      readonly kind: ${quoted(eventsFunction.kind)};
      readonly parameters: ${
        parameters.length ? `{ ${parameters.join('; ')} }` : '{}'
      };
      readonly result: ${eventsFunction.result};
    };`;
        })
        .join('\n')
    : '    // No extension functions.';
  const body = addFinalNewline(
    `
declare namespace GDevelopProject {
  export interface ObjectDefinition<
    RuntimeType extends gdjs.RuntimeObject,
    Variables,
    Behaviors
  > {
    readonly runtimeType: RuntimeType;
    readonly variables: Variables;
    readonly behaviors: Behaviors;
  }

  export interface Scenes {
${sceneDeclarations}
  }

  export interface GlobalObjects {
${objectMapBody(model.globalObjects, '    ')}
  }

  export interface GlobalVariables {
${variableMapDeclaration(model.globalVariables)}
  }

  export interface Resources {
${resourceDeclarations || '    // No resources.'}
  }

  export interface Functions {
${functionDeclarations}
  }

  export type SceneName = keyof Scenes & string;
  export type SceneObjects<S extends SceneName> = Scenes[S]["objects"];
  export type SceneGroups<S extends SceneName> = Scenes[S]["groups"];
  export type SceneObjectName<S extends SceneName> = keyof SceneObjects<S> & string;
  export type SceneGroupName<S extends SceneName> = keyof SceneGroups<S> & string;
  export type RuntimeTypeOf<Definition> = Definition extends ObjectDefinition<infer RuntimeType, unknown, unknown>
    ? RuntimeType
    : gdjs.RuntimeObject;
  export type VariablesOf<Definition> = Definition extends ObjectDefinition<unknown, infer Variables, unknown>
    ? Variables
    : {};
  export type BehaviorsOf<Definition> = Definition extends ObjectDefinition<unknown, unknown, infer Behaviors>
    ? Behaviors
    : {};
  export type TypedVariables<Variables> = Omit<gdjs.VariablesContainer, "get"> & {
    get<N extends string>(
      name: KnownOrDynamic<N, keyof Variables & string>
    ): gdjs.Variable;
  };
  export type TypedRuntimeObject<Definition> = Omit<
    RuntimeTypeOf<Definition>,
    "getVariables" | "getBehavior" | "hasBehavior"
  > & {
    getVariables(): TypedVariables<VariablesOf<Definition>>;
    getBehavior<N extends string>(
      name: KnownOrDynamic<N, keyof BehaviorsOf<Definition> & string>
    ): gdjs.RuntimeBehavior | null;
    hasBehavior<N extends string>(
      name: KnownOrDynamic<N, keyof BehaviorsOf<Definition> & string>
    ): boolean;
  };
  export type SceneObjectRuntimeType<
    S extends SceneName,
    N extends SceneObjectName<S>
  > = TypedRuntimeObject<SceneObjects<S>[N]>;
  export type SceneGroupMembers<
    S extends SceneName,
    N extends SceneGroupName<S>
  > = SceneGroups<S>[N] & SceneObjectName<S>;
  export type ScenePickedObjectType<
    S extends SceneName,
    N extends string
  > = N extends SceneObjectName<S>
    ? SceneObjectRuntimeType<S, N>
    : N extends SceneGroupName<S>
    ? SceneObjectRuntimeType<S, SceneGroupMembers<S, N>>
    : gdjs.RuntimeObject;
  export type KnownOrDynamic<Name extends string, Known extends string> =
    string extends Name ? Name : Name extends Known ? Name : never;
  export type ProjectRuntimeGame = Omit<gdjs.RuntimeGame, "getVariables"> & {
    getVariables(): TypedVariables<GlobalVariables>;
  };
  export type SceneRuntime<S extends SceneName> = Omit<
    gdjs.RuntimeScene,
    "getGame" | "getVariables" | "getObjects" | "createObject" |
      "getInstancesCountOnScene" | "getObjectNamesInGroup" | "hasLayer" | "getLayer"
  > & {
    getGame(): ProjectRuntimeGame;
    getVariables(): TypedVariables<Scenes[S]["variables"]>;
    getObjects<N extends string>(
      name: KnownOrDynamic<N, SceneObjectName<S>>
    ): Array<N extends SceneObjectName<S> ? SceneObjectRuntimeType<S, N> : gdjs.RuntimeObject>;
    createObject<N extends string>(
      name: KnownOrDynamic<N, SceneObjectName<S>>
    ): (N extends SceneObjectName<S> ? SceneObjectRuntimeType<S, N> : gdjs.RuntimeObject) | null;
    getInstancesCountOnScene<N extends string>(
      name: KnownOrDynamic<N, SceneObjectName<S>>
    ): number;
    getObjectNamesInGroup<N extends string>(
      name: KnownOrDynamic<N, SceneGroupName<S>>
    ): Array<SceneGroupMembers<S, N & SceneGroupName<S>>>;
    hasLayer<N extends string>(
      name: KnownOrDynamic<N, Scenes[S]["layers"] & string>
    ): boolean;
    getLayer<N extends string>(
      name: KnownOrDynamic<N, Scenes[S]["layers"] & string>
    ): gdjs.RuntimeLayer;
  };
}
`.trim()
  );
  const runtimeHash = sha256(
    runtimeApiDeclaration || buildRuntimeApiDeclaration()
  );
  const modelHash = sha256(JSON.stringify(model));
  return addFinalNewline(
    `${generatedHeader([
      ['runtimeApiHash', `sha256:${runtimeHash}`],
      ['projectApiHash', `sha256:${modelHash}`],
    ])}${body}`
  );
};

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};

const getSourceContext = (fileUri: string, model: Object): Object => {
  const externalLifecycleMatch = /^game:\/\/scenes\/([^/]+)\/external-events\/([^/]+)\/functions\/(sceneLoad|sceneSignal|sceneUpdate|sceneUnload)\.events$/.exec(
    fileUri
  );
  if (externalLifecycleMatch) {
    const physicalSceneName = safeDecode(externalLifecycleMatch[1]);
    const externalName = safeDecode(externalLifecycleMatch[2]);
    const external = (model.externalEvents || []).find(
      external =>
        external.name === externalName &&
        external.sceneName === physicalSceneName
    );
    const scene = external
      ? model.scenes.find(scene => scene.name === external.sceneName)
      : null;
    return {
      sceneName: scene ? scene.name : null,
      isFunction: true,
      external: true,
      lifecycleFunctionName: externalLifecycleMatch[3],
    };
  }
  const sceneLifecycleMatch = /^game:\/\/scenes\/([^/]+)\/functions\/(sceneLoad|sceneSignal|sceneUpdate|sceneUnload)\.events$/.exec(
    fileUri
  );
  if (sceneLifecycleMatch) {
    const physicalName = safeDecode(sceneLifecycleMatch[1]);
    const scene = model.scenes.find(scene => scene.name === physicalName);
    return {
      sceneName: scene ? scene.name : null,
      isFunction: true,
      lifecycleFunctionName: sceneLifecycleMatch[2],
    };
  }
  const sceneMatch = /^game:\/\/scenes\/([^/]+)\//.exec(fileUri);
  if (sceneMatch) {
    const physicalName = safeDecode(sceneMatch[1]);
    const scene = model.scenes.find(scene => scene.name === physicalName);
    return { sceneName: scene ? scene.name : null, isFunction: false };
  }
  return {
    sceneName: null,
    isFunction: /\/functions\//.test(fileUri),
  };
};

const collectEventsJavaScriptBlocks = (
  events: any,
  fileUri: string,
  output: Array<Object>
) => {
  if (!Array.isArray(events)) return;
  events.forEach((event, index) => {
    if (!event || typeof event !== 'object') return;
    if (
      typeof event.inlineCode === 'string' &&
      (String(event.type || '').includes('JsCode') ||
        event.parameterObjects !== undefined)
    ) {
      output.push({
        fileUri,
        inlineCode: event.inlineCode,
        parameterObjects: String(event.parameterObjects || ''),
        useStrict: event.useStrict === true,
        headerLine: index + 1,
        bodyLine: index + 1,
      });
    }
    Object.keys(event).forEach(key => {
      if (Array.isArray(event[key])) {
        collectEventsJavaScriptBlocks(event[key], fileUri, output);
      }
    });
  });
};

export const collectSerializedProjectJavaScriptBlocks = (
  serializedProject: Object
): Array<Object> => {
  const blocks: Array<Object> = [];
  const lifecycleSources = [
    ['sceneLoad', 'sceneLoadEvents'],
    ['sceneSignal', 'sceneSignalEvents'],
    ['sceneUpdate', 'events'],
    ['sceneUnload', 'sceneUnloadEvents'],
  ];
  (serializedProject.layouts || []).forEach(layout => {
    const sceneName = encodeManagedName(String(layout.name || ''));
    lifecycleSources.forEach(([role, legacyField]) =>
      collectEventsJavaScriptBlocks(
        layout[legacyField],
        `game://scenes/${sceneName}/functions/${role}.events`,
        blocks
      )
    );
  });
  (serializedProject.externalEvents || []).forEach(external => {
    const sceneName = encodeManagedName(
      String(external.associatedLayout || '')
    );
    const externalName = encodeManagedName(String(external.name || ''));
    lifecycleSources.forEach(([role, legacyField]) =>
      collectEventsJavaScriptBlocks(
        external[legacyField],
        `game://scenes/${sceneName}/external-events/${externalName}/functions/${role}.events`,
        blocks
      )
    );
  });
  (serializedProject.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = encodeURIComponent(String(extension.name || ''));
    const collectFunctions = (base: string, functions: ?Array<Object>) =>
      (functions || []).forEach(eventsFunction => {
        const functionName = encodeURIComponent(
          String(eventsFunction.name || '')
        );
        collectEventsJavaScriptBlocks(
          eventsFunction.events,
          `${base}/functions/${functionName}.events`,
          blocks
        );
      });
    const extensionBase = `game://extensions/${extensionName}`;
    collectFunctions(extensionBase, extension.eventsFunctions);
    (extension.eventsBasedObjects || []).forEach(prefab =>
      collectFunctions(
        `${extensionBase}/prefabs/${encodeURIComponent(
          String(prefab.name || '')
        )}`,
        prefab.eventsFunctions
      )
    );
    (extension.eventsBasedBehaviors || []).forEach(behavior =>
      collectFunctions(
        `${extensionBase}/behaviors/${encodeURIComponent(
          String(behavior.name || '')
        )}`,
        behavior.eventsFunctions
      )
    );
  });
  return blocks;
};

export const collectSourceFileJavaScriptBlocks = (files: {
  [string]: string,
}): Array<Object> => {
  const blocks: Array<Object> = [];
  Object.keys(files)
    .filter(fileUri => fileUri.endsWith('.events'))
    .sort()
    .forEach(fileUri => {
      extractIfDoJavaScriptBlocks(files[fileUri]).forEach(block =>
        blocks.push({ fileUri, ...block })
      );
    });
  return blocks;
};

const buildInstalledStoreExtensionCompatibilityProfile = (
  serializedProject: Object
): ?Object => {
  const extensionNames = (serializedProject.eventsFunctionsExtensions || [])
    .filter(extension => {
      const extensionName = String((extension && extension.name) || '');
      const origin = extension && extension.origin;
      return (
        !!extensionName &&
        !!origin &&
        origin.name === 'gdevelop-extension-store' &&
        origin.identifier === extensionName
      );
    })
    .map(extension => String(extension.name));
  if (!extensionNames.length) return null;
  return {
    reviewedFileUriPrefixes: extensionNames.map(
      extensionName => `game://extensions/${encodeURIComponent(extensionName)}/`
    ),
    provenance: {
      source: 'installed-gdevelop-extension-store',
      extensionNames,
    },
  };
};

const makeContextDeclaration = (block: Object, model: Object): string => {
  const context = getSourceContext(block.fileUri, model);
  const sceneName = context.sceneName;
  const runtimeSceneType = sceneName
    ? `GDevelopProject.SceneRuntime<${quoted(sceneName)}>`
    : 'gdjs.RuntimeScene';
  const declarations = [`declare const runtimeScene: ${runtimeSceneType};`];
  if (block.parameterObjects) {
    declarations.push(
      sceneName
        ? `declare const objects: Array<GDevelopProject.ScenePickedObjectType<${quoted(
            sceneName
          )}, ${quoted(block.parameterObjects)}>>;`
        : 'declare const objects: gdjs.RuntimeObject[];'
    );
  }
  if (context.isFunction) {
    declarations.push(
      'declare const eventsFunctionContext: gdjs.EventsFunctionContext;'
    );
  }
  return addFinalNewline(declarations.join('\n'));
};

const diagnosticLocation = (sourceFile: any, start: ?number): Object => {
  if (!sourceFile || start == null) return { line: 1, column: 1 };
  const position = sourceFile.getLineAndCharacterOfPosition(start);
  return { line: position.line + 1, column: position.character + 1 };
};

const mapTypeScriptDiagnosticCode = (code: number): string => {
  if ([2531, 2532, 18047, 18048].includes(code)) return 'JS_API_NULLABILITY';
  if ([2304, 2339, 2551].includes(code)) return 'JS_API_UNKNOWN_MEMBER';
  return 'JS_API_TYPE_MISMATCH';
};

const makeDiagnostic = ({
  code,
  message,
  block,
  line,
  column,
  severity,
}: Object): Object => ({
  severity,
  phase: 'javascript-authoring-api',
  code,
  message,
  fileUri: block.fileUri,
  line: (() => {
    const relativeLine = Math.max(
      1,
      Number(line || 1) - Number(block.validationLineOffset || 0)
    );
    const boundedRelativeLine = block.validationBodyLineCount
      ? Math.min(relativeLine, Number(block.validationBodyLineCount))
      : relativeLine;
    return Number(block.bodyLine || 1) + boundedRelativeLine - 1;
  })(),
  column: Number(column || 1),
});

const FORBIDDEN_GLOBALS = new Set([
  'eval',
  'Function',
  'require',
  'process',
  'window',
  'document',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'localStorage',
  'sessionStorage',
  'navigator',
  'setTimeout',
  'setInterval',
  'Worker',
  'SharedWorker',
]);

const validateBlockWithTypeScript = ({
  block,
  typescript,
  runtimeApiDeclaration,
  projectApiDeclaration,
  model,
  compilerState,
  compatibilityProfile,
}: Object): Array<Object> => {
  const ts = typescript;
  const root = 'C:/__gdevelop_javascript_api__';
  const runtimePath = `${root}/runtime-api.d.ts`;
  const projectPath = `${root}/project-api.d.ts`;
  const contextPath = `${root}/context.d.ts`;
  const sourcePath = `${root}/source.js`;
  // GDevelop executes the inline body inside a generated function. Wrapping it
  // here keeps `return` and function-local declarations faithful to runtime.
  const validationLineOffset = 1;
  const validationBodyLineCount = Math.max(
    1,
    String(block.inlineCode || '').split('\n').length
  );
  const validationBlock = {
    ...block,
    validationLineOffset,
    validationBodyLineCount,
  };
  const wrappedSource = `function __gdevelopJavaScriptEventValidation__() {\n${
    block.inlineCode
  }\n}\n`;
  const virtualFiles = new Map([
    [runtimePath.toLowerCase(), runtimeApiDeclaration],
    [projectPath.toLowerCase(), projectApiDeclaration],
    [contextPath.toLowerCase(), makeContextDeclaration(block, model)],
    [sourcePath.toLowerCase(), wrappedSource],
  ]);
  const compilerOptions = {
    allowJs: true,
    checkJs: true,
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
    lib: ['lib.es2020.d.ts'],
    skipLibCheck: true,
  };
  const baseHost = ts.createCompilerHost(compilerOptions, true);
  const readVirtual = (fileName: string): ?string =>
    virtualFiles.get(fileName.toLowerCase());
  const host = {
    ...baseHost,
    fileExists: (fileName: string): boolean =>
      readVirtual(fileName) !== undefined || baseHost.fileExists(fileName),
    readFile: (fileName: string): ?string => {
      const virtual = readVirtual(fileName);
      return virtual !== undefined ? virtual : baseHost.readFile(fileName);
    },
    getSourceFile: (fileName: string, languageVersion: any): any => {
      const virtual = readVirtual(fileName);
      if (virtual !== undefined) {
        return ts.createSourceFile(
          fileName,
          virtual,
          languageVersion,
          true,
          fileName.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS
        );
      }
      return baseHost.getSourceFile(fileName, languageVersion);
    },
  };
  const program = ts.createProgram(
    [runtimePath, projectPath, contextPath, sourcePath],
    compilerOptions,
    host,
    compilerState.program || undefined
  );
  compilerState.program = program;
  const sourceFile = program.getSourceFile(sourcePath);
  const isReviewedCompatibilityBlock =
    !!compatibilityProfile &&
    Array.isArray(compatibilityProfile.reviewedFileUriPrefixes) &&
    compatibilityProfile.reviewedFileUriPrefixes.some(prefix =>
      String(block.fileUri || '').startsWith(prefix)
    );
  const severity =
    block.useStrict && !isReviewedCompatibilityBlock ? 'error' : 'warning';
  const diagnostics = [];
  const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile);
  const syntacticDiagnosticSet = new Set(syntacticDiagnostics);
  [
    ...syntacticDiagnostics,
    ...program.getSemanticDiagnostics(sourceFile),
  ].forEach(diagnostic => {
    const isSyntaxError = syntacticDiagnosticSet.has(diagnostic);
    const location = diagnosticLocation(sourceFile, diagnostic.start);
    diagnostics.push(
      makeDiagnostic({
        code: isSyntaxError
          ? 'JS_API_SYNTAX_ERROR'
          : mapTypeScriptDiagnosticCode(diagnostic.code),
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        block: validationBlock,
        ...location,
        severity:
          isSyntaxError && !isReviewedCompatibilityBlock ? 'error' : severity,
      })
    );
  });
  if (sourceFile) {
    const seen: Set<string> = new Set();
    const addNodeDiagnostic = (
      code: string,
      message: string,
      node: any,
      diagnosticSeverity: string = severity
    ) => {
      const location = diagnosticLocation(
        sourceFile,
        node.getStart(sourceFile)
      );
      const key = `${code}:${location.line}:${location.column}`;
      if (seen.has(key)) return;
      seen.add(key);
      diagnostics.push(
        makeDiagnostic({
          code,
          message,
          block: validationBlock,
          ...location,
          severity: diagnosticSeverity,
        })
      );
    };
    const visit = (node: any) => {
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name &&
        node.name.text.startsWith('_')
      ) {
        addNodeDiagnostic(
          'JS_API_PRIVATE_MEMBER',
          `${
            node.name.text
          } is runtime-private and is not part of the JavaScript authoring API.`,
          node.name
        );
      }
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name &&
        node.name.text === 'prototype'
      ) {
        addNodeDiagnostic(
          'JS_API_FORBIDDEN_GLOBAL',
          'Prototype mutation/access is forbidden in AI-authored JavaScript events.',
          node.name
        );
      }
      if (
        ts.isElementAccessExpression(node) &&
        node.argumentExpression &&
        ts.isStringLiteral(node.argumentExpression) &&
        node.argumentExpression.text.startsWith('_')
      ) {
        addNodeDiagnostic(
          'JS_API_PRIVATE_MEMBER',
          `${
            node.argumentExpression.text
          } is runtime-private and is not part of the JavaScript authoring API.`,
          node.argumentExpression
        );
      }
      if (
        ts.isIdentifier(node) &&
        FORBIDDEN_GLOBALS.has(node.text) &&
        !(
          ts.isPropertyAccessExpression(node.parent) &&
          node.parent.name === node
        )
      ) {
        addNodeDiagnostic(
          'JS_API_FORBIDDEN_GLOBAL',
          `${
            node.text
          } is forbidden in AI-authored JavaScript events. Use a reviewed GDevelop extension when this capability is required.`,
          node
        );
      }
      if (
        ts.isCallExpression(node) &&
        node.expression &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        addNodeDiagnostic(
          'JS_API_FORBIDDEN_GLOBAL',
          'Dynamic import() is forbidden in JavaScript events.',
          node.expression
        );
      }
      if (
        (ts.isWhileStatement(node) &&
          node.expression.kind === ts.SyntaxKind.TrueKeyword) ||
        (ts.isForStatement(node) && !node.condition)
      ) {
        addNodeDiagnostic(
          'JS_API_PERFORMANCE_RISK',
          'Unbounded loops are unsafe in JavaScript events. Use a bounded loop or GDevelop event iteration.',
          node,
          'warning'
        );
      }
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name &&
        node.name.text === 'func' &&
        /evtsExt__/.test(node.expression.getText(sourceFile))
      ) {
        addNodeDiagnostic(
          'JS_API_PRIVATE_MEMBER',
          'Generated extension .func symbols are private. Call the extension through an Events DSL catalog instruction.',
          node.name
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  if (
    isReviewedCompatibilityBlock &&
    diagnostics.some(
      diagnostic =>
        diagnostic.severity === 'warning' &&
        diagnostic.code !== 'JS_API_PERFORMANCE_RISK'
    )
  ) {
    diagnostics.push({
      severity: 'warning',
      phase: 'javascript-authoring-api',
      code: 'EXTENSION_REVIEWED_COMPATIBILITY_PROFILE',
      message:
        'A registry-fetched, reviewed extension uses JavaScript outside the current public authoring declaration. JavaScript authoring diagnostics are warnings so installation can continue; generated-code preflight remains blocking.',
      fileUri: block.fileUri,
      line: block.bodyLine || 1,
      column: 1,
      provenance: compatibilityProfile.provenance,
    });
  }
  return diagnostics;
};

export const validateJavaScriptAuthoringBlocks = ({
  blocks,
  serializedProject,
  runtimeApiDeclaration,
  projectApiDeclaration,
  typescript: typescriptOverride,
  compatibilityProfile,
}: Object): Object => {
  const typescript =
    typescriptOverride === undefined
      ? loadTypeScriptChecker()
      : typescriptOverride;
  const strictBlocks = blocks.filter(block => block.useStrict).length;
  const environmentDiagnostics = typescript
    ? []
    : [
        {
          severity: strictBlocks ? 'error' : 'warning',
          phase: 'javascript-authoring-environment',
          code: 'JS_API_TYPESCRIPT_UNAVAILABLE',
          message:
            'The TypeScript checker is unavailable; JavaScript source validation was skipped. Install the validator runtime dependency before relying on validate_project_files.',
          scope: 'validator',
          affectedBlocks: blocks.length,
        },
      ];
  const runtimeDeclaration =
    runtimeApiDeclaration || buildRuntimeApiDeclaration();
  const projectDeclaration =
    projectApiDeclaration ||
    buildProjectApiDeclaration(serializedProject, runtimeDeclaration);
  const model = buildProjectApiModel(serializedProject);
  const totalSourceSize = blocks.reduce(
    (size, block) => size + String(block.inlineCode || '').length,
    0
  );
  if (
    blocks.length > MAX_JAVASCRIPT_BLOCKS ||
    totalSourceSize > MAX_JAVASCRIPT_SOURCE_SIZE
  ) {
    const diagnostic = {
      severity: 'error',
      phase: 'javascript-authoring-api',
      code: 'JS_API_RESOURCE_LIMIT',
      message: `JavaScript validation is limited to ${MAX_JAVASCRIPT_BLOCKS} blocks and ${MAX_JAVASCRIPT_SOURCE_SIZE} source characters.`,
    };
    const diagnostics = [...environmentDiagnostics, diagnostic];
    return {
      checked: !!typescript,
      valid: false,
      blocks: blocks.length,
      strictBlocks,
      checkedBlocks: 0,
      typescriptAvailable: !!typescript,
      typescriptVersion: typescript ? String(typescript.version || '') : null,
      environmentDiagnostics,
      sourceDiagnostics: [diagnostic],
      errors: diagnostics.filter(item => item.severity === 'error'),
      warnings: diagnostics.filter(item => item.severity === 'warning'),
      diagnostics,
    };
  }
  const sourceDiagnostics: Array<Object> = [];
  const compilerState = { program: null };
  if (typescript) {
    blocks.forEach(block =>
      sourceDiagnostics.push(
        ...validateBlockWithTypeScript({
          block,
          typescript,
          runtimeApiDeclaration: runtimeDeclaration,
          projectApiDeclaration: projectDeclaration,
          model,
          compilerState,
          compatibilityProfile,
        })
      )
    );
  }
  const diagnostics = [...environmentDiagnostics, ...sourceDiagnostics];
  const errors = diagnostics.filter(
    diagnostic => diagnostic.severity === 'error'
  );
  const warnings = diagnostics.filter(
    diagnostic => diagnostic.severity === 'warning'
  );
  return {
    checked: !!typescript,
    valid: errors.length === 0,
    blocks: blocks.length,
    strictBlocks,
    checkedBlocks: typescript ? blocks.length : 0,
    typescriptAvailable: !!typescript,
    typescriptVersion: typescript ? String(typescript.version || '') : null,
    runtimeApiHash: sha256(runtimeDeclaration),
    projectApiHash: sha256(projectDeclaration),
    environmentDiagnostics,
    sourceDiagnostics,
    errors,
    warnings,
    diagnostics,
  };
};

export const validateProjectJavaScriptAuthoring = ({
  serializedProject,
  sourceFiles,
  runtimeApiDeclaration,
  projectApiDeclaration,
  typescript,
  compatibilityProfile,
}: Object): Object =>
  validateJavaScriptAuthoringBlocks({
    blocks: sourceFiles
      ? collectSourceFileJavaScriptBlocks(sourceFiles)
      : collectSerializedProjectJavaScriptBlocks(serializedProject),
    serializedProject,
    runtimeApiDeclaration,
    projectApiDeclaration,
    typescript,
    compatibilityProfile:
      compatibilityProfile ||
      buildInstalledStoreExtensionCompatibilityProfile(serializedProject),
  });

export const validateReviewedExtensionJavaScriptAuthoring = ({
  serializedExtension,
  registryHeader,
  runtimeApiDeclaration,
  projectApiDeclaration,
  typescript,
}: Object): Object => {
  const extensionName = String(
    (serializedExtension && serializedExtension.name) || ''
  );
  const registryName = String((registryHeader && registryHeader.name) || '');
  const registryVersion = String(
    (registryHeader && registryHeader.version) || ''
  );
  const contentHash = sha256(JSON.stringify(serializedExtension || {}));
  if (!extensionName || extensionName !== registryName || !registryVersion) {
    return {
      success: true,
      valid: false,
      policy: 'reviewed-store-extension',
      code: 'EXTENSION_STRICT_API_INCOMPATIBLE',
      extensionName,
      registryName,
      registryVersion,
      contentHash,
      errors: [
        {
          severity: 'error',
          code: 'EXTENSION_STRICT_API_INCOMPATIBLE',
          message:
            'The downloaded extension identity does not match the pinned registry header.',
        },
      ],
      warnings: [],
    };
  }

  const serializedProject = {
    layouts: [],
    externalEvents: [],
    eventsFunctionsExtensions: [serializedExtension],
    objects: [],
    variables: [],
    resources: { resources: [] },
  };
  const validation = validateProjectJavaScriptAuthoring({
    serializedProject,
    runtimeApiDeclaration,
    projectApiDeclaration,
    typescript,
    compatibilityProfile: {
      reviewedFileUriPrefixes: [
        `game://extensions/${encodeURIComponent(extensionName)}/`,
      ],
      provenance: {
        source: 'gdevelop-extension-registry',
        extensionName,
        registryVersion,
        contentHash,
      },
    },
  });
  const errors = (validation.errors || []).map(error => ({
    ...error,
    policyCode: 'EXTENSION_STRICT_API_INCOMPATIBLE',
    extensionName,
  }));
  return {
    success: true,
    valid: validation.valid,
    policy: 'reviewed-store-extension',
    code: validation.valid ? undefined : 'EXTENSION_STRICT_API_INCOMPATIBLE',
    extensionName,
    registryName,
    registryVersion,
    contentHash,
    provenanceVerified: true,
    generatedCodeRequired: true,
    validation: {
      ...validation,
      errors,
    },
    errors,
    warnings: validation.warnings || [],
  };
};

export const buildJavaScriptAuthoringArtifacts = (
  serializedProject: Object
): Object => {
  const runtimeApi = buildRuntimeApiDeclaration();
  const projectApi = buildProjectApiDeclaration(serializedProject, runtimeApi);
  const model = buildProjectApiModel(serializedProject);
  return {
    runtimeApi,
    projectApi,
    counts: {
      scenes: model.scenes.length,
      globalObjects: model.globalObjects.length,
      resources: model.resources.length,
      functions: model.functions.length,
    },
    hashes: {
      runtimeApi: sha256(runtimeApi),
      projectApi: sha256(projectApi),
    },
  };
};

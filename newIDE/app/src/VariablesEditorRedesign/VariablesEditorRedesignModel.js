// @flow
import { type ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { enumerateObjectVariableTabs } from '../VariablesList/UnifiedVariablesDialogTabs';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  type RedesignScope,
  type RedesignScopeTone,
  type RedesignVariable,
  type RedesignVariableType,
} from './VariablesEditorRedesignWindow';

const gd: libGDevelop = global.gd;

type VariablesEditorTarget = {|
  id: string,
  variablesContainer: gdVariablesContainer,
  objectName: string | null,
  initialInstances: gdInitialInstancesContainer | null,
  originalSerializedElement: gdSerializerElement,
  serializedVariablesById: Map<string, Object>,
|};

type ScopeDefinition = {|
  id: string,
  label: string,
  tone: RedesignScopeTone,
  variablesContainer: gdVariablesContainer,
  objectName: string | null,
  initialInstances: gdInitialInstancesContainer | null,
|};

export type VariablesEditorRedesignSession = {|
  title: string,
  project: gdProject,
  scopes: Array<RedesignScope>,
  variables: Array<RedesignVariable>,
  primaryScopeId: string,
  targets: Array<VariablesEditorTarget>,
  hasTemporaryChanges: boolean,
  released: boolean,
|};

const cloneObject = (object: Object): Object =>
  JSON.parse(JSON.stringify(object));

const getRedesignType = (serializedType: string): RedesignVariableType => {
  switch (serializedType) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return 'enum';
    case 'structure':
      return 'structure';
    case 'array':
      return 'array';
    case 'string':
    default:
      return 'text';
  }
};

const getSerializedType = (type: RedesignVariableType): string =>
  type === 'text' ? 'string' : type;

const serializedVariableToRedesignVariable = ({
  serializedVariable,
  name,
  scopeId,
  fallbackId,
  serializedVariablesById,
}: {|
  serializedVariable: Object,
  name: string,
  scopeId: string,
  fallbackId: string,
  serializedVariablesById: Map<string, Object>,
|}): RedesignVariable => {
  const id = serializedVariable.persistentUuid || fallbackId;
  serializedVariablesById.set(id, cloneObject(serializedVariable));

  const type = getRedesignType(serializedVariable.type || 'string');
  const variable: RedesignVariable = {
    id,
    scopeId,
    name,
    type,
  };

  if (type === 'structure' || type === 'array') {
    variable.children = (serializedVariable.children || []).map(
      (child, index) =>
        serializedVariableToRedesignVariable({
          serializedVariable: child,
          name: type === 'structure' ? child.name || '' : String(index),
          scopeId,
          fallbackId: `${fallbackId}/${index}`,
          serializedVariablesById,
        })
    );
  } else if (type === 'number') {
    variable.value = Number(serializedVariable.value || 0);
  } else if (type === 'boolean') {
    variable.value = !!serializedVariable.value;
  } else {
    variable.value =
      serializedVariable.value === undefined
        ? ''
        : String(serializedVariable.value);
  }

  return variable;
};

export const readVariablesFromContainer = ({
  variablesContainer,
  scopeId,
  serializedVariablesById,
}: {|
  variablesContainer: gdVariablesContainer,
  scopeId: string,
  serializedVariablesById?: Map<string, Object>,
|}): Array<RedesignVariable> => {
  const templates = serializedVariablesById || new Map();
  const variables = [];
  for (let index = 0; index < variablesContainer.count(); index++) {
    const variable = variablesContainer.getAt(index);
    variables.push(
      serializedVariableToRedesignVariable({
        serializedVariable: serializeToJSObject(variable),
        name: variablesContainer.getNameAt(index),
        scopeId,
        fallbackId: `${scopeId}/${index}`,
        serializedVariablesById: templates,
      })
    );
  }
  return variables;
};

const generatePersistentUuids = (serializedVariable: Object): Object => {
  const variable = new gd.Variable();
  try {
    unserializeFromJSObject(variable, serializedVariable);
    variable.resetPersistentUuid();
    return serializeToJSObject(variable);
  } finally {
    variable.delete();
  }
};

const redesignVariableToSerializedVariable = ({
  variable,
  serializedVariablesById,
}: {|
  variable: RedesignVariable,
  serializedVariablesById: Map<string, Object>,
|}): Object => {
  const template = serializedVariablesById.get(variable.id);
  let serializedVariable: any = template ? cloneObject(template) : {};
  serializedVariable.type = getSerializedType(variable.type);

  if (variable.type === 'structure' || variable.type === 'array') {
    delete serializedVariable.value;
    delete serializedVariable.values;
    serializedVariable.children = (variable.children || []).map(child => {
      const serializedChild = redesignVariableToSerializedVariable({
        variable: child,
        serializedVariablesById,
      });
      if (variable.type === 'structure') {
        serializedChild.name = child.name;
      } else {
        delete serializedChild.name;
      }
      return serializedChild;
    });
  } else {
    delete serializedVariable.children;
    if (variable.type === 'number') {
      const value = Number(variable.value);
      serializedVariable.value = Number.isFinite(value) ? value : 0;
    } else if (variable.type === 'boolean') {
      serializedVariable.value = !!variable.value;
    } else {
      serializedVariable.value =
        variable.value === undefined ? '' : String(variable.value);
    }

    if (variable.type === 'enum') {
      const existingValues = Array.isArray(serializedVariable.values)
        ? serializedVariable.values
        : [];
      if (
        serializedVariable.value &&
        !existingValues.includes(serializedVariable.value)
      ) {
        serializedVariable.values = [
          ...existingValues,
          serializedVariable.value,
        ];
      } else {
        serializedVariable.values = existingValues;
      }
    } else {
      delete serializedVariable.values;
    }
  }

  // Existing entries keep their UUID so WholeProjectRefactorer can recognize
  // renames. New entries receive UUIDs from the same native implementation as
  // the legacy editor, including all newly-created descendants.
  if (!serializedVariable.persistentUuid) {
    serializedVariable = generatePersistentUuids(serializedVariable);
  }
  return serializedVariable;
};

const validateSiblings = (
  variables: Array<RedesignVariable>,
  scopeLabel: string
): void => {
  const names: Set<string> = new Set();
  for (const variable of variables) {
    const name = variable.name.trim();
    if (!name) {
      throw new Error(`A variable in ${scopeLabel} has an empty name.`);
    }
    if (names.has(name)) {
      throw new Error(
        `The variable name "${name}" is used more than once in ${scopeLabel}.`
      );
    }
    names.add(name);
    if (variable.type === 'structure') {
      validateSiblings(variable.children || [], `the structure "${name}"`);
    }
  }
};

export const writeVariablesToContainer = ({
  variablesContainer,
  variables,
  serializedVariablesById,
}: {|
  variablesContainer: gdVariablesContainer,
  variables: Array<RedesignVariable>,
  serializedVariablesById: Map<string, Object>,
|}): void => {
  variablesContainer.clear();
  variables.forEach((variable, index) => {
    const nativeVariable = new gd.Variable();
    try {
      unserializeFromJSObject(
        nativeVariable,
        redesignVariableToSerializedVariable({
          variable,
          serializedVariablesById,
        })
      );
      variablesContainer.insert(variable.name.trim(), nativeVariable, index);
    } finally {
      nativeVariable.delete();
    }
  });
};

export const getVariablesEditorRedesignTitle = (scope: any): string => {
  if (scope.layout) return `Variables in Scene: ${scope.layout.getName()}`;
  if (scope.eventsFunction)
    return `Variables in Function: ${scope.eventsFunction.getName()}`;
  if (scope.eventsBasedBehavior)
    return `Variables in Behavior: ${scope.eventsBasedBehavior.getName()}`;
  if (scope.eventsBasedObject)
    return `Variables in Prefab: ${scope.eventsBasedObject.getName()}`;
  if (scope.eventsFunctionsExtension)
    return `Variables in Extension: ${scope.eventsFunctionsExtension.getName()}`;
  return 'Variables';
};

export const createVariablesEditorRedesignSession = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor
): VariablesEditorRedesignSession => {
  const scope = projectScopedContainersAccessor.getScope();
  const {
    project,
    layout,
    eventsFunctionsExtension,
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunction,
  } = scope;
  const initialInstances =
    (layout && layout.getInitialInstances()) ||
    (eventsBasedObject && eventsBasedObject.getInitialInstances()) ||
    null;

  const scopeDefinitions: Array<ScopeDefinition> = [];
  if (eventsBasedBehavior) {
    scopeDefinitions.push({
      id: 'behavior-variables',
      label: 'Behavior',
      tone: 'behavior',
      variablesContainer: eventsBasedBehavior.getVariables(),
      objectName: null,
      initialInstances: null,
    });
  }
  if (eventsBasedObject) {
    scopeDefinitions.push({
      id: 'prefab-variables',
      label: 'Prefab',
      tone: 'prefab',
      variablesContainer: eventsBasedObject.getVariables(),
      objectName: null,
      initialInstances: null,
    });
  }

  const sceneVariables = layout
    ? layout.getVariables()
    : eventsFunctionsExtension
    ? eventsFunctionsExtension.getSceneVariables()
    : null;
  const globalVariables = layout
    ? project.getVariables()
    : eventsFunctionsExtension
    ? eventsFunctionsExtension.getGlobalVariables()
    : null;
  const extensionPrefix =
    !layout && eventsFunctionsExtension
      ? `[${eventsFunctionsExtension.getName()}] `
      : '';

  if (sceneVariables) {
    scopeDefinitions.push({
      id: 'scene-variables',
      label: `${extensionPrefix}Scene`,
      tone: 'scene',
      variablesContainer: sceneVariables,
      objectName: null,
      initialInstances: null,
    });
  }
  if (globalVariables) {
    scopeDefinitions.push({
      id: 'global-variables',
      label: `${extensionPrefix}Global`,
      tone: 'global',
      variablesContainer: globalVariables,
      objectName: null,
      initialInstances: null,
    });
  }

  const prefabObjectType =
    eventsFunctionsExtension && eventsBasedObject && !eventsFunction
      ? `${eventsFunctionsExtension.getName()}::${eventsBasedObject.getName()}`
      : null;
  const objectVariableTabs = enumerateObjectVariableTabs({
    projectScopedContainersAccessor,
    initialInstances,
    shouldIncludeObject: object =>
      !prefabObjectType ||
      object.getName() !== 'Object' ||
      object.getType() !== prefabObjectType,
  });
  objectVariableTabs.forEach(
    ({ id, objectName, variablesContainer, initialInstances }) => {
      scopeDefinitions.push({
        id,
        label: objectName,
        tone: 'object',
        variablesContainer,
        objectName,
        initialInstances,
      });
    }
  );

  const targets: Array<VariablesEditorTarget> = [];
  const variables: Array<RedesignVariable> = [];
  try {
    scopeDefinitions.forEach(definition => {
      const originalSerializedElement = new gd.SerializerElement();
      const serializedVariablesById: Map<string, Object> = new Map();
      targets.push({
        id: definition.id,
        variablesContainer: definition.variablesContainer,
        objectName: definition.objectName,
        initialInstances: definition.initialInstances,
        originalSerializedElement,
        serializedVariablesById,
      });
      definition.variablesContainer.resetPersistentUuid();
      definition.variablesContainer.serializeTo(originalSerializedElement);
      variables.push(
        ...readVariablesFromContainer({
          variablesContainer: definition.variablesContainer,
          scopeId: definition.id,
          serializedVariablesById,
        })
      );
    });
  } catch (error) {
    targets.forEach(target => {
      try {
        target.variablesContainer.clearPersistentUuid();
      } catch (cleanupError) {
        // The source scope can be destroyed while its external window closes.
      } finally {
        target.originalSerializedElement.delete();
      }
    });
    throw error;
  }

  return {
    title: getVariablesEditorRedesignTitle(scope),
    project,
    scopes: scopeDefinitions.map(({ id, label, tone }) => ({
      id,
      label,
      tone,
    })),
    variables,
    primaryScopeId: scopeDefinitions.length ? scopeDefinitions[0].id : '',
    targets,
    hasTemporaryChanges: false,
    released: false,
  };
};

const restoreOriginalContainers = (
  session: VariablesEditorRedesignSession
): void => {
  session.targets.forEach(target => {
    target.variablesContainer.unserializeFrom(target.originalSerializedElement);
  });
  session.hasTemporaryChanges = false;
};

const validateSessionVariables = (
  session: VariablesEditorRedesignSession,
  variables: Array<RedesignVariable>
): void => {
  session.targets.forEach(target => {
    const scope = session.scopes.find(scope => scope.id === target.id);
    validateSiblings(
      variables.filter(variable => variable.scopeId === target.id),
      scope ? `the ${scope.label} scope` : 'this scope'
    );
  });
};

const writeSessionVariables = (
  session: VariablesEditorRedesignSession,
  variables: Array<RedesignVariable>
): void => {
  session.targets.forEach(target => {
    writeVariablesToContainer({
      variablesContainer: target.variablesContainer,
      variables: variables.filter(variable => variable.scopeId === target.id),
      serializedVariablesById: target.serializedVariablesById,
    });
  });
  session.hasTemporaryChanges = true;
};

const releaseSession = (session: VariablesEditorRedesignSession): void => {
  if (session.released) return;
  session.released = true;
  session.targets.forEach(target => {
    try {
      target.variablesContainer.clearPersistentUuid();
    } catch (cleanupError) {
      // The source scope can be destroyed while its external window closes.
    } finally {
      target.originalSerializedElement.delete();
    }
  });
};

export const cancelVariablesEditorRedesignSession = (
  session: VariablesEditorRedesignSession
): void => {
  if (session.released) return;
  if (session.hasTemporaryChanges) restoreOriginalContainers(session);
  releaseSession(session);
};

export const previewVariablesEditorRedesignSession = ({
  session,
  variables,
}: {|
  session: VariablesEditorRedesignSession,
  variables: Array<RedesignVariable>,
|}): void => {
  if (session.released) return;
  validateSessionVariables(session, variables);
  try {
    writeSessionVariables(session, variables);
  } catch (error) {
    restoreOriginalContainers(session);
    throw error;
  }
};

export const applyVariablesEditorRedesignSession = ({
  session,
  variables,
}: {|
  session: VariablesEditorRedesignSession,
  variables: Array<RedesignVariable>,
|}): void => {
  if (session.released) return;

  validateSessionVariables(session, variables);

  try {
    writeSessionVariables(session, variables);
  } catch (error) {
    restoreOriginalContainers(session);
    throw error;
  }

  try {
    session.targets.forEach(target => {
      const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
        target.originalSerializedElement,
        target.variablesContainer
      );
      if (target.objectName && target.initialInstances) {
        gd.WholeProjectRefactorer.applyRefactoringForObjectVariablesContainer(
          session.project,
          target.variablesContainer,
          target.initialInstances,
          target.objectName,
          changeset,
          target.originalSerializedElement
        );
      } else {
        gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
          session.project,
          target.variablesContainer,
          changeset,
          target.originalSerializedElement
        );
      }
    });
  } finally {
    releaseSession(session);
  }
};

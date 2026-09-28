// @flow
import { enumerateVariablesOfContainersList } from '../EventsSheet/ParameterFields/EnumerateVariables';
import { getVariableSourceFromIdentifier } from '../EventsSheet/ParameterFields/AnyVariableField';
import { getObjectOrGroupVariablesContainers } from '../EventsSheet/ParameterFields/ObjectVariableField';
import { variableNamesSort } from './WatchedItems';

const gd: libGDevelop = global.gd;

/** A variable that can be chosen to be watched. */
export type WatchableVariable = {|
  name: string,
  sourceType: VariablesContainer_SourceType,
|};

/** The root of a variable path: `Player` for `Player.Life[0]`. */
const getRootIdentifier = (expression: string): string =>
  expression.split(/[.[]/)[0].trim();

/**
 * Whether the expression can be read as the given type ("number", "string")
 * without a fatal error.
 */
const isExpressionValidAs = (
  type: 'number' | 'string',
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): boolean => {
  const validator = new gd.ExpressionValidator(
    gd.JsPlatform.get(),
    projectScopedContainers,
    type,
    '',
    ''
  );
  const parser = new gd.ExpressionParser2();
  try {
    const expressionNode = parser.parseExpression(expression);
    expressionNode.get().visit(validator);
    return validator.getFatalErrors().size() === 0;
  } finally {
    validator.delete();
    parser.delete();
  }
};

const getWatchedVariableSourceTypeOrThrow = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): VariablesContainer_SourceType => {
  if (
    projectScopedContainers
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(getRootIdentifier(expression))
  ) {
    return gd.VariablesContainer.Object;
  }
  return getVariableSourceFromIdentifier(expression, projectScopedContainers);
};

/**
 * Where a watched variable comes from: an object (or group) variable when its
 * root is an object, a scene/global/local variable otherwise.
 */
export const getWatchedVariableSourceType = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers | null
): VariablesContainer_SourceType => {
  if (!projectScopedContainers) return gd.VariablesContainer.Unknown;
  try {
    return getWatchedVariableSourceTypeOrThrow(
      expression,
      projectScopedContainers
    );
  } catch (error) {
    console.error(
      `Unable to find where the variable "${expression}" comes from:`,
      error
    );
    return gd.VariablesContainer.Unknown;
  }
};

const getWatchedExpressionTypeOrThrow = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): string => {
  const isVariablePath =
    !expression.includes('(') &&
    getWatchedVariableSourceType(expression, projectScopedContainers) !==
      gd.VariablesContainer.Unknown;
  if (isVariablePath) return 'variable';

  return isExpressionValidAs('number', expression, projectScopedContainers)
    ? 'number'
    : 'string';
};

/**
 * How to evaluate a watched expression: as a variable when it's a path to a
 * known variable, as a number or a string (whichever is valid) otherwise.
 */
export const getWatchedExpressionType = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): string => {
  try {
    return getWatchedExpressionTypeOrThrow(expression, projectScopedContainers);
  } catch (error) {
    console.error(
      `Unable to determine the type of "${expression}", read as a text:`,
      error
    );
    return 'string';
  }
};

/**
 * Whether the platform can read the expression at all: an expression naming
 * something that does not exist is generated as the default value of its
 * type, a `0` or an empty text that reads as a real value.
 */
export const isWatchedExpressionValid = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): boolean => {
  try {
    const type = getWatchedExpressionTypeOrThrow(
      expression,
      projectScopedContainers
    );
    // A variable path was resolved against the project: it exists.
    if (type === 'variable' || type === 'number') return true;
    // Read as a text only because it is not a valid number: it still has to
    // be a valid text.
    return isExpressionValidAs('string', expression, projectScopedContainers);
  } catch (error) {
    console.error(`Unable to validate "${expression}":`, error);
    // Shown as it is rather than struck through on a doubt.
    return true;
  }
};

/** Names of the variables of a container (`Object.Variable` with a prefix). */
const getVariableNames = (
  variablesContainer: gdVariablesContainer,
  prefix: string = ''
): Array<string> => {
  const names: Array<string> = [];
  for (let index = 0; index < variablesContainer.count(); index++) {
    names.push(prefix + variablesContainer.getNameAt(index));
  }
  return names;
};

/**
 * Variables of the objects and groups of a container: `Object.Variable`. A
 * group has the variables shared by all its objects, wherever they are
 * declared (the scene or the project).
 */
const getObjectsVariableNames = (
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer,
  sceneObjectsContainer: gdObjectsContainer
): Array<string> => {
  const objectOrGroupNames: Array<string> = [];
  for (let index = 0; index < objectsContainer.getObjectsCount(); index++) {
    objectOrGroupNames.push(objectsContainer.getObjectAt(index).getName());
  }
  const groups = objectsContainer.getObjectGroups();
  for (let index = 0; index < groups.count(); index++) {
    objectOrGroupNames.push(groups.getAt(index).getName());
  }

  const names: Array<string> = [];
  objectOrGroupNames.forEach(objectOrGroupName => {
    const variableNamesOfEachObject = getObjectOrGroupVariablesContainers(
      globalObjectsContainer,
      sceneObjectsContainer,
      objectOrGroupName
    ).map(variablesContainer => getVariableNames(variablesContainer));
    if (variableNamesOfEachObject.length === 0) return;
    const [
      firstObjectVariableNames,
      ...otherObjectsVariableNames
    ] = variableNamesOfEachObject;
    firstObjectVariableNames
      .filter(name =>
        otherObjectsVariableNames.every(objectVariableNames =>
          objectVariableNames.includes(name)
        )
      )
      .forEach(name => names.push(objectOrGroupName + '.' + name));
  });
  return names;
};

/** Local variables declared on the events (at any depth) of a list. */
const getLocalVariableNames = (events: gdEventsList): Array<string> => {
  const names: Array<string> = [];
  for (let index = 0; index < events.getEventsCount(); index++) {
    const event = events.getEventAt(index);
    if (event.hasVariables())
      names.push(...getVariableNames(event.getVariables()));
    if (event.canHaveSubEvents()) {
      names.push(...getLocalVariableNames(event.getSubEvents()));
    }
  }
  return names;
};

/**
 * The variables that can be chosen to be watched, sorted by name: the global
 * variables, then (unless only them are asked for) the scene variables, the
 * object variables and the local variables of the events of the scene.
 */
export const getWatchableVariables = ({
  project,
  layout,
  projectScopedContainers,
  isGlobalOnly,
}: {|
  project: gdProject,
  layout: ?gdLayout,
  projectScopedContainers: ?gdProjectScopedContainers,
  isGlobalOnly: boolean,
|}): Array<WatchableVariable> => {
  const variables: Map<string, WatchableVariable> = new Map();
  const add = (name: string, sourceType: VariablesContainer_SourceType) => {
    if (!variables.has(name)) variables.set(name, { name, sourceType });
  };

  // Global variables are always available.
  getVariableNames(project.getVariables()).forEach(name =>
    add(name, gd.VariablesContainer.Global)
  );

  if (!isGlobalOnly) {
    if (!projectScopedContainers || !layout) return [];
    enumerateVariablesOfContainersList(
      projectScopedContainers.getVariablesContainersList()
    ).forEach(variable => {
      if (variable.source !== gd.VariablesContainer.Global) {
        add(variable.name, variable.source);
      }
    });
    [
      ...getObjectsVariableNames(
        project.getObjects(),
        project.getObjects(),
        layout.getObjects()
      ),
      ...getObjectsVariableNames(
        layout.getObjects(),
        project.getObjects(),
        layout.getObjects()
      ),
    ].forEach(name => add(name, gd.VariablesContainer.Object));
    getLocalVariableNames(layout.getEvents()).forEach(name =>
      add(name, gd.VariablesContainer.Local)
    );
  }

  return Array.from(variables.values()).sort((first, second) =>
    variableNamesSort(first.name, second.name)
  );
};

// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from './i18n/MessageDescriptor.flow';
import { type ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import {
  formatCubicBezier,
  getBuiltInEasingFunction,
  parseCubicBezierOrNull,
  type CubicBezierPoints,
} from './Easings';

const gd: libGDevelop = global.gd;

/**
 * Return the unquoted string if `value` is a quoted literal with no inner
 * quotes. Expressions (`"a" + "b"`, `VariableString(...)`) return null.
 */
export const getQuotedStringLiteralOrNull = (value: string): ?string => {
  if (value.length < 2 || value[0] !== '"' || value[value.length - 1] !== '"') {
    return null;
  }
  const literal = value.substring(1, value.length - 1);
  if (literal.indexOf('"') !== -1) return null;
  return literal;
};

const quoteEasingName = (name: string): string => `"${name}"`;

/**
 * Only "easing" parameters resolve named easings when the game runs, not the
 * "stringWithSelector" ones that are displayed as easings.
 */
export const canUseNamedEasings = (
  parameterMetadata: ?gdParameterMetadata
): boolean => !!parameterMetadata && parameterMetadata.getType() === 'easing';

export const getNamedEasingsContainerFromAccessor = (
  projectScopedContainersAccessor: ?ProjectScopedContainersAccessor
): ?gdNamedEasingsContainer =>
  projectScopedContainersAccessor
    ? projectScopedContainersAccessor.get().getNamedEasings()
    : null;

const getScopeEventsFunctionsExtensionOrNull = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor
): ?gdEventsFunctionsExtension => {
  const { project } = projectScopedContainersAccessor.getScope();
  const extensionName = projectScopedContainersAccessor
    .get()
    .getScopeExtensionName();
  return extensionName &&
    project.hasEventsFunctionsExtensionNamed(extensionName)
    ? project.getEventsFunctionsExtension(extensionName)
    : null;
};

const getMutableNamedEasingsContainer = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor
): gdNamedEasingsContainer => {
  const eventsFunctionsExtension = getScopeEventsFunctionsExtensionOrNull(
    projectScopedContainersAccessor
  );
  return eventsFunctionsExtension
    ? eventsFunctionsExtension.getNamedEasings()
    : projectScopedContainersAccessor.getScope().project.getNamedEasings();
};

export const getNamedEasingNames = (
  container: ?gdNamedEasingsContainer
): Array<string> => {
  if (!container) return [];
  const names = [];
  const count = container.getNamedEasingsCount();
  for (let index = 0; index < count; index++) {
    names.push(container.getNamedEasingAt(index).getName());
  }
  return names;
};

export const getNamedEasingPointsOrNull = (
  container: ?gdNamedEasingsContainer,
  name: string
): ?CubicBezierPoints => {
  if (!container || !container.hasNamedEasingNamed(name)) return null;
  const namedEasing = container.getNamedEasing(name);
  return [
    namedEasing.getX1(),
    namedEasing.getY1(),
    namedEasing.getX2(),
    namedEasing.getY2(),
  ];
};

export const getNamedEasingPointsByName = (
  container: ?gdNamedEasingsContainer
): { [string]: CubicBezierPoints } => {
  const pointsByName: { [string]: CubicBezierPoints } = {};
  getNamedEasingNames(container).forEach(name => {
    const points = getNamedEasingPointsOrNull(container, name);
    if (points) pointsByName[name] = points;
  });
  return pointsByName;
};

/** Named easings first, then the built-in ones. */
export const getEasingChoicesWithNamedEasings = (
  builtInChoices: Array<string>,
  namedEasingNames: Array<string>
): Array<string> =>
  namedEasingNames.concat(
    builtInChoices.filter(name => namedEasingNames.indexOf(name) === -1)
  );

/**
 * Identifier `EasingPreview` / `getEasingFunction` can draw: a built-in name,
 * a `cubic-bezier(...)` string, or the stored points of a named easing.
 */
export const getEasingPreviewIdentifier = (
  easingName: string,
  namedEasingPointsByName: { [string]: CubicBezierPoints }
): string => {
  const points = namedEasingPointsByName[easingName];
  return points ? formatCubicBezier(points) : easingName;
};

/**
 * Return the name of an existing named easing with the same rounded
 * cubic-bezier points, or null if none.
 */
export const findNamedEasingNameWithSamePoints = (
  points: CubicBezierPoints,
  namedEasingPointsByName: { [string]: CubicBezierPoints },
  ignoredName?: string
): ?string => {
  const identifier = formatCubicBezier(points);
  const names = Object.keys(namedEasingPointsByName);
  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    if (ignoredName && name === ignoredName) continue;
    if (formatCubicBezier(namedEasingPointsByName[name]) === identifier) {
      return name;
    }
  }
  return null;
};

export const validateNamedEasingName = (
  name: string,
  {
    existingNames,
    ignoredName,
  }: {| existingNames: Array<string>, ignoredName?: string |}
): ?MessageDescriptor => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return t`The name cannot be empty.`;
  }
  if (getBuiltInEasingFunction(trimmedName)) {
    return t`This name is already used by a built-in easing.`;
  }
  if (parseCubicBezierOrNull(trimmedName)) {
    return t`A named easing cannot be a cubic-bezier(...) value.`;
  }
  if (!gd.Project.isNameSafe(trimmedName)) {
    return t`The name can only contain letters, digits and underscores, and cannot start with a digit.`;
  }
  if (ignoredName && trimmedName === ignoredName) {
    return null;
  }
  if (existingNames.indexOf(trimmedName) !== -1) {
    return t`A named easing with this name already exists.`;
  }
  return null;
};

export const getUnknownEasingWarning = (
  value: string,
  namedEasingNames: Array<string>
): ?MessageDescriptor => {
  const literal = getQuotedStringLiteralOrNull(value);
  if (!literal) return null;
  if (getBuiltInEasingFunction(literal)) return null;
  if (parseCubicBezierOrNull(literal)) return null;
  if (namedEasingNames.indexOf(literal) !== -1) return null;
  return t`This named easing is not defined in this scope.`;
};

const applyPoints = (namedEasing: gdNamedEasing, points: CubicBezierPoints) => {
  namedEasing.setX1(points[0]);
  namedEasing.setY1(points[1]);
  namedEasing.setX2(points[2]);
  namedEasing.setY2(points[3]);
};

const renameNamedEasingInEvents = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  oldName: string,
  newName: string
) => {
  const { project } = projectScopedContainersAccessor.getScope();
  const eventsFunctionsExtension = getScopeEventsFunctionsExtensionOrNull(
    projectScopedContainersAccessor
  );
  if (eventsFunctionsExtension) {
    gd.WholeProjectRefactorer.renameNamedEasingInEventsFunctionsExtension(
      project,
      eventsFunctionsExtension,
      oldName,
      newName
    );
  } else {
    gd.WholeProjectRefactorer.renameNamedEasing(project, oldName, newName);
  }
};

export const insertNamedEasing = ({
  projectScopedContainersAccessor,
  name,
  points,
  onChange,
  triggerUnsavedChanges,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  name: string,
  points: CubicBezierPoints,
  onChange: string => void,
  triggerUnsavedChanges: () => void,
|}) => {
  const container = getMutableNamedEasingsContainer(
    projectScopedContainersAccessor
  );
  const namedEasing = container.insertNewNamedEasing(
    name,
    container.getNamedEasingsCount()
  );
  applyPoints(namedEasing, points);
  onChange(quoteEasingName(name));
  triggerUnsavedChanges();
};

export const applyNamedEasingDefinition = ({
  projectScopedContainersAccessor,
  oldName,
  newName,
  points,
  currentValue,
  onChange,
  triggerUnsavedChanges,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  oldName: string,
  newName: string,
  points: CubicBezierPoints,
  currentValue: string,
  onChange: string => void,
  triggerUnsavedChanges: () => void,
|}) => {
  const container = getMutableNamedEasingsContainer(
    projectScopedContainersAccessor
  );
  if (!container.hasNamedEasingNamed(oldName)) return;
  const namedEasing = container.getNamedEasing(oldName);
  applyPoints(namedEasing, points);
  if (newName !== oldName) {
    namedEasing.setName(newName);
    renameNamedEasingInEvents(
      projectScopedContainersAccessor,
      oldName,
      newName
    );
    if (currentValue === quoteEasingName(oldName)) {
      onChange(quoteEasingName(newName));
    }
  }
  triggerUnsavedChanges();
};

export const deleteNamedEasing = ({
  projectScopedContainersAccessor,
  name,
  triggerUnsavedChanges,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  name: string,
  triggerUnsavedChanges: () => void,
|}) => {
  const container = getMutableNamedEasingsContainer(
    projectScopedContainersAccessor
  );
  if (!container.hasNamedEasingNamed(name)) return;
  container.removeNamedEasing(name);
  triggerUnsavedChanges();
};

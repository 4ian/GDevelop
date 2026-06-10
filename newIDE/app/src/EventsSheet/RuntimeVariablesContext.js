// @flow
import * as React from 'react';

// Mirrors the internals of gdjs.Variable (same shape as in VariablesContainerInspector).
export type RuntimeVariable = {
  _type: 'string' | 'number' | 'boolean' | 'structure' | 'array',
  _str: string,
  _value: number,
  _bool: boolean,
  _children: { [string]: RuntimeVariable },
  _childrenArray: Array<RuntimeVariable>,
};

export type RuntimeVariablesMap = {|
  global: { [string]: RuntimeVariable },
  scene: { [string]: RuntimeVariable },
  extensionGlobal: { [string]: { [string]: RuntimeVariable } },
  extensionScene: { [string]: { [string]: RuntimeVariable } },
  // Keyed by scene code namespace; stack walked top-down so inner scopes
  // shadow outer ones. Extension function locals are omitted (unreachable from globals).
  localByCodeNamespace: { [string]: Array<{ [string]: RuntimeVariable }> },
  // First live instance per object name in the calling container.
  object: { [string]: { [string]: RuntimeVariable } },
|};

const RuntimeVariablesContext: React.Context<RuntimeVariablesMap | null> = React.createContext<RuntimeVariablesMap | null>(
  null
);

const extractExtensionVarsFromMap = (
  extMap: any
): { [string]: { [string]: RuntimeVariable } } => {
  if (!extMap || typeof extMap !== 'object') return {};
  const result: { [string]: { [string]: RuntimeVariable } } = {};
  for (const extName in extMap) {
    const items = extMap[extName]?._variables?.items;
    if (items) result[extName] = items;
  }
  return result;
};

const extractLocalsFromMessage = (
  rawLocal: any
): { [string]: Array<{ [string]: RuntimeVariable }> } => {
  const result: { [string]: Array<{ [string]: RuntimeVariable }> } = {};
  if (!rawLocal || typeof rawLocal !== 'object') return result;
  for (const codeNs in rawLocal) {
    const containers = rawLocal[codeNs];
    if (!Array.isArray(containers)) continue;
    const stack: Array<{ [string]: RuntimeVariable }> = [];
    for (const container of containers) {
      const items = container?._variables?.items;
      if (items && typeof items === 'object') stack.push(items);
    }
    if (stack.length > 0) result[codeNs] = stack;
  }
  return result;
};

// Accepts the full parsed dump message (`{ command, payload, activeLocalVariables? }`).
// Passing `payload` alone still works for the `global`/`scene`/extension maps;
// only `localByCodeNamespace` needs the top-level `activeLocalVariables` field.
export const extractVariablesFromDump = (
  message: any
): RuntimeVariablesMap | null => {
  if (!message) return null;
  const payload = message.payload || message;

  const globalVars = payload._variables?._variables?.items || {};
  const sceneStack = payload._sceneStack?._stack;
  const currentScene =
    Array.isArray(sceneStack) && sceneStack.length > 0
      ? sceneStack[sceneStack.length - 1]
      : null;
  const sceneVars = currentScene?._variables?._variables?.items || {};

  const extensionGlobal = extractExtensionVarsFromMap(
    payload._variablesByExtensionName
  );
  const extensionScene = extractExtensionVarsFromMap(
    currentScene?._variablesByExtensionName
  );
  const localByCodeNamespace = extractLocalsFromMessage(
    message.activeLocalVariables
  );

  const object: { [string]: { [string]: RuntimeVariable } } = {};
  const rawObjectVars = currentScene?.objectVariablesByName;
  if (rawObjectVars && typeof rawObjectVars === 'object') {
    for (const objName in rawObjectVars) {
      const items = rawObjectVars[objName]?._variables?.items;
      if (items) object[objName] = items;
    }
  }

  return {
    global: globalVars,
    scene: sceneVars,
    extensionGlobal,
    extensionScene,
    localByCodeNamespace,
    object,
  };
};

export const lookupVariable = (
  map: RuntimeVariablesMap,
  scope: 'global' | 'scene' | 'local' | 'object' | 'any',
  varPath: string,
  extensionName?: string,
  codeNamespace?: string,
  objectName?: ?string
): RuntimeVariable | null => {
  const parts = varPath.split('.');
  const rootName = parts[0];

  let variable: RuntimeVariable | null = null;
  let childPathStart = 1;

  if (scope === 'object' && objectName) {
    const objectVars = map.object[objectName];
    if (objectVars) {
      variable = objectVars[rootName] || null;
    }
  } else {
    // Locals first so that they shadow scene/global vars with the same name
    // (matches the runtime's "inner scope wins" resolution).
    if ((scope === 'local' || scope === 'any') && codeNamespace) {
      const stack = map.localByCodeNamespace[codeNamespace];
      if (stack) {
        for (let i = stack.length - 1; i >= 0 && !variable; i--) {
          variable = stack[i][rootName] || null;
        }
      }
    }

    if (!variable && extensionName) {
      if (scope === 'scene' || scope === 'any') {
        variable = map.extensionScene[extensionName]?.[rootName] || null;
      }
      if (!variable && (scope === 'global' || scope === 'any')) {
        variable = map.extensionGlobal[extensionName]?.[rootName] || null;
      }
    }

    if (!variable && (scope === 'scene' || scope === 'any')) {
      variable = map.scene[rootName] || null;
    }
    if (!variable && (scope === 'global' || scope === 'any')) {
      variable = map.global[rootName] || null;
    }
  }

  if (!variable) return null;

  for (let i = childPathStart; i < parts.length; i++) {
    if (!variable) return null;
    if (variable._type === 'structure' && variable._children) {
      variable = variable._children[parts[i]] || null;
    } else {
      return null;
    }
  }

  return variable;
};

const formatNumber = (n: number): string => {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const formatVariableInternal = (
  variable: RuntimeVariable,
  indent: string
): string => {
  switch (variable._type) {
    case 'number':
      return formatNumber(variable._value);
    case 'string':
      return `"${variable._str}"`;
    case 'boolean':
      return String(variable._bool);
    case 'structure': {
      const children = variable._children || {};
      const keys = Object.keys(children);
      if (keys.length === 0) return '{}';
      const childIndent = indent + '  ';
      const entries = keys.map(
        key =>
          `${childIndent}${key}: ${formatVariableInternal(
            children[key],
            childIndent
          )}`
      );
      return `{\n${entries.join(',\n')}\n${indent}}`;
    }
    case 'array': {
      const items = variable._childrenArray || [];
      if (items.length === 0) return '[]';
      const childIndent = indent + '  ';
      const formatted = items.map(
        item => `${childIndent}${formatVariableInternal(item, childIndent)}`
      );
      return `[\n${formatted.join(',\n')}\n${indent}]`;
    }
    default:
      return '?';
  }
};

export const formatVariableValue = (variable: RuntimeVariable): string => {
  return formatVariableInternal(variable, '');
};

export default RuntimeVariablesContext;

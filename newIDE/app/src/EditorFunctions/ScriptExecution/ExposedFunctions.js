// @flow
import { type ExposedScriptFunction } from './ScriptRunner';
import { NON_SCRIPTABLE_FUNCTION_NAMES } from './NonScriptableFunctionNames';
import { type LaunchFunctionCollaborators } from '..';

/**
 * Builds the list of editor functions exposed to a `run_script` script, from
 * the same `editorFunctions` registry and collaborators bag that
 * `EditorFunctionCallRunner` uses — so a call made inside a script behaves
 * exactly like the equivalent tool call (same implementation, same
 * `on*ModifiedOutsideEditor` callbacks, same `modifiesProject` flag).
 */

// Inexact (trailing `...`) so the real `EditorFunction` / `EditorFunctionWithoutProject`
// (which also carry `renderForEditor`) are assignable in this exact-by-default repo.
type EditorFunctionLike = {
  +launchFunction: (options: any) => Promise<any>,
  +modifiesProject: boolean,
  ...
};

export const buildExposedScriptFunctions = ({
  editorFunctions,
  editorFunctionsWithoutProject,
  launchOptions,
  project,
  allowedFunctionNames,
}: {|
  // Covariant indexers so the real registries (`{ [string]: EditorFunction }`,
  // whose values carry extra fields like `renderForEditor`) are assignable.
  editorFunctions: { +[string]: EditorFunctionLike },
  editorFunctionsWithoutProject: { +[string]: EditorFunctionLike },
  launchOptions: LaunchFunctionCollaborators,
  project: ?gdProject,
  // When provided (the backend-declared function list for the agent/version),
  // only these functions are exposed. Otherwise all scriptable client-side
  // functions are exposed (see NON_SCRIPTABLE_FUNCTION_NAMES).
  allowedFunctionNames?: ?Array<string>,
|}): Array<ExposedScriptFunction> => {
  const allowedSet = allowedFunctionNames
    ? new Set(allowedFunctionNames)
    : null;

  const isExposed = (name: string): boolean => {
    if (NON_SCRIPTABLE_FUNCTION_NAMES.has(name)) return false;
    if (allowedSet && !allowedSet.has(name)) return false;
    return true;
  };

  const exposedFunctions: Array<ExposedScriptFunction> = [];

  for (const name of Object.keys(editorFunctions)) {
    if (!isExposed(name)) continue;
    const editorFunction = editorFunctions[name];
    exposedFunctions.push({
      name,
      modifiesProject: !!editorFunction.modifiesProject,
      launch: (args: any) =>
        editorFunction.launchFunction({ ...launchOptions, args, project }),
    });
  }

  for (const name of Object.keys(editorFunctionsWithoutProject)) {
    // A with-project function of the same name takes precedence (already added).
    if (!isExposed(name)) continue;
    if (editorFunctions[name]) continue;
    const editorFunctionWithoutProject = editorFunctionsWithoutProject[name];
    exposedFunctions.push({
      name,
      modifiesProject: !!editorFunctionWithoutProject.modifiesProject,
      launch: (args: any) =>
        editorFunctionWithoutProject.launchFunction({ ...launchOptions, args }),
    });
  }

  return exposedFunctions;
};

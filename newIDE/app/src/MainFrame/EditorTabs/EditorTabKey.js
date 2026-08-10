// @flow
import { type EditorKind } from './EditorTabsHandler';

const editorKindsWithProjectItemNames: Array<EditorKind> = [
  'layout',
  'layout events',
  'external events',
  'external layout',
  'events functions extension',
  'behavior detail',
  'function detail',
  'prefab detail',
  'custom object',
  'gameplay-test',
];

export const getEditorTabKey = (
  kind: EditorKind,
  projectItemName: string
): string =>
  editorKindsWithProjectItemNames.includes(kind)
    ? `${kind} ${projectItemName}`
    : kind;

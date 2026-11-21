// @flow
import * as React from 'react';
import {
  getExtensionMemberChangeDetails,
  getExtensionMemberDifferences,
  getExtensionReferenceProblems,
  getMergedSerializedExtension,
  type ExtensionMemberChangeDetails,
  type ExtensionMemberDifference,
  type ExtensionReferenceProblem,
} from '../../../Utils/Extension/ExtensionChangesToKeep';
import { type SerializedExtension } from '../../../Utils/GDevelopServices/Extension';

export type ExtensionMemberGroupKind =
  | 'extension-settings'
  | 'function'
  | 'behavior'
  | 'object';

export type ExtensionMemberGroup = {|
  kind: ExtensionMemberGroupKind,
  differences: Array<ExtensionMemberDifference>,
|};

const groupKinds: Array<ExtensionMemberGroupKind> = [
  'extension-settings',
  'function',
  'behavior',
  'object',
];

/**
 * The choices of the parts of an extension to keep from the project, with the
 * information needed to display them.
 */
export const useExtensionChangesToKeep = ({
  projectSerializedExtension,
  newSerializedExtension,
}: {|
  projectSerializedExtension: SerializedExtension,
  newSerializedExtension: SerializedExtension,
|}): {|
  groups: Array<ExtensionMemberGroup>,
  differencesCount: number,
  detailsByMemberKey: Map<string, ExtensionMemberChangeDetails>,
  keptMemberKeys: Set<string>,
  setMembersKept: (memberKeys: Array<string>, isKept: boolean) => void,
  problems: Array<ExtensionReferenceProblem>,
  problemsByMemberKey: Map<string, Array<ExtensionReferenceProblem>>,
  getMergedExtension: () => SerializedExtension,
|} => {
  const differences = React.useMemo(
    () =>
      getExtensionMemberDifferences(
        projectSerializedExtension,
        newSerializedExtension
      ),
    [projectSerializedExtension, newSerializedExtension]
  );
  const groups = React.useMemo<Array<ExtensionMemberGroup>>(
    () =>
      groupKinds
        .map(kind => ({
          kind,
          differences: differences.filter(difference =>
            kind === 'object'
              ? difference.kind === 'object' ||
                difference.kind === 'object-children'
              : difference.kind === kind
          ),
        }))
        .filter(group => group.differences.length > 0),
    [differences]
  );
  const detailsByMemberKey = React.useMemo(
    () =>
      new Map(
        differences.map(({ key }) => [
          key,
          getExtensionMemberChangeDetails(
            projectSerializedExtension,
            newSerializedExtension,
            key
          ),
        ])
      ),
    [differences, projectSerializedExtension, newSerializedExtension]
  );
  const [keptMemberKeys, setKeptMemberKeys] = React.useState<Set<string>>(
    () => new Set()
  );
  const setMembersKept = React.useCallback(
    (memberKeys: Array<string>, isKept: boolean) => {
      setKeptMemberKeys(previousKeptMemberKeys => {
        const newKeptMemberKeys = new Set(previousKeptMemberKeys);
        for (const memberKey of memberKeys) {
          if (isKept) newKeptMemberKeys.add(memberKey);
          else newKeptMemberKeys.delete(memberKey);
        }
        return newKeptMemberKeys;
      });
    },
    []
  );
  const problems = React.useMemo(
    () =>
      getExtensionReferenceProblems(
        projectSerializedExtension,
        newSerializedExtension,
        keptMemberKeys
      ),
    [projectSerializedExtension, newSerializedExtension, keptMemberKeys]
  );
  // A problem is shown on the member whose choice solves it.
  const problemsByMemberKey = React.useMemo(
    () => {
      const problemsByMemberKey = new Map<
        string,
        Array<ExtensionReferenceProblem>
      >();
      for (const problem of problems) {
        const memberProblems =
          problemsByMemberKey.get(problem.referencedMemberKey) || [];
        memberProblems.push(problem);
        problemsByMemberKey.set(problem.referencedMemberKey, memberProblems);
      }
      return problemsByMemberKey;
    },
    [problems]
  );
  const getMergedExtension = React.useCallback(
    () =>
      getMergedSerializedExtension(
        projectSerializedExtension,
        newSerializedExtension,
        keptMemberKeys
      ),
    [projectSerializedExtension, newSerializedExtension, keptMemberKeys]
  );
  return {
    groups,
    differencesCount: differences.length,
    detailsByMemberKey,
    keptMemberKeys,
    setMembersKept,
    problems,
    problemsByMemberKey,
    getMergedExtension,
  };
};

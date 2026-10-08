// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import AlertMessage from '../UI/AlertMessage';
import { type DebuggerRecordingMetadata } from './Export/DebuggerRecordingFile';
import { MINIMUM_COMPARABLE_FRAMES_COUNT } from './DebuggerConstants';
import { getIDEVersion } from '../Version';

export type ComparisonWarningKind =
  | 'other-project'
  | 'ide-version'
  | 'user-agent'
  | 'short-reference';

/**
 * Two runs are only worth comparing when they were played on the same
 * machine, by the same editor, and long enough to mean something. Another
 * game can be compared too (the sections, the scenes and the resources in
 * common are): it is only said, never refused.
 */
export const getComparisonWarningKinds = ({
  baselineMetadata,
  selectedProjectName,
  baselineFramesCount,
  ideVersion,
  userAgent,
}: {|
  /** What the reference holds, if it was imported from a file. */
  baselineMetadata: ?DebuggerRecordingMetadata,
  selectedProjectName: ?string,
  baselineFramesCount: number,
  ideVersion: string,
  userAgent: ?string,
|}): Array<ComparisonWarningKind> => {
  const warningKinds = [];
  if (
    baselineMetadata &&
    baselineMetadata.projectName &&
    selectedProjectName &&
    baselineMetadata.projectName !== selectedProjectName
  ) {
    warningKinds.push('other-project');
  }
  if (
    baselineMetadata &&
    baselineMetadata.ideVersion &&
    baselineMetadata.ideVersion !== ideVersion
  ) {
    warningKinds.push('ide-version');
  }
  if (
    baselineMetadata &&
    baselineMetadata.userAgent &&
    userAgent != null &&
    baselineMetadata.userAgent !== userAgent
  ) {
    warningKinds.push('user-agent');
  }
  if (baselineFramesCount < MINIMUM_COMPARABLE_FRAMES_COUNT) {
    warningKinds.push('short-reference');
  }
  return warningKinds;
};

const renderWarning = (warningKind: ComparisonWarningKind): React.Node => {
  switch (warningKind) {
    case 'other-project':
      return (
        <Trans>
          The reference comes from another project: only what both have in
          common is compared.
        </Trans>
      );
    case 'ide-version':
      return (
        <Trans>
          The reference was recorded with another version of GDevelop.
        </Trans>
      );
    case 'user-agent':
      return (
        <Trans>The reference was recorded on another machine or browser.</Trans>
      );
    case 'short-reference':
      return (
        <Trans>
          The reference holds few frames: what it averages is unreliable.
        </Trans>
      );
    default:
      return null;
  }
};

type Props = {|
  baselineMetadata: ?DebuggerRecordingMetadata,
  selectedProjectName: ?string,
  baselineFramesCount: number,
|};

/** What makes the comparison to the reference recording less reliable, if anything. */
const ComparisonWarnings = ({
  baselineMetadata,
  selectedProjectName,
  baselineFramesCount,
}: Props): React.Node => {
  const warningKinds = getComparisonWarningKinds({
    baselineMetadata,
    selectedProjectName,
    baselineFramesCount,
    ideVersion: getIDEVersion(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  });
  if (!warningKinds.length) return null;

  return (
    <AlertMessage kind="warning">
      {warningKinds.map(warningKind => (
        <div key={warningKind}>{renderWarning(warningKind)}</div>
      ))}
    </AlertMessage>
  );
};

export default ComparisonWarnings;

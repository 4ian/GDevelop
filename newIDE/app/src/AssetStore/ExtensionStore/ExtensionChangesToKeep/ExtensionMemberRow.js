// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import classNames from 'classnames';
import TextButton from '../../../UI/TextButton';
import Text from '../../../UI/Text';
import StatusChip from '../../../UI/StatusChip';
import SegmentedControl from '../../../UI/SegmentedControl';
import ChevronArrowRight from '../../../UI/CustomSvgIcons/ChevronArrowRight';
import WarningFilled from '../../../UI/CustomSvgIcons/WarningFilled';
import {
  type ExtensionMemberChangeDetails,
  type ExtensionMemberDifference,
  type ExtensionReferenceProblem,
} from '../../../Utils/Extension/ExtensionChangesToKeep';
import ExtensionMemberIcon from './ExtensionMemberIcon';
import ExtensionMemberChanges from './ExtensionMemberChanges';
import {
  getDifferentPartLabel,
  getMemberSecondaryText,
  getProblemExplanation,
} from './ExtensionChangesToKeepLabels';
import classes from './ExtensionChangesToKeep.module.css';

/**
 * A part of an extension that is different in the new version, with the
 * choice of the version to use. It expands to show what is different.
 */
const ExtensionMemberRow = ({
  difference,
  details,
  isKept,
  onChangeKept,
  problems,
  onFixProblem,
  isExpanded,
  onToggleExpanded,
}: {|
  difference: ExtensionMemberDifference,
  details: ExtensionMemberChangeDetails,
  isKept: boolean,
  onChangeKept: (isKept: boolean) => void,
  problems: Array<ExtensionReferenceProblem>,
  onFixProblem: (problem: ExtensionReferenceProblem) => void,
  isExpanded: boolean,
  onToggleExpanded: () => void,
|}): React.Node => {
  const isOnlyInProject = difference.status === 'only-in-project';
  return (
    <I18n>
      {({ i18n }) => (
        <div
          className={classNames({
            [classes.row]: true,
            [classes.kept]: isKept,
            [classes.withProblem]: problems.length > 0,
            [classes.expanded]: isExpanded,
          })}
        >
          <div className={classes.rowMain} onClick={onToggleExpanded}>
            <span className={classes.expandIcon}>
              <ChevronArrowRight fontSize="small" />
            </span>
            <ExtensionMemberIcon
              kind={difference.kind}
              functionType={details.functionType}
            />
            <div className={classes.rowTitle}>
              <Text
                noMargin
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {difference.kind === 'extension-settings'
                  ? i18n._(t`Extension settings`)
                  : details.displayName}
              </Text>
              <Text size="body-small" color="secondary" noMargin>
                {getMemberSecondaryText(i18n, difference, details)}
              </Text>
            </div>
            <div className={classes.rowChips}>
              {isOnlyInProject ? (
                <StatusChip
                  size="small"
                  tone="info"
                  label={<Trans>Only in your project</Trans>}
                />
              ) : (
                difference.differentParts.map(differentPart => (
                  <StatusChip
                    key={differentPart}
                    size="small"
                    label={getDifferentPartLabel(i18n, differentPart)}
                  />
                ))
              )}
            </div>
            <SegmentedControl
              size="small"
              value={isKept ? 'project' : 'new-version'}
              onChange={value => onChangeKept(value === 'project')}
              options={
                isOnlyInProject
                  ? [
                      { value: 'new-version', label: <Trans>Remove</Trans> },
                      { value: 'project', label: <Trans>Keep</Trans> },
                    ]
                  : [
                      { value: 'new-version', label: <Trans>New</Trans> },
                      { value: 'project', label: <Trans>Yours</Trans> },
                    ]
              }
            />
          </div>
          {problems.map(problem => (
            <div
              key={`${problem.memberKey}-${problem.problem}`}
              className={classes.rowProblem}
            >
              <WarningFilled fontSize="small" />
              <div className={classes.rowProblemText}>
                <Text size="body-small" noMargin>
                  {getProblemExplanation(i18n, problem)}
                </Text>
              </div>
              <TextButton
                label={
                  problem.fixingSource === 'project' ? (
                    <Trans>Keep yours</Trans>
                  ) : (
                    <Trans>Use the new one</Trans>
                  )
                }
                onClick={() => onFixProblem(problem)}
              />
            </div>
          ))}
          {isExpanded && (
            <div className={classes.rowDetails}>
              <ExtensionMemberChanges
                difference={difference}
                details={details}
              />
            </div>
          )}
        </div>
      )}
    </I18n>
  );
};

export default ExtensionMemberRow;

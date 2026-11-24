// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import TextButton from '../../../UI/TextButton';
import Text from '../../../UI/Text';
import StatusChip from '../../../UI/StatusChip';
import ValueDiff from '../../../UI/Diff/ValueDiff';
import CompactSearchBar from '../../../UI/CompactSearchBar';
import WarningFilled from '../../../UI/CustomSvgIcons/WarningFilled';
import { type SerializedExtension } from '../../../Utils/GDevelopServices/Extension';
import { type ExtensionReferenceProblem } from '../../../Utils/Extension/ExtensionChangesToKeep';
import { useExtensionChangesToKeep } from './useExtensionChangesToKeep';
import ExtensionMemberRow from './ExtensionMemberRow';
import { getGroupTitle } from './ExtensionChangesToKeepLabels';
import classes from './ExtensionChangesToKeep.module.css';

/** Show the search field only when the list is long. */
const minimumDifferencesCountForSearch = 8;

type Props = {|
  projectSerializedExtension: SerializedExtension,
  newSerializedExtension: SerializedExtension,
  onApply: (mergedSerializedExtension: SerializedExtension) => void,
  onCancel: () => void,
|};

/**
 * Let users choose the parts of an extension of their project to keep when
 * the extension is replaced by a new version.
 */
const ExtensionChangesToKeepDialog = ({
  projectSerializedExtension,
  newSerializedExtension,
  onApply,
  onCancel,
}: Props): React.Node => {
  const {
    groups,
    differencesCount,
    detailsByMemberKey,
    keptMemberKeys,
    setMembersKept,
    problems,
    problemsByMemberKey,
    getMergedExtension,
  } = useExtensionChangesToKeep({
    projectSerializedExtension,
    newSerializedExtension,
  });
  const [searchText, setSearchText] = React.useState('');
  const [expandedMemberKeys, setExpandedMemberKeys] = React.useState<
    Set<string>
  >(() => new Set());

  const toggleExpanded = (memberKey: string) => {
    const newExpandedMemberKeys = new Set(expandedMemberKeys);
    if (newExpandedMemberKeys.has(memberKey)) {
      newExpandedMemberKeys.delete(memberKey);
    } else {
      newExpandedMemberKeys.add(memberKey);
    }
    setExpandedMemberKeys(newExpandedMemberKeys);
  };

  const fixProblem = (problem: ExtensionReferenceProblem) =>
    setMembersKept(
      [problem.referencedMemberKey],
      problem.fixingSource === 'project'
    );

  const apply = () => {
    if (problems.length > 0) return;
    onApply(getMergedExtension());
  };

  const lowercaseSearchText = searchText.trim().toLowerCase();
  const filteredGroups = groups
    .map(group => ({
      ...group,
      differences: group.differences.filter(difference => {
        if (!lowercaseSearchText) return true;
        const details = detailsByMemberKey.get(difference.key);
        return (
          difference.name.toLowerCase().includes(lowercaseSearchText) ||
          (!!details &&
            details.displayName.toLowerCase().includes(lowercaseSearchText))
        );
      }),
    }))
    .filter(group => group.differences.length > 0);

  const extensionName =
    newSerializedExtension.fullName || newSerializedExtension.name;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Update {extensionName}</Trans>}
          id="extension-changes-to-keep-dialog"
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onCancel}
            />,
            <DialogPrimaryButton
              key="apply"
              label={
                keptMemberKeys.size === 0 ? (
                  <Trans>Update everything</Trans>
                ) : (
                  <Trans>Update and keep {keptMemberKeys.size}</Trans>
                )
              }
              primary
              onClick={apply}
              disabled={problems.length > 0}
            />,
          ]}
          onRequestClose={onCancel}
          onApply={apply}
          open
          maxWidth="md"
          fullHeight
          fixedContent={
            <div className={classes.header}>
              <div className={classes.headerLine}>
                <ValueDiff
                  layout="inline"
                  oldValue={projectSerializedExtension.version || ''}
                  newValue={newSerializedExtension.version || ''}
                />
                <Text color="secondary" noMargin>
                  <Trans>
                    Everything is updated to the new version, except what you
                    choose to keep.
                  </Trans>
                </Text>
              </div>
              <div className={classes.toolbar}>
                {differencesCount >= minimumDifferencesCountForSearch && (
                  <div className={classes.toolbarSearch}>
                    <CompactSearchBar
                      value={searchText}
                      onChange={setSearchText}
                      placeholder={t`Search`}
                    />
                  </div>
                )}
                <StatusChip
                  label={<Trans>{differencesCount} differences</Trans>}
                />
                {keptMemberKeys.size > 0 && (
                  <StatusChip
                    tone="info"
                    label={<Trans>{keptMemberKeys.size} kept</Trans>}
                  />
                )}
                {problems.length > 0 && (
                  <StatusChip
                    tone="warning"
                    icon={<WarningFilled />}
                    label={<Trans>{problems.length} to fix</Trans>}
                  />
                )}
              </div>
            </div>
          }
        >
          {filteredGroups.map(group => {
            const groupMemberKeys = group.differences.map(({ key }) => key);
            return (
              <section key={group.kind} className={classes.group}>
                <div className={classes.groupHeader}>
                  <Text size="sub-title" noMargin>
                    {getGroupTitle(i18n, group.kind)}
                  </Text>
                  <span className={classes.groupCount}>
                    {group.differences.length}
                  </span>
                  {group.differences.length > 1 && (
                    <div className={classes.groupActions}>
                      <TextButton
                        label={<Trans>All new</Trans>}
                        onClick={() => setMembersKept(groupMemberKeys, false)}
                      />
                      <TextButton
                        label={<Trans>All yours</Trans>}
                        onClick={() => setMembersKept(groupMemberKeys, true)}
                      />
                    </div>
                  )}
                </div>
                <div className={classes.rows}>
                  {group.differences.map(difference => {
                    const details = detailsByMemberKey.get(difference.key);
                    if (!details) return null;
                    return (
                      <ExtensionMemberRow
                        key={difference.key}
                        difference={difference}
                        details={details}
                        isKept={keptMemberKeys.has(difference.key)}
                        onChangeKept={isKept =>
                          setMembersKept([difference.key], isKept)
                        }
                        problems={problemsByMemberKey.get(difference.key) || []}
                        onFixProblem={fixProblem}
                        isExpanded={expandedMemberKeys.has(difference.key)}
                        onToggleExpanded={() => toggleExpanded(difference.key)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
          {filteredGroups.length === 0 && (
            <div className={classes.emptyResults}>
              <Text color="secondary">
                <Trans>Nothing matches "{searchText}".</Trans>
              </Text>
            </div>
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default ExtensionChangesToKeepDialog;

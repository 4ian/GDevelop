// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import NamedItemsDiff from '../../../UI/Diff/NamedItemsDiff';
import ValueDiff from '../../../UI/Diff/ValueDiff';
import Text from '../../../UI/Text';
import { IconContainer } from '../../../UI/IconContainer';
import {
  type ExtensionMemberChangeDetails,
  type ExtensionMemberDifference,
  type ExtensionMemberDifferentPart,
} from '../../../Utils/Extension/ExtensionChangesToKeep';
import {
  getDifferentPartLabel,
  getFieldLabel,
  getFieldValueLabel,
  isImageField,
} from './ExtensionChangesToKeepLabels';
import classes from './ExtensionChangesToKeep.module.css';

const ChangeSection = ({
  label,
  children,
}: {|
  label: React.Node,
  children: React.Node,
|}) => (
  <div className={classes.changeSection}>
    <Text size="body-small" color="secondary" noMargin>
      {label}
    </Text>
    {children}
  </div>
);

type Props = {|
  difference: ExtensionMemberDifference,
  details: ExtensionMemberChangeDetails,
|};

/** What is different in a part of an extension, between the project and the new version. */
const ExtensionMemberChanges = ({ difference, details }: Props): React.Node => {
  if (difference.status === 'only-in-project') {
    return (
      <Text size="body-small" color="secondary" noMargin>
        <Trans>
          This is only in your project: it was either added in your project, or
          removed from the new version.
        </Trans>
      </Text>
    );
  }
  const parts: Array<ExtensionMemberDifferentPart> = [];
  for (const { part } of details.itemChanges) {
    if (!parts.includes(part)) parts.push(part);
  }
  const { eventsCount } = details;
  return (
    <I18n>
      {({ i18n }) => (
        <div className={classes.changes}>
          {parts.map(part => (
            <ChangeSection key={part} label={getDifferentPartLabel(i18n, part)}>
              <NamedItemsDiff
                items={details.itemChanges
                  .filter(itemChange => itemChange.part === part)
                  .map(({ name, change }) => ({ name, change }))}
                changeDescriptions={{
                  added: <Trans>Only in the new version</Trans>,
                  removed: <Trans>Only in your version</Trans>,
                  modified: <Trans>Different in the new version</Trans>,
                }}
              />
            </ChangeSection>
          ))}
          {eventsCount && (
            <ChangeSection label={<Trans>Number of events</Trans>}>
              {eventsCount.project === eventsCount.newVersion ? (
                <Text size="body-small" noMargin>
                  <Trans>
                    Same number of events ({eventsCount.project}), with
                    differences.
                  </Trans>
                </Text>
              ) : (
                <ValueDiff
                  layout="inline"
                  oldValue={String(eventsCount.project)}
                  newValue={String(eventsCount.newVersion)}
                />
              )}
            </ChangeSection>
          )}
          {details.fieldChanges.map(
            ({ field, projectValue, newVersionValue }) => {
              const oldValueLabel = getFieldValueLabel(
                i18n,
                field,
                projectValue
              );
              const newValueLabel = getFieldValueLabel(
                i18n,
                field,
                newVersionValue
              );
              const renderImage = (url: string) =>
                url ? <IconContainer src={url} alt="" size={32} /> : '';
              return (
                <ChangeSection key={field} label={getFieldLabel(i18n, field)}>
                  {isImageField(field) ? (
                    <ValueDiff
                      layout="inline"
                      oldValue={renderImage(oldValueLabel)}
                      newValue={renderImage(newValueLabel)}
                      emptyValueLabel={<Trans>Not set</Trans>}
                    />
                  ) : (
                    <ValueDiff
                      layout={
                        oldValueLabel.length + newValueLabel.length > 60
                          ? 'stacked'
                          : 'inline'
                      }
                      oldValue={oldValueLabel}
                      newValue={newValueLabel}
                      emptyValueLabel={<Trans>Not set</Trans>}
                    />
                  )}
                </ChangeSection>
              );
            }
          )}
        </div>
      )}
    </I18n>
  );
};

export default ExtensionMemberChanges;

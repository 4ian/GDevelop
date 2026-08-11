// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import {
  findProjectItemUsages,
  getProjectItemUsageTargetName,
  type ProjectItemUsageTarget,
} from './ProjectItemUsageFinder';

const styles = {
  table: {
    tableLayout: 'fixed',
    width: '100%',
  },
  locationCell: {
    width: '35%',
    verticalAlign: 'top',
    wordBreak: 'break-word',
  },
  detailsCell: {
    width: '65%',
    verticalAlign: 'top',
    wordBreak: 'break-word',
  },
};

type UsageSectionProps = {|
  title: React.Node,
  usages: $ReadOnlyArray<{
    id: string,
    location: string,
    details: string,
    ...
  }>,
|};

const UsageSection = ({ title, usages }: UsageSectionProps) => {
  if (usages.length === 0) return null;

  return (
    <ColumnStackLayout noMargin>
      <Text size="block-title">{title}</Text>
      {/* $FlowFixMe[incompatible-type] */}
      <Table style={styles.table}>
        <TableHeader>
          <TableRow>
            {/* $FlowFixMe[incompatible-type] */}
            <TableHeaderColumn style={styles.locationCell}>
              <Trans>Location</Trans>
            </TableHeaderColumn>
            {/* $FlowFixMe[incompatible-type] */}
            <TableHeaderColumn style={styles.detailsCell}>
              <Trans>Details</Trans>
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usages.map(usage => (
            <TableRow key={usage.id}>
              {/* $FlowFixMe[incompatible-type] */}
              <TableRowColumn style={styles.locationCell}>
                <Text
                  allowSelection
                  noMargin
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {usage.location}
                </Text>
              </TableRowColumn>
              {/* $FlowFixMe[incompatible-type] */}
              <TableRowColumn style={styles.detailsCell}>
                <Text
                  allowSelection
                  noMargin
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {usage.details}
                </Text>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ColumnStackLayout>
  );
};

type Props = {|
  project: gdProject,
  target: ProjectItemUsageTarget,
  onClose: () => void,
|};

export default function ProjectItemUsageDialog({
  project,
  target,
  onClose,
}: Props): React.Node {
  const targetName = getProjectItemUsageTargetName(target);
  const usageReport = React.useMemo(
    () => findProjectItemUsages(project, target),
    [project, target]
  );
  const usageCount =
    usageReport.relatedUsages.length +
    usageReport.objectUsages.length +
    usageReport.eventUsages.length;

  return (
    <Dialog
      open
      title={`Usage of ${targetName}`}
      actions={[
        <DialogPrimaryButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      maxWidth="md"
      fullHeight
    >
      <ColumnStackLayout noMargin useLargeSpacer>
        <Text size="body" color="secondary" allowSelection>
          {`Usages found: ${usageCount}`}
        </Text>
        {usageCount === 0 && (
          <Text size="body">
            <Trans>No usage found.</Trans>
          </Text>
        )}
        <UsageSection
          title={<Trans>Project references</Trans>}
          usages={usageReport.relatedUsages}
        />
        <UsageSection
          title={<Trans>Objects and behaviors</Trans>}
          usages={usageReport.objectUsages}
        />
        <UsageSection
          title={<Trans>Events</Trans>}
          usages={usageReport.eventUsages}
        />
      </ColumnStackLayout>
    </Dialog>
  );
}

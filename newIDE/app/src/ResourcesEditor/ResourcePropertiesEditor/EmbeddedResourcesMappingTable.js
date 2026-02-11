// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../../UI/Table';
import { readEmbeddedResourcesMapping } from '../../ObjectsRendering/PixiResourcesLoader';

type Props = {|
  resources: Array<gdResource>,
|};

const styles = {
  tableCell: {
    // Avoid long filenames breaking the design.
    wordBreak: 'break-word',
  },
};

export const EmbeddedResourcesMappingTable = ({ resources }: Props) => {
  if (resources.length !== 1) return null;

  const resource = resources[0];
  const embeddedResourcesMapping = readEmbeddedResourcesMapping(resource);
  if (!embeddedResourcesMapping) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderColumn>
            <Trans>Embedded file name</Trans>
          </TableHeaderColumn>
          <TableHeaderColumn>
            <Trans>Associated resource name</Trans>
          </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(embeddedResourcesMapping).map(
          ([embeddedFilePath, associatedResourceNameRaw]) => {
            const associatedResourceName =
              typeof associatedResourceNameRaw === 'string'
                ? associatedResourceNameRaw
                : 'Unrecognized value.';

            return (
              <TableRow key={embeddedFilePath}>
                <TableRowColumn style={styles.tableCell}>
                  {embeddedFilePath}
                </TableRowColumn>
                <TableRowColumn style={styles.tableCell}>
                  {associatedResourceName}
                </TableRowColumn>
              </TableRow>
            );
          }
        )}
      </TableBody>
    </Table>
  );
};

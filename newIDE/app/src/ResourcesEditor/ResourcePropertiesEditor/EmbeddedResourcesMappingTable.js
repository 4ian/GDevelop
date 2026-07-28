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
import { readEmbeddedResourcesMapping } from '../../ResourcesList/ResourceUtils';
import AlertMessage from '../../UI/AlertMessage';
import { Column } from '../../UI/Grid';

type Props = {|
  project: gdProject,
  resources: Array<gdResource>,
|};

const styles = {
  tableCell: {
    // Avoid long filenames breaking the design.
    wordBreak: 'break-word',
  },
};

export const EmbeddedResourcesMappingTable = ({
  project,
  resources,
}: Props): null | React.Node => {
  if (resources.length !== 1) return null;

  const resource = resources[0];
  const embeddedResourcesMapping = readEmbeddedResourcesMapping(resource);
  if (!embeddedResourcesMapping) return null;

  const resourcesManager = project.getResourcesManager();
  const missingResourceNames = Object.values(embeddedResourcesMapping).filter(
    associatedResourceName =>
      typeof associatedResourceName === 'string' &&
      !resourcesManager.hasResource(associatedResourceName)
  );

  return (
    <React.Fragment>
      {missingResourceNames.length > 0 && (
        <Column noMargin>
          <AlertMessage kind="error">
            <Trans>
              This file refers to other resources that are not in the project
              anymore. It will not be displayed properly until they are added
              back with the same names: {missingResourceNames.join(', ')}
            </Trans>
          </AlertMessage>
        </Column>
      )}
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
                  {/* $FlowFixMe[incompatible-type] */}
                  <TableRowColumn style={styles.tableCell}>
                    {embeddedFilePath}
                  </TableRowColumn>
                  {/* $FlowFixMe[incompatible-type] */}
                  <TableRowColumn style={styles.tableCell}>
                    {associatedResourceName}
                  </TableRowColumn>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

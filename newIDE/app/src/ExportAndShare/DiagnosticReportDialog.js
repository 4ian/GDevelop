// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { mapFor } from '../Utils/MapFor';
import {
  Table,
  TableRow,
  TableRowColumn,
  TableBody,
  TableHeader,
  TableHeaderColumn,
} from '../UI/Table';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

type Props = {|
  wholeProjectDiagnosticReport: gdWholeProjectDiagnosticReport,
  onClose: () => void,
|};

export default function DiagnosticReportDialog({
  wholeProjectDiagnosticReport,
  onClose,
}: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const renderDiagnosticReport = React.useCallback(
    (diagnosticReport: gdDiagnosticReport) => {
      const missingSceneVariables = new Set<string>();
      const missingObjectVariablesByObject = new Map<string, Set<string>>();
      mapFor(0, diagnosticReport.count(), index => {
        const projectDiagnostic = diagnosticReport.get(index);

        const objectName = projectDiagnostic.getObjectName();
        if (objectName.length === 0) {
          missingSceneVariables.add(projectDiagnostic.getActualValue());
        } else {
          let missingObjectVariables = missingObjectVariablesByObject.get(
            objectName
          );
          if (!missingObjectVariables) {
            missingObjectVariables = new Set<string>();
            missingObjectVariablesByObject.set(
              objectName,
              missingObjectVariables
            );
          }
          missingObjectVariables.add(projectDiagnostic.getActualValue());
        }
      });

      return (
        <ColumnStackLayout noMargin useLargeSpacer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn />
                <TableHeaderColumn />
              </TableRow>
            </TableHeader>
            <TableBody>
              {missingSceneVariables.size > 0 && (
                <TableRow
                  key={`missing-scene-variables`}
                  style={{
                    backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                  }}
                >
                  <TableRowColumn>
                    <Text size="body">
                      <Trans>Missing scene variables</Trans>
                    </Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    <Text size="body">
                      {[...missingSceneVariables].join(', ')}
                    </Text>
                  </TableRowColumn>
                </TableRow>
              )}
              {[...missingObjectVariablesByObject.entries()].map(
                ([objectName, missingVariables]) => (
                  <TableRow
                    key={`missing-object-variables-${objectName}`}
                    style={{
                      backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                    }}
                  >
                    <TableRowColumn>
                      <Text size="body">
                        <Trans>
                          Missing variables for object "{objectName}"
                        </Trans>
                      </Text>
                    </TableRowColumn>
                    <TableRowColumn>
                      <Text size="body">
                        {[...missingVariables].join(', ')}
                      </Text>
                    </TableRowColumn>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </ColumnStackLayout>
      );
    },
    [gdevelopTheme.list.itemsBackgroundColor]
  );

  return (
    <Dialog
      title={<Trans>Diagnostic report</Trans>}
      actions={[
        <DialogPrimaryButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={true}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      onApply={onClose}
      open
      maxWidth="sm"
    >
      <ColumnStackLayout noMargin useLargeSpacer>
        {mapFor(0, wholeProjectDiagnosticReport.count(), index => {
          const diagnosticReport = wholeProjectDiagnosticReport.get(index);
          return (
            diagnosticReport.count() > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="block-title">
                  {diagnosticReport.getSceneName()}
                </Text>
                {renderDiagnosticReport(diagnosticReport)}
              </ColumnStackLayout>
            )
          );
        })}
      </ColumnStackLayout>
    </Dialog>
  );
}

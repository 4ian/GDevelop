// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
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
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

const gd: libGDevelop = global.gd;

type Props = {|
  wholeProjectDiagnosticReport: gdWholeProjectDiagnosticReport,
  onClose: () => void,
|};

const addFor = (map, key, value) => {
  let set = map.get(key);
  if (!set) {
    set = new Set<string>();
    map.set(key, set);
  }
  set.add(value);
};

export default function DiagnosticReportDialog({
  wholeProjectDiagnosticReport,
  onClose,
}: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const preferences = React.useContext(PreferencesContext);

  const renderDiagnosticReport = React.useCallback(
    (diagnosticReport: gdDiagnosticReport) => {
      const missingSceneVariables = new Set<string>();
      const missingObjectVariablesByObject = new Map<string, Set<string>>();
      const missingBehaviorsByObjects = new Map<string, Set<string>>();
      mapFor(0, diagnosticReport.count(), index => {
        const projectDiagnostic = diagnosticReport.get(index);

        const objectName = projectDiagnostic.getObjectName();
        const type = projectDiagnostic.getType();
        switch (type) {
          case gd.ProjectDiagnostic.UndeclaredVariable:
            if (objectName.length === 0) {
              missingSceneVariables.add(projectDiagnostic.getActualValue());
            } else {
              addFor(
                missingObjectVariablesByObject,
                objectName,
                projectDiagnostic.getActualValue()
              );
            }
            break;

          case gd.ProjectDiagnostic.MissingBehavior:
            addFor(
              missingBehaviorsByObjects,
              objectName,
              projectDiagnostic.getExpectedValue()
            );
            break;

          default:
            break;
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
                    <Text size="body" allowSelection>
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
                      <Text size="body" allowSelection>
                        {[...missingVariables].join(', ')}
                      </Text>
                    </TableRowColumn>
                  </TableRow>
                )
              )}
              {[...missingBehaviorsByObjects.entries()].map(
                ([objectName, missingBehaviors]) => (
                  <TableRow
                    key={`missing-object-behaviors-${objectName}`}
                    style={{
                      backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                    }}
                  >
                    <TableRowColumn>
                      <Text size="body">
                        <Trans>
                          Missing behaviors for object "{objectName}"
                        </Trans>
                      </Text>
                    </TableRowColumn>
                    <TableRowColumn>
                      <Text size="body">
                        {[...missingBehaviors]
                          .map(behaviorType =>
                            gd.MetadataProvider.getBehaviorMetadata(
                              gd.JsPlatform.get(),
                              behaviorType
                            ).getFullName()
                          )
                          .join(', ')}
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
      secondaryActions={[
        <Toggle
          label={<Trans>Open automatically</Trans>}
          toggled={preferences.values.openDiagnosticReportAutomatically}
          onToggle={(e, check) =>
            preferences.setOpenDiagnosticReportAutomatically(check)
          }
          labelPosition="right"
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

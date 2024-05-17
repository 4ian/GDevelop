// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { mapFor } from '../Utils/MapFor';

type Props = {|
  wholeProjectDiagnosticReport: gdWholeProjectDiagnosticReport,
  onClose: () => void,
|};

const renderDiagnosticReport = (diagnosticReport: gdDiagnosticReport) => {
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
        missingObjectVariablesByObject.set(objectName, missingObjectVariables);
      }
      missingObjectVariables.add(projectDiagnostic.getActualValue());
    }
  });

  return (
    <ColumnStackLayout noMargin useLargeSpacer>
      <ColumnStackLayout noMargin>
        <Text size="sub-title" noMargin>
          <Trans>Missing scene variables</Trans>
        </Text>
        <Text size="body" noMargin>
          {[...missingSceneVariables].join(', ')}
        </Text>
      </ColumnStackLayout>
      {[...missingObjectVariablesByObject.entries()].map(
        ([objectName, missingVariables]) => (
          <ColumnStackLayout noMargin>
            <Text size="sub-title" noMargin>
              <Trans>Missing variables for object "{objectName}"</Trans>
            </Text>
            <Text size="body" noMargin>
              {[...missingVariables].join(', ')}
            </Text>
          </ColumnStackLayout>
        )
      )}
    </ColumnStackLayout>
  );
};

export default function DiagnosticReportDialog({
  wholeProjectDiagnosticReport,
  onClose,
}: Props) {
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

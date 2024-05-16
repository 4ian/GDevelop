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
    console.log('objectName: ' + objectName);
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
    <>
      <Text>
        <Trans>
          Missing scene variables: {[...missingSceneVariables].join(', ')}
        </Trans>
      </Text>
      {[...missingObjectVariablesByObject.entries()].map(
        ([objectName, missingVariables]) => (
          <Text>
            <Trans>
              Missing variables for object "{objectName}":{' '}
              {[...missingVariables].join(', ')}
            </Trans>
          </Text>
        )
      )}
    </>
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
      <ColumnStackLayout noMargin>
        {mapFor(0, wholeProjectDiagnosticReport.count(), index => {
          const diagnosticReport = wholeProjectDiagnosticReport.get(index);
          return (
            diagnosticReport.count() > 0 && (
              <>
                <Text size="section-title">
                  {diagnosticReport.getSceneName()}
                </Text>
                {renderDiagnosticReport(diagnosticReport)}
              </>
            )
          );
        })}
      </ColumnStackLayout>
    </Dialog>
  );
}

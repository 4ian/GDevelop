// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import DiagnosticReportDialog from '../../../ExportAndShare/DiagnosticReportDialog';

export default {
  title: 'ExportAndShare/DiagnosticReportDialog',
  component: DiagnosticReportDialog,
};

/**
 * Shows the diagnostic report dialog with no errors.
 * The dialog displays a message indicating no issues were found.
 */
export const Empty = () => (
  <DiagnosticReportDialog
    project={testProject.project}
    wholeProjectDiagnosticReport={testProject.project.getWholeProjectDiagnosticReport()}
    onClose={action('onClose')}
    onNavigateToLayoutEvent={action('onNavigateToLayoutEvent')}
    onNavigateToExternalEventsEvent={action('onNavigateToExternalEventsEvent')}
  />
);
Empty.storyName = 'Empty (No errors)';

/**
 * Shows the diagnostic report dialog with navigation callbacks.
 * When errors are found, clicking on them will trigger navigation to the
 * corresponding event in the layout or external events sheet.
 *
 * Features demonstrated:
 * - Location column (33% width, max 2 lines)
 * - Instruction column with Action/Condition in bold
 * - Text truncation with ellipsis for long instructions
 * - Expand button (only visible when text is truncated)
 * - Click on text to expand/collapse
 */
export const WithNavigationCallbacks = () => (
  <DiagnosticReportDialog
    project={testProject.project}
    wholeProjectDiagnosticReport={testProject.project.getWholeProjectDiagnosticReport()}
    onClose={action('onClose')}
    onNavigateToLayoutEvent={(layoutName, eventPath) => {
      action('onNavigateToLayoutEvent')({ layoutName, eventPath });
    }}
    onNavigateToExternalEventsEvent={(externalEventsName, eventPath) => {
      action('onNavigateToExternalEventsEvent')({
        externalEventsName,
        eventPath,
      });
    }}
  />
);
WithNavigationCallbacks.storyName = 'With navigation callbacks';

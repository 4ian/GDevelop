// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
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
import AlertMessage from '../UI/AlertMessage';
import {
  scanProjectForValidationErrors,
  groupValidationErrors,
  type ValidationError,
} from '../Utils/EventsValidationScanner';
import { getFunctionNameFromType } from '../EventsFunctionsExtensionsLoader';
import Link from '../UI/Link';
import IconButton from '../UI/IconButton';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';

const gd: libGDevelop = global.gd;

const styles = {
  table: {
    tableLayout: 'fixed',
    width: '100%',
  },
  locationCell: {
    width: '33%',
    verticalAlign: 'top',
  },
  locationText: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  instructionCell: {
    width: '67%',
    overflow: 'hidden',
  },
  instructionContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  instructionTextCollapsed: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  instructionTextExpanded: {
    flex: 1,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    minWidth: 0,
  },
  expandButton: {
    padding: 4,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  typeLabel: {
    fontWeight: 'bold',
  },
};

type InvalidParameterRowProps = {|
  error: ValidationError,
  navigateToError: (error: ValidationError) => void,
  backgroundColor: string,
|};

const InvalidParameterRow = ({
  error,
  navigateToError,
  backgroundColor,
}: InvalidParameterRowProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const textRef = React.useRef<HTMLDivElement | null>(null);
  const typeLabel = error.isCondition ? 'Condition' : 'Action';

  React.useEffect(
    () => {
      const element = textRef.current;
      if (element) {
        // Check if text is truncated by comparing scrollWidth with clientWidth
        setIsTruncated(element.scrollWidth > element.clientWidth);
      }
    },
    [error.instructionSentence]
  );

  const handleTextClick = React.useCallback(
    () => {
      if (isTruncated || isExpanded) {
        setIsExpanded(!isExpanded);
      }
    },
    [isTruncated, isExpanded]
  );

  return (
    <TableRow
      style={{
        backgroundColor,
      }}
    >
      <TableRowColumn style={styles.locationCell}>
        <div style={styles.locationText}>
          <Link href="#" onClick={() => navigateToError(error)}>
            {error.locationType === 'scene' ? 'scene' : 'external-events'}:{' '}
            {error.locationName}
          </Link>
        </div>
      </TableRowColumn>
      <TableRowColumn style={styles.instructionCell}>
        <div style={styles.instructionContent}>
          <div
            ref={textRef}
            style={{
              ...(isExpanded
                ? styles.instructionTextExpanded
                : styles.instructionTextCollapsed),
              cursor: isTruncated || isExpanded ? 'pointer' : 'default',
            }}
            onClick={handleTextClick}
            title={
              isTruncated && !isExpanded ? error.instructionSentence : undefined
            }
          >
            <span style={styles.typeLabel}>{typeLabel}</span>{' '}
            {error.instructionSentence}
          </div>
          {(isTruncated || isExpanded) && (
            <IconButton
              size="small"
              style={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronArrowBottom /> : <ChevronArrowRight />}
            </IconButton>
          )}
        </div>
      </TableRowColumn>
    </TableRow>
  );
};

type InvalidParametersSectionProps = {|
  validationErrors: Array<ValidationError>,
  invalidParametersCount: number,
  navigateToError: (error: ValidationError) => void,
  gdevelopTheme: any,
|};

const InvalidParametersSection = ({
  validationErrors,
  invalidParametersCount,
  navigateToError,
  gdevelopTheme,
}: InvalidParametersSectionProps) => {
  return (
    <ColumnStackLayout noMargin>
      <Text size="block-title">
        <Trans>Invalid parameters in events ({invalidParametersCount})</Trans>
      </Text>
      <AlertMessage kind="error">
        <Trans>
          The following events have invalid parameters (shown with red underline
          in the events sheet). Click a location to navigate there.
        </Trans>
      </AlertMessage>
      <Table style={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={styles.locationCell}>
              <Trans>Location</Trans>
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.instructionCell}>
              <Trans>Instruction</Trans>
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validationErrors
            .filter(error => error.type !== 'missing-instruction')
            .map((error, index) => (
              <InvalidParameterRow
                key={`invalid-param-${index}`}
                error={error}
                navigateToError={navigateToError}
                backgroundColor={gdevelopTheme.list.itemsBackgroundColor}
              />
            ))}
        </TableBody>
      </Table>
    </ColumnStackLayout>
  );
};

type Props = {|
  project: gdProject,
  wholeProjectDiagnosticReport: gdWholeProjectDiagnosticReport,
  onClose: () => void,
  onNavigateToLayoutEvent: (
    layoutName: string,
    eventPath: Array<number>
  ) => void,
  onNavigateToExternalEventsEvent: (
    externalEventsName: string,
    eventPath: Array<number>
  ) => void,
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
  project,
  wholeProjectDiagnosticReport,
  onClose,
  onNavigateToLayoutEvent,
  onNavigateToExternalEventsEvent,
}: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const preferences = React.useContext(PreferencesContext);

  // Scan project for validation errors (missing instructions, invalid parameters)
  const validationErrors = React.useMemo(
    () => {
      try {
        return scanProjectForValidationErrors(project);
      } catch (error) {
        console.error('Error scanning project for validation errors:', error);
        return [];
      }
    },
    [project]
  );

  const groupedErrors = React.useMemo(
    () => groupValidationErrors(validationErrors),
    [validationErrors]
  );

  const missingInstructionsCount = validationErrors.filter(
    e => e.type === 'missing-instruction'
  ).length;
  const invalidParametersCount = validationErrors.filter(
    e => e.type !== 'missing-instruction'
  ).length;
  const hasMissingInstructions = missingInstructionsCount > 0;
  const hasInvalidParameters = invalidParametersCount > 0;
  const hasValidationErrors = hasMissingInstructions || hasInvalidParameters;

  const navigateToError = React.useCallback(
    (error: ValidationError) => {
      onClose();
      if (error.locationType === 'scene') {
        onNavigateToLayoutEvent(error.locationName, error.eventPath);
      } else if (error.locationType === 'external-events') {
        onNavigateToExternalEventsEvent(error.locationName, error.eventPath);
      }
    },
    [onClose, onNavigateToLayoutEvent, onNavigateToExternalEventsEvent]
  );

  const renderMissingInstructionName = (type: string) => {
    const { name, behaviorName } = getFunctionNameFromType(type);
    if (behaviorName) {
      return `${name} (${behaviorName})`;
    }
    return name;
  };

  const renderDiagnosticReport = React.useCallback(
    (diagnosticReport: gdDiagnosticReport) => {
      // TODO Generalize error aggregation when enough errors are handled to have a clearer view.
      const missingSceneVariables = new Set<string>();
      const unknownObjects = new Set<string>();
      const mismatchedTypeObjects = new Set<string>();
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
            const behaviorType = projectDiagnostic.getExpectedValue();
            const isCapability = gd.MetadataProvider.getBehaviorMetadata(
              gd.JsPlatform.get(),
              behaviorType
            ).isHidden();
            if (isCapability) {
              mismatchedTypeObjects.add(objectName);
            } else {
              addFor(missingBehaviorsByObjects, objectName, behaviorType);
            }
            break;

          case gd.ProjectDiagnostic.UnknownObject:
            unknownObjects.add(projectDiagnostic.getActualValue());
            break;

          case gd.ProjectDiagnostic.MismatchedObjectType:
            mismatchedTypeObjects.add(objectName);
            break;

          default:
            break;
        }
      });
      for (const unknownObjectName of unknownObjects) {
        mismatchedTypeObjects.delete(unknownObjectName);
      }

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
              {unknownObjects.size > 0 && (
                <TableRow
                  key={`missing-objects`}
                  style={{
                    backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                  }}
                >
                  <TableRowColumn>
                    <Text size="body">
                      <Trans>Missing objects</Trans>
                    </Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    <Text size="body" allowSelection>
                      {[...unknownObjects].join(', ')}
                    </Text>
                  </TableRowColumn>
                </TableRow>
              )}
              {mismatchedTypeObjects.size > 0 && (
                <TableRow
                  key={`missing-objects`}
                  style={{
                    backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
                  }}
                >
                  <TableRowColumn>
                    <Text size="body">
                      <Trans>
                        Objects used with wrong actions or conditions
                      </Trans>
                    </Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    <Text size="body" allowSelection>
                      {[...mismatchedTypeObjects].join(', ')}
                    </Text>
                  </TableRowColumn>
                </TableRow>
              )}
              {missingSceneVariables.size > 0 && (
                <TableRow
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

  const hasNativeReport = wholeProjectDiagnosticReport.hasAnyIssue();
  const hasAnyIssue = hasNativeReport || hasValidationErrors;

  return (
    <Dialog
      id="diagnostic-report-dialog"
      title={<Trans>Diagnostic report</Trans>}
      actions={[
        <DialogPrimaryButton
          id="close-button"
          key="close"
          label={<Trans>Close</Trans>}
          primary={true}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <Toggle
          key="report-automatically"
          label={<Trans>Generate report at each preview</Trans>}
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
      maxWidth="md"
    >
      <ColumnStackLayout noMargin useLargeSpacer>
        {!hasAnyIssue && (
          <AlertMessage kind="info">
            <Trans>No issues found in your project.</Trans>
          </AlertMessage>
        )}

        {/* Missing instructions from extensions */}
        {hasMissingInstructions && (
          <ColumnStackLayout noMargin>
            <Text size="block-title">
              <Trans>
                Missing actions/conditions/expressions (
                {missingInstructionsCount})
              </Trans>
            </Text>
            <AlertMessage kind="warning">
              <Trans>
                The following actions, conditions, or expressions no longer
                exist in their extensions. This can happen when an extension's
                API has changed or when functionality has been removed. Update
                or remove these instructions.
              </Trans>
            </AlertMessage>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>
                    <Trans>Extension</Trans>
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    <Trans>Missing instructions</Trans>
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    <Trans>Location</Trans>
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...groupedErrors.missingInstructions.entries()].map(
                  ([extensionName, errors]) => (
                    <TableRow
                      key={`missing-ext-${extensionName}`}
                      style={{
                        backgroundColor:
                          gdevelopTheme.list.itemsBackgroundColor,
                      }}
                    >
                      <TableRowColumn>
                        <Text size="body" color="error">
                          {extensionName}
                        </Text>
                      </TableRowColumn>
                      <TableRowColumn>
                        <Text size="body" allowSelection>
                          {[
                            ...new Set(
                              errors.map(e =>
                                renderMissingInstructionName(e.instructionType)
                              )
                            ),
                          ].join(', ')}
                        </Text>
                      </TableRowColumn>
                      <TableRowColumn>
                        {[
                          ...new Set(
                            errors.map(
                              e => `${e.locationType}: ${e.locationName}`
                            )
                          ),
                        ].map(location => {
                          const error = errors.find(
                            e =>
                              `${e.locationType}: ${e.locationName}` ===
                              location
                          );
                          return (
                            <LineStackLayout key={location} noMargin>
                              <Link
                                href="#"
                                onClick={() => error && navigateToError(error)}
                              >
                                {location}
                              </Link>
                            </LineStackLayout>
                          );
                        })}
                      </TableRowColumn>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </ColumnStackLayout>
        )}

        {/* Invalid parameters */}
        {hasInvalidParameters && (
          <InvalidParametersSection
            validationErrors={validationErrors}
            invalidParametersCount={invalidParametersCount}
            navigateToError={navigateToError}
            gdevelopTheme={gdevelopTheme}
          />
        )}

        {/* Native diagnostic report (from C++ code) */}
        {mapFor(0, wholeProjectDiagnosticReport.count(), index => {
          const diagnosticReport = wholeProjectDiagnosticReport.get(index);
          return (
            diagnosticReport.count() > 0 && (
              <ColumnStackLayout
                noMargin
                key={`diagnostic-report-${diagnosticReport.getSceneName()}`}
              >
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

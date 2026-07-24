// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { enumerateEventsFunctionsExtensions } from '../../ProjectManager/EnumerateProjectItems';
import { Line } from '../../UI/Grid';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import {
  setupFunctionFromEvents,
  canCreateEventsFunction,
  functionHasLotsOfParameters,
  getSafeExtensionName,
  getSafeEventsFunctionName,
} from '.';
import AlertMessage from '../../UI/AlertMessage';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import CompactEventsFunctionParametersEditor from '../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/CompactEventsFunctionParametersEditor';
import { CompactEventsFunctionPropertiesEditor } from '../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/CompactEventsFunctionPropertiesEditor';
import HelpButton from '../../UI/HelpButton';
import { ColumnStackLayout } from '../../UI/Layout';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import useForceUpdate from '../../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  serializedEvents: Object,
  onClose: () => void,
  onCreate: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => Promise<void>,
|};

const CREATE_NEW_EXTENSION_PLACEHOLDER = '<create a new extension>';

const EventsFunctionExtractorDialog = ({
  project,
  scope,
  globalObjectsContainer,
  objectsContainer,
  serializedEvents,
  onClose,
  onCreate,
}: Props): React.Node => {
  const [extensionName, setExtensionName] = React.useState(() =>
    getSafeExtensionName(project, 'MyExtension')
  );
  const [createNewExtension, setCreateNewExtension] = React.useState(true);

  const forceUpdate = useForceUpdate();

  // This is only used to check parameter for name conflict,but the parameter
  // editor is locked so users can't actually change parameter names.
  // Thus, it's fine to use the wrong scope.
  const projectScopedContainersAccessor = React.useMemo<ProjectScopedContainersAccessor>(
    () => new ProjectScopedContainersAccessor({ project }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const eventsFunction = React.useMemo<gdEventsFunction>(
    () => {
      // Set up the function
      const newEventsFunction = new gd.EventsFunction();
      setupFunctionFromEvents({
        project,
        scope,
        globalObjectsContainer,
        objectsContainer,
        serializedEvents,
        eventsFunction: newEventsFunction,
      });

      // Prepopulate the form
      newEventsFunction.setName(
        getSafeEventsFunctionName(
          project,
          extensionName,
          newEventsFunction.getName()
        )
      );
      return newEventsFunction;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    return () => {
      eventsFunction.delete();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventsFunctionsExtensions = enumerateEventsFunctionsExtensions(project);

  const onApply = React.useCallback(
    () => {
      if (!canCreateEventsFunction(project, extensionName, eventsFunction)) {
        return;
      }
      onCreate(extensionName, eventsFunction);
    },
    [eventsFunction, extensionName, onCreate, project]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Extract the events in a function</Trans>}
          secondaryActions={[
            <HelpButton
              helpPagePath="/events/functions/extract-events"
              key="help"
              scopeName={t`Extract to function`}
            />,
          ]}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
            />,
            <DialogPrimaryButton
              key="create"
              label={<Trans>Create</Trans>}
              primary
              disabled={
                // This won't actually happen
                !canCreateEventsFunction(project, extensionName, eventsFunction)
              }
              onClick={onApply}
            />,
          ]}
          open
          cannotBeDismissed
          onRequestClose={onClose}
          onApply={onApply}
          maxWidth="sm"
        >
          <ColumnStackLayout noMargin expand noOverflowParent>
            <DismissableAlertMessage
              identifier="function-extractor-explanation"
              kind="info"
            >
              After creating a function, it will be usable in the events sheet.
              Functions are grouped by extensions. Choose, or enter the name of
              a new extension, and a function name, then configure the function
              and its parameters.
            </DismissableAlertMessage>
            <CompactPropertiesEditorRowField
              label={i18n._(t`Extension`)}
              markdownDescription={i18n._(
                t`Extension containing the new function`
              )}
              field={
                <CompactSelectField
                  value={
                    createNewExtension
                      ? CREATE_NEW_EXTENSION_PLACEHOLDER
                      : extensionName
                  }
                  onChange={extensionName => {
                    if (extensionName === CREATE_NEW_EXTENSION_PLACEHOLDER) {
                      setCreateNewExtension(true);
                      setExtensionName(
                        getSafeExtensionName(project, 'MyExtension')
                      );
                    } else {
                      setCreateNewExtension(false);
                      setExtensionName(extensionName);
                    }
                    eventsFunction.setName(
                      getSafeEventsFunctionName(
                        project,
                        extensionName,
                        eventsFunction.getName()
                      )
                    );
                  }}
                >
                  {eventsFunctionsExtensions.map(eventsFunctionsExtension => (
                    <SelectOption
                      key={eventsFunctionsExtension.getName()}
                      value={eventsFunctionsExtension.getName()}
                      label={
                        eventsFunctionsExtension.getFullName() ||
                        eventsFunctionsExtension.getName()
                      }
                    />
                  ))}
                  <SelectOption
                    value={CREATE_NEW_EXTENSION_PLACEHOLDER}
                    label={t`<Create a New Extension>`}
                  />
                </CompactSelectField>
              }
            />
            {createNewExtension ? (
              <CompactPropertiesEditorRowField
                label={i18n._(t`New extension name`)}
                field={
                  <CompactSemiControlledTextField
                    commitOnBlur
                    value={extensionName}
                    onChange={(extensionName: string) => {
                      setExtensionName(
                        getSafeExtensionName(project, extensionName)
                      );
                    }}
                  />
                }
              />
            ) : null}
            <CompactPropertiesEditorRowField
              label={i18n._(t`Function name`)}
              field={
                <CompactSemiControlledTextField
                  commitOnBlur
                  value={eventsFunction.getName()}
                  onChange={(functionName: string) => {
                    eventsFunction.setName(
                      getSafeEventsFunctionName(
                        project,
                        extensionName,
                        functionName
                      )
                    );
                    forceUpdate();
                  }}
                />
              }
            />
            {functionHasLotsOfParameters(eventsFunction) ? (
              <Line>
                <AlertMessage kind="warning">
                  <Trans>
                    This function will have a lot of parameters. Consider
                    creating groups or functions for a smaller set of objects so
                    that the function is easier to reuse.
                  </Trans>
                </AlertMessage>
              </Line>
            ) : null}
            <CompactEventsFunctionPropertiesEditor
              project={project}
              eventsFunction={eventsFunction}
              eventsBasedBehavior={null}
              eventsBasedObject={null}
              eventsFunctionsContainer={null}
              eventsFunctionsExtension={null}
              onConfigurationUpdated={() => {
                // Force re-running logic to see if Create button is disabled.
                forceUpdate();
              }}
              freezeEventsFunctionType
            />
            <CompactEventsFunctionParametersEditor
              project={project}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              eventsFunction={eventsFunction}
              eventsBasedBehavior={null}
              eventsBasedObject={null}
              eventsFunctionsContainer={null}
              eventsFunctionsExtension={null}
              onParametersUpdated={() => {
                // Force the dialog to adapt its size
                forceUpdate();
              }}
              onFunctionParameterWillBeRenamed={() => {
                // Won't happen as the editor is freezed.
              }}
              onFunctionParameterTypeChanged={() => {
                // Won't happen as the editor is freezed.
              }}
              onWillInstallExtension={() => {
                // Won't happen as the editor is freezed.
              }}
              onExtensionInstalled={() => {
                // Won't happen as the editor is freezed.
              }}
              freezeParameters
            />
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default EventsFunctionExtractorDialog;

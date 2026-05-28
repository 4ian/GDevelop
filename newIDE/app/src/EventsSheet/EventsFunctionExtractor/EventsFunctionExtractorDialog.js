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
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  serializedEvents: Object,
  onClose: () => void,
  onCreate: (extensionName: string, eventsFunction: gdEventsFunction) => void,
|};

type State = {|
  eventsFunction: ?gdEventsFunction,
  extensionName: string,
  createNewExtension: boolean,
|};

const CREATE_NEW_EXTENSION_PLACEHOLDER = '<create a new extension>';

export default class EventsFunctionExtractorDialog extends React.Component<
  Props,
  State
> {
  // $FlowFixMe[missing-local-annot]
  state = {
    eventsFunction: null,
    extensionName: '',
    createNewExtension: false,
  };
  _projectScopedContainersAccessor: ProjectScopedContainersAccessor | null = null;

  componentDidMount() {
    const {
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      serializedEvents,
    } = this.props;

    // This is only used to check parameter for name conflict,but the parameter
    // editor is locked so users can't actually change parameter names.
    // Thus, it's fine to use the wrong scope.
    this._projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project }
    );

    // Set up the function
    const eventsFunction = new gd.EventsFunction();
    setupFunctionFromEvents({
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      serializedEvents,
      eventsFunction,
    });
    this.setState({
      eventsFunction,
    });

    // Prepopulate the form
    const extensionName = getSafeExtensionName(project, 'MyExtension');
    this.setState({
      createNewExtension: true,
      extensionName,
    });
    eventsFunction.setName(
      getSafeEventsFunctionName(
        project,
        extensionName,
        eventsFunction.getName()
      )
    );
  }

  componentWillUnmount() {
    const { eventsFunction } = this.state;
    if (eventsFunction) eventsFunction.delete();
  }

  render(): any {
    const { project, onClose, onCreate } = this.props;
    const { eventsFunction, extensionName, createNewExtension } = this.state;
    if (!eventsFunction) return null;

    const eventsFunctionsExtensions = enumerateEventsFunctionsExtensions(
      project
    );
    const hasLotsOfParameters = functionHasLotsOfParameters(eventsFunction);

    const onApply = () => {
      if (!canCreateEventsFunction(project, extensionName, eventsFunction)) {
        onClose();
      } else {
        onCreate(extensionName, eventsFunction);
      }
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            title={<Trans>Extract the events in a function</Trans>}
            secondaryActions={[
              <HelpButton
                helpPagePath="/events/functions/extract-events"
                key="help"
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
                  !canCreateEventsFunction(
                    project,
                    extensionName,
                    eventsFunction
                  )
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
            <ColumnStackLayout noMargin>
              <DismissableAlertMessage
                identifier="function-extractor-explanation"
                kind="info"
              >
                After creating a function, it will be usable in the events
                sheet. Functions are grouped by extensions. Choose, or enter the
                name of a new extension, and a function name, then configure the
                function and its parameters.
              </DismissableAlertMessage>
              <ColumnStackLayout noMargin expand noOverflowParent>
                <ResponsiveLineStackLayout noMargin expand>
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
                          if (
                            extensionName === CREATE_NEW_EXTENSION_PLACEHOLDER
                          ) {
                            this.setState({
                              createNewExtension: true,
                              extensionName: getSafeExtensionName(
                                project,
                                'MyExtension'
                              ),
                            });
                          } else {
                            this.setState({
                              createNewExtension: false,
                              extensionName,
                            });
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
                        {eventsFunctionsExtensions.map(
                          eventsFunctionsExtension => (
                            <SelectOption
                              key={eventsFunctionsExtension.getName()}
                              value={eventsFunctionsExtension.getName()}
                              label={
                                eventsFunctionsExtension.getFullName() ||
                                eventsFunctionsExtension.getName()
                              }
                            />
                          )
                        )}
                        <SelectOption
                          value={CREATE_NEW_EXTENSION_PLACEHOLDER}
                          label={t`<Create a New Extension>`}
                        />
                      </CompactSelectField>
                    }
                  />
                  {createNewExtension ? (
                    <CompactPropertiesEditorRowField
                      label={i18n._(t`Extension name`)}
                      markdownDescription={i18n._(t`New extension name`)}
                      field={
                        <CompactSemiControlledTextField
                          commitOnBlur
                          value={extensionName}
                          onChange={(extensionName: string) =>
                            this.setState({
                              extensionName: getSafeExtensionName(
                                project,
                                extensionName
                              ),
                            })
                          }
                        />
                      }
                    />
                  ) : null}
                </ResponsiveLineStackLayout>
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
                        this.forceUpdate();
                      }}
                    />
                  }
                />
                {hasLotsOfParameters ? (
                  <Line>
                    <AlertMessage kind="warning">
                      <Trans>
                        This function will have a lot of parameters. Consider
                        creating groups or functions for a smaller set of
                        objects so that the function is easier to reuse.
                      </Trans>
                    </AlertMessage>
                  </Line>
                ) : null}
              </ColumnStackLayout>
              <CompactEventsFunctionPropertiesEditor
                project={project}
                eventsFunction={eventsFunction}
                eventsBasedBehavior={null}
                eventsBasedObject={null}
                eventsFunctionsContainer={null}
                eventsFunctionsExtension={null}
                onConfigurationUpdated={() => {
                  // Force re-running logic to see if Create button is disabled.
                  this.forceUpdate();
                }}
                freezeEventsFunctionType
              />
              {this._projectScopedContainersAccessor && (
                <CompactEventsFunctionParametersEditor
                  project={project}
                  projectScopedContainersAccessor={
                    this._projectScopedContainersAccessor
                  }
                  eventsFunction={eventsFunction}
                  eventsBasedBehavior={null}
                  eventsBasedObject={null}
                  eventsFunctionsContainer={null}
                  eventsFunctionsExtension={null}
                  onParametersUpdated={() => {
                    // Force the dialog to adapt its size
                    this.forceUpdate();
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
              )}
            </ColumnStackLayout>
          </Dialog>
        )}
      </I18n>
    );
  }
}

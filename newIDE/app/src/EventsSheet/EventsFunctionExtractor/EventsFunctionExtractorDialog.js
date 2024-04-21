// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { enumerateEventsFunctionsExtensions } from '../../ProjectManager/EnumerateProjectItems';
import { Line, Column } from '../../UI/Grid';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import {
  setupFunctionFromEvents,
  canCreateEventsFunction,
  functionHasLotsOfParameters,
  validateExtensionNameUniqueness,
  validateExtensionName,
  validateEventsFunctionNameUniqueness,
  validateEventsFunctionName,
} from '.';
import AlertMessage from '../../UI/AlertMessage';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import { EventsFunctionParametersEditor } from '../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/EventsFunctionParametersEditor';
import { EventsFunctionPropertiesEditor } from '../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/EventsFunctionPropertiesEditor';
import HelpButton from '../../UI/HelpButton';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
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
  state = {
    eventsFunction: null,
    extensionName: '',
    createNewExtension: false,
  };

  componentDidMount() {
    const {
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
      serializedEvents,
    } = this.props;

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
    const eventsFunctionsExtensions = enumerateEventsFunctionsExtensions(
      project
    );
    if (eventsFunctionsExtensions.length === 0) {
      this.setState({
        createNewExtension: true,
      });
    }
  }

  componentWillUnmount() {
    const { eventsFunction } = this.state;
    if (eventsFunction) eventsFunction.delete();
  }

  _getFunctionGroupNames = (): Array<string> => {
    const { createNewExtension, extensionName } = this.state;
    if (createNewExtension || !extensionName) {
      return [];
    }
    const groupNames = new Set<string>();
    const { project } = this.props;
    const eventsFunctionsExtension = project.getEventsFunctionsExtension(
      extensionName
    );
    for (
      let index = 0;
      index < eventsFunctionsExtension.getEventsFunctionsCount();
      index++
    ) {
      const groupName = eventsFunctionsExtension
        .getEventsFunctionAt(index)
        .getGroup();
      if (groupName) {
        groupNames.add(groupName);
      }
    }
    return [...groupNames].sort((a, b) => a.localeCompare(b));
  };

  render() {
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
              !canCreateEventsFunction(project, extensionName, eventsFunction)
            }
            onClick={onApply}
          />,
        ]}
        open
        cannotBeDismissed
        onRequestClose={onClose}
        onApply={onApply}
      >
        <ColumnStackLayout noMargin>
          <DismissableAlertMessage
            identifier="function-extractor-explanation"
            kind="info"
          >
            After creating a function, it will be usable in the events sheet.
            Functions are grouped by extensions. Choose, or enter the name of a
            new extension, and a function name, then configure the function and
            its parameters.
          </DismissableAlertMessage>
          <Column noMargin>
            <ResponsiveLineStackLayout noMargin expand>
              <SelectField
                floatingLabelText={
                  <Trans>Extension (storing the function)</Trans>
                }
                value={
                  createNewExtension
                    ? CREATE_NEW_EXTENSION_PLACEHOLDER
                    : extensionName
                }
                onChange={(e, i, extensionName) => {
                  if (extensionName === CREATE_NEW_EXTENSION_PLACEHOLDER) {
                    this.setState({
                      createNewExtension: true,
                      extensionName: '',
                    });
                  } else {
                    this.setState({
                      createNewExtension: false,
                      extensionName,
                    });
                  }
                }}
                fullWidth
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
              </SelectField>
              {createNewExtension ? (
                <SemiControlledTextField
                  commitOnBlur
                  value={extensionName}
                  floatingLabelText={<Trans>New extension name</Trans>}
                  onChange={(extensionName: string) =>
                    this.setState({ extensionName })
                  }
                  fullWidth
                  errorText={
                    !validateExtensionNameUniqueness(project, extensionName) ? (
                      <Trans>
                        This name is already taken by another extension.
                      </Trans>
                    ) : !validateExtensionName(extensionName) ? (
                      <Trans>
                        This name is not valid. Only use alphanumeric characters
                        (0-9, a-z) and underscores.
                      </Trans>
                    ) : (
                      undefined
                    )
                  }
                />
              ) : null}
            </ResponsiveLineStackLayout>
            <Line>
              <SemiControlledTextField
                commitOnBlur
                value={eventsFunction.getName()}
                floatingLabelText={<Trans>Function name</Trans>}
                onChange={(functionName: string) => {
                  eventsFunction.setName(functionName);
                  this.forceUpdate();
                }}
                fullWidth
                errorText={
                  !validateEventsFunctionNameUniqueness(
                    project,
                    extensionName,
                    eventsFunction
                  ) ? (
                    <Trans>
                      This name is already taken by another function. Choose
                      another name.
                    </Trans>
                  ) : !validateEventsFunctionName(eventsFunction.getName()) ? (
                    <Trans>
                      This name is not valid. Only use alphanumeric characters
                      (0-9, a-z) and underscores.
                    </Trans>
                  ) : (
                    undefined
                  )
                }
              />
            </Line>
            {hasLotsOfParameters ? (
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
          </Column>
          <EventsFunctionPropertiesEditor
            project={project}
            eventsFunction={eventsFunction}
            eventsBasedBehavior={null}
            eventsBasedObject={null}
            eventsFunctionsContainer={null}
            onConfigurationUpdated={() => {
              // Force re-running logic to see if Create button is disabled.
              this.forceUpdate();
            }}
            freezeEventsFunctionType
            getFunctionGroupNames={this._getFunctionGroupNames}
          />
          <EventsFunctionParametersEditor
            project={project}
            eventsFunction={eventsFunction}
            eventsBasedBehavior={null}
            eventsBasedObject={null}
            eventsFunctionsContainer={null}
            onParametersUpdated={() => {
              // Force the dialog to adapt its size
              this.forceUpdate();
            }}
            freezeParameters
          />
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

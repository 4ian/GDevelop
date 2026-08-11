// @flow
import * as React from 'react';

import CompactEventsFunctionParametersEditor from '../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/CompactEventsFunctionParametersEditor';
import {
  type ProjectScopedContainersAccessor,
} from '../InstructionOrExpression/EventsScope';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunction: gdEventsFunction,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

const noop = () => {};

/**
 * The shared, read-only parameter view for fixed scene lifecycle functions.
 * It deliberately reuses the same parameter editor used by Extension,
 * Behavior and Prefab functions so parameter names, types and descriptions are
 * presented consistently.
 */
const SceneLifecycleFunctionParametersEditor = ({
  project,
  projectScopedContainersAccessor,
  eventsFunction,
  onWillInstallExtension,
  onExtensionInstalled,
}: Props): React.Node => (
  <CompactEventsFunctionParametersEditor
    project={project}
    projectScopedContainersAccessor={projectScopedContainersAccessor}
    eventsFunction={eventsFunction}
    eventsBasedBehavior={null}
    eventsBasedObject={null}
    eventsFunctionsContainer={null}
    eventsFunctionsExtension={null}
    onParametersUpdated={noop}
    freezeParameters
    freezeParameterDescriptions
    onFunctionParameterWillBeRenamed={noop}
    onFunctionParameterTypeChanged={noop}
    onWillInstallExtension={onWillInstallExtension}
    onExtensionInstalled={onExtensionInstalled}
  />
);

export default SceneLifecycleFunctionParametersEditor;

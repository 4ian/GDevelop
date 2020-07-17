// @flow
import { t } from '@lingui/macro';
import { useCommand } from '../CommandPalette/CommandHooks';

const openProjectPropertiesCommandText = t`Open project properties`;
const openProjectVariablesCommandText = t`Edit global variables`;
const openPlatformSpecificAssetsCommandText = t`Open project icons`;
const openResourcesCommandText = t`Open project resources`;

type Props = {|
  project: ?gdProject,
  onOpenProjectProperties: () => void,
  onOpenProjectVariables: () => void,
  onOpenResourcesDialog: () => void,
  onOpenPlatformSpecificAssetsDialog: () => void,
|};

const ProjectManagerCommands = (props: Props) => {
  useCommand('OPEN_PROJECT_PROPERTIES', !!props.project, {
    displayText: openProjectPropertiesCommandText,
    handler: props.onOpenProjectProperties,
  });

  useCommand('OPEN_PROJECT_VARIABLES', !!props.project, {
    displayText: openProjectVariablesCommandText,
    handler: props.onOpenProjectVariables,
  });

  useCommand('OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG', !!props.project, {
    displayText: openPlatformSpecificAssetsCommandText,
    handler: props.onOpenPlatformSpecificAssetsDialog,
  });

  useCommand('OPEN_PROJECT_RESOURCES', !!props.project, {
    displayText: openResourcesCommandText,
    handler: props.onOpenResourcesDialog,
  });

  return null;
};

export default ProjectManagerCommands;

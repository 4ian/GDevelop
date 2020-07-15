// @flow
import { t } from '@lingui/macro';
import { useCommand } from '../CommandPalette/CommandHooks';

const openProjectPropertiesCommandText = t`Open project properties`;
const openProjectVariablesCommandText = t`Edit global variables`;
const openPlatformSpecificAssetsCommandText = t`Open project icons`;
const openResourcesCommandText = t`Open project resources`;

type Props = {
  project: ?gdProject,
  onOpenProjectProperties: () => void,
  onOpenProjectVariables: () => void,
  onOpenResourcesDialog: () => void,
  onOpenPlatformSpecificAssetsDialog: () => void,
};

const ProjectManagerCommands = (props: Props) => {
  useCommand('OPEN_PROJECT_PROPERTIES', {
    displayText: openProjectPropertiesCommandText,
    enabled: !!props.project,
    handler: props.onOpenProjectProperties,
  });

  useCommand('OPEN_PROJECT_VARIABLES', {
    displayText: openProjectVariablesCommandText,
    enabled: !!props.project,
    handler: props.onOpenProjectVariables,
  });

  useCommand('OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG', {
    displayText: openPlatformSpecificAssetsCommandText,
    enabled: !!props.project,
    handler: props.onOpenPlatformSpecificAssetsDialog,
  });

  useCommand('OPEN_PROJECT_RESOURCES', {
    displayText: openResourcesCommandText,
    enabled: !!props.project,
    handler: props.onOpenResourcesDialog,
  });

  return null;
};

export default ProjectManagerCommands;

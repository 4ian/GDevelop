// @flow
import { t } from '@lingui/macro';
import { useCommand } from '../CommandPalette/CommandHooks';

const openProjectPropertiesCommandText = t`Open project properties`;
const openProjectVariablesCommandText = t`Edit global variables`;
const openIconsCommandText = t`Open game icons`;
const openResourcesCommandText = t`Open project resources`;

type Props = {
  project: ?gdProject,
  onOpenProjectProperties: () => void,
  onOpenProjectVariables: () => void,
  onOpenIconsDialog: () => void,
  onOpenResources: () => void,
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

  useCommand('OPEN_ICONS', {
    displayText: openIconsCommandText,
    enabled: !!props.project,
    handler: props.onOpenIconsDialog,
  });

  useCommand('OPEN_RESOURCES', {
    displayText: openResourcesCommandText,
    enabled: !!props.project,
    handler: props.onOpenResources,
  });

  return null;
};

export default ProjectManagerCommands;

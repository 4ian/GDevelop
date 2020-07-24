// @flow
import { useCommand } from '../CommandPalette/CommandHooks';

type Props = {|
  project: ?gdProject,
  onOpenProjectProperties: () => void,
  onOpenProjectVariables: () => void,
  onOpenResourcesDialog: () => void,
  onOpenPlatformSpecificAssetsDialog: () => void,
|};

const ProjectManagerCommands = (props: Props) => {
  useCommand('OPEN_PROJECT_PROPERTIES', !!props.project, {
    handler: props.onOpenProjectProperties,
  });

  useCommand('OPEN_PROJECT_VARIABLES', !!props.project, {
    handler: props.onOpenProjectVariables,
  });

  useCommand('OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG', !!props.project, {
    handler: props.onOpenPlatformSpecificAssetsDialog,
  });

  useCommand('OPEN_PROJECT_RESOURCES', !!props.project, {
    handler: props.onOpenResourcesDialog,
  });

  return null;
};

export default ProjectManagerCommands;

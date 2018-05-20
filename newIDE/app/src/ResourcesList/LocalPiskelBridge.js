// @flow
import optionalRequire from '../Utils/OptionalRequire.js';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

/**
 * Open Piskel editor for the specified resources.
 * Take a list of resource names to be edited and will call the callback methods
 * (notably onChangesSaved with the name of the edited resources)
 */
export const openPiskel = ({
  project,
  resourcesLoader,
  resourceNames,
  onChangesSaved,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;

  const resources = resourceNames.map((resourceName, originalIndex) => {
    let resourcePath = resourcesLoader.getResourceFullUrl(
      project,
      resourceName
    );

    //TODO: check if this is necessary or if resourcesLoader should be updated.
    resourcePath = resourcePath.substring(
      7,
      resourcePath.lastIndexOf('?cache=')
    );
    return { resourcePath, resourceName, originalIndex };
  });

  const projectPath = path.dirname(project.getProjectFile());
  const completePiskelOptions = {
    ...extraOptions,
    resources,
    projectPath,
  };

  // Listen to events meaning that edition in Piskel is finished
  ipcRenderer.removeAllListeners('piskel-changes-saved');
  ipcRenderer.on('piskel-changes-saved', (event, outputResources) => {
    const resourcesManager = project.getResourcesManager();
    outputResources.forEach(resource => {
      const imageResource = new gd.ImageResource();
      imageResource.setFile(path.relative(projectPath, resource.path));
      imageResource.setName(resource.name);
      resourcesManager.addResource(imageResource);
      imageResource.delete();
    });

    onChangesSaved(outputResources);
  });

  // Issue the event to open piskel
  ipcRenderer.send('piskel-open-then-load-animation', completePiskelOptions);
};

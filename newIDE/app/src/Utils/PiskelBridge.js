// @flow
import Window from './Window.js';
import optionalRequire from './OptionalRequire.js';
import ResourcesLoader from '../ResourcesLoader/index.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

type OpenOptions = {|
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceNames: Array<string>,
  onChangesSaved: (
    Array<{ path: string, name: string, originalIndex: ?number }>
  ) => void,
  piskelOptions: {
    name: string,
    isLooping: boolean,
    fps: number,
  },
|};

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
  piskelOptions,
}: OpenOptions) => {
  if (!electron || !ipcRenderer) {
    Window.showMessageBox(
      'This feature is only supported in the desktop version for now!\nDownload it from GDevelop website.'
    );
    return;
  }

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
    ...piskelOptions,
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

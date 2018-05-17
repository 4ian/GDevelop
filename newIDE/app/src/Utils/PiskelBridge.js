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
  resourceNames: Array < string >,
  onChangesSaved: (Array<string>) => void,
  onChangesCanceled: () => void,
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
  onChangesCanceled,
  piskelOptions,
}: OpenOptions) => {
  if (!electron || !ipcRenderer) {
    Window.showMessageBox(
      'This feature is only supported in the desktop version for now!\nDownload it from GDevelop website.'
    );
    return;
  }

  const resourceFullUrls = resourceNames.map(resourceName => {
    let resourceFullUrl = resourcesLoader.getResourceFullUrl(
      project,
      resourceName
    );

    //TODO: check if this is necessary or if resourcesLoader should be updated.
    resourceFullUrl = resourceFullUrl.substring(
      7,
      resourceFullUrl.lastIndexOf('?cache=')
    );
    return resourceFullUrl;
  });

  const completePiskelOptions = {
    ...piskelOptions,
    imageFrames: resourceFullUrls,
    imageNames: resourceNames,
    projectFolder: path.dirname(project.getProjectFile()),
  };

  // Listen to events meaning that edition in Piskel is finished
  ipcRenderer.removeAllListeners('piskel-changes-saved');
  ipcRenderer.on('piskel-changes-saved', (event, imageResources) => {
    const resourcesManager = project.getResourcesManager();

    const outputResourceNames = imageResources.map(image => {
      const imageResource = new gd.ImageResource();
      imageResource.setFile(image.path); // TODO: should be made relative to project folder.
      imageResource.setName(image.name);
      resourcesManager.addResource(imageResource);
      imageResource.delete();

      return image;
    });

    onChangesSaved(outputResourceNames);
  });

  // Issue the event to open piskel
  ipcRenderer.send('piskel-open-then-load-animation', completePiskelOptions);
};

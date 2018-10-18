import optionalRequire from '../Utils/OptionalRequire.js';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';

const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

/**
 * Open JSFX to create wav resources.
 */
export const openJsfx = ({
  project,
  resourcesLoader,
  resourceNames,
  onChangesSaved,
  resourcePath,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;
  const projectPath = path.dirname(project.getProjectFile());

  let initialResourcePath = '';
  initialResourcePath = resourcesLoader.getFullUrl(project, resourceNames[0]);
  initialResourcePath = initialResourcePath.substring(
    7,
    initialResourcePath.lastIndexOf('?cache=')
  );

  const jsfxData = {
    resourcePath: initialResourcePath,
    metadata: extraOptions.initialResourceMetadata,
    projectPath,
  };

  ipcRenderer.removeAllListeners('jsfx-changes-saved');
  ipcRenderer.on('jsfx-changes-saved', (event, newFilePath, fileMetadata) => {
    const resourcesManager = project.getResourcesManager();
    const resourceName = path.relative(projectPath, newFilePath); //Still needed for onChangesSaved()
    const audioResource = new gd.AudioResource();
    audioResource.setFile(resourceName);
    audioResource.setName(resourceName);
    resourcesManager.addResource(audioResource);
    audioResource.delete();
    const newMetadata = {
      jsfx: fileMetadata,
    };

    onChangesSaved([{ metadata: newMetadata }], resourceName);
  });

  ipcRenderer.send('jsfx-create-wav', jsfxData);
};

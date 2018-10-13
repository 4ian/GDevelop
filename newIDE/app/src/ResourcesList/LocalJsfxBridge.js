// @flow
import optionalRequire from '../Utils/OptionalRequire.js';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';
// import ResourcesLoader from '../ResourcesLoader';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

/**
 * Open JSFX to create wav resources.
 * For now it can only create sound effect resources, but later on when we can store metadata,
 * This code will be refactored to support editing them too.
 */
export const openJsfx = ({
  project,
  onChangesSaved,
  resourcePath,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;
  const projectPath = path.dirname(project.getProjectFile());

  const jsfxData = {
    ...extraOptions,
    resourcePath,
    projectPath,
  };

  ipcRenderer.removeAllListeners('jsfx-changes-saved');
  ipcRenderer.on(
    'jsfx-changes-saved',
    (event, newFilePath, fileMetadata) => {
      const resourcesManager = project.getResourcesManager();
      const resourceMetadata ={jsfx:fileMetadata}
      console.log('Stored metadata:')
      console.log(resourceMetadata)
      const audioResource = new gd.AudioResource();
      const resourceName = path.relative(projectPath, newFilePath); // Still needed for onChangesSaved()
      audioResource.setFile(resourceName);
      audioResource.setName(resourceName); 
      audioResource.setMetadata(JSON.stringify(resourceMetadata))
      resourcesManager.addResource(audioResource);
      audioResource.delete();
      /// finally we will apply it below
      onChangesSaved(resourceName);
    }
  );

  ipcRenderer.send('jsfx-create-wav', jsfxData);
};

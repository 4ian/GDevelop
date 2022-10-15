// @flow
import optionalRequire from '../Utils/OptionalRequire';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';
import {
  createOrUpdateResource,
  getLocalResourceFullPath,
} from './ResourceUtils';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd: libGDevelop = global.gd;

/**
 * Open Piskel editor for the specified resources.
 * Take a list of resource names to be edited and will call the callback methods
 * (notably onChangesSaved with the name of the edited resources)
 */
export const openPiskel = ({
  project,
  resourcesLoader,
  resourceNames,
  singleFrame,
  onChangesSaved,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;

  const resources = resourceNames.map((resourceName, originalIndex) => {
    let resourcePath = getLocalResourceFullPath(project, resourceName);
    return {
      resourcePath,
      resourceName,
      originalIndex,
    };
  });

  const projectPath = path.dirname(project.getProjectFile());
  const externalEditorData = {
    ...extraOptions,
    resources,
    singleFrame,
    projectPath,
  };

  // Listen to events meaning that edition in Piskel is finished
  ipcRenderer.removeAllListeners('piskel-changes-saved');
  ipcRenderer.on(
    'piskel-changes-saved',
    (event, outputResources, newAnimationName, externalEditorData) => {
      const metadata = externalEditorData.data
        ? { pskl: externalEditorData }
        : null;

      const resourcesManager = project.getResourcesManager();
      outputResources.forEach(resource => {
        resource.name = path.relative(projectPath, resource.path); // Still needed for onChangesSaved()
        createOrUpdateResource(project, new gd.ImageResource(), resource.name);
      });

      outputResources[0].metadata = metadata;
      outputResources[0].newAnimationName = newAnimationName;
      // in case this is for a single frame object, save the metadata in the Image object
      if (externalEditorData.singleFrame) {
        if (metadata) {
          resourcesManager
            .getResource(path.relative(projectPath, outputResources[0].path))
            .setMetadata(JSON.stringify(metadata));
        }
        onChangesSaved(outputResources);
      } else {
        // In case there are multiple frames, pass back the metadata to the editor and let it store it at an appropriate place.
        // (For example, for sprites, SpritesList.js will save it in the metadata of the gd.Direction).

        onChangesSaved(outputResources);
      }
    }
  );

  // Issue the event to open piskel
  ipcRenderer.send('piskel-open-then-load-animation', externalEditorData);
};

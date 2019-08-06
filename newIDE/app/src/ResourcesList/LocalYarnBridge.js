// @flow
import optionalRequire from '../Utils/OptionalRequire.js';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';
import {
  createOrUpdateResource,
  getLocalResourceFullPath,
} from './ResourceUtils.js';

const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

/**
 * Open YARN to Create/Edit Json Dialogue Tree resources.
 */
export const openYarn = ({
  project,
  resourcesLoader,
  resourceNames,
  onChangesSaved,
  resourcePath,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;
  const projectPath = path.dirname(project.getProjectFile());
  const initialResourcePath = getLocalResourceFullPath(
    project,
    resourceNames[0]
  );

  const externalEditorData = {
    resourcePath: initialResourcePath,
    // $FlowFixMe - TODO: There is an error here to be solved.
    externalEditorData: extraOptions.externalEditorData,
    projectPath,
  };

  ipcRenderer.removeAllListeners('yarn-changes-saved');
  ipcRenderer.on(
    'yarn-changes-saved',
    (event, newFilePath, externalEditorData) => {
      const resourceName = path.relative(projectPath, newFilePath);
      createOrUpdateResource(project, new gd.JsonResource(), resourceName);

      // $FlowFixMe - TODO: There is an error here to be solved.
      onChangesSaved([{}], resourceName);
    }
  );

  ipcRenderer.send('yarn-create-json', externalEditorData);
};

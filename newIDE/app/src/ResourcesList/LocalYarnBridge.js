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
 * Open YARN to Create/Edit Json Dialogue Tree resources.
 */
export const openYarn = ({
  project,
  resourcesLoader,
  resourceNames,
  onChangesSaved,
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
    externalEditorData: extraOptions.externalEditorData,
    projectPath,
  };

  ipcRenderer.removeAllListeners('yarn-changes-saved');
  ipcRenderer.on('yarn-changes-saved', (event, newFilePath) => {
    const name = path.relative(projectPath, newFilePath);
    createOrUpdateResource(project, new gd.JsonResource(), name);
    onChangesSaved([{ name }]);
  });

  ipcRenderer.send('yarn-create-json', externalEditorData);
};

// // @flow
// import optionalRequire from '../Utils/OptionalRequire';
// import { type ExternalEditorInput, type ExternalEditorOutput } from './ResourceExternalEditor.flow';
// import {
//   createOrUpdateResource,
//   getLocalResourceFullPath,
// } from './ResourceUtils';

// const electron = optionalRequire('electron');
// const path = optionalRequire('path');
// const ipcRenderer = electron ? electron.ipcRenderer : null;
// const gd: libGDevelop = global.gd;

// /**
//  * Open YARN to Create/Edit Json Dialogue Tree resources.
//  */
// export const openYarn = async ({
//   project,
//   resourceNames,
//   onChangesSaved,
//   extraOptions,
// }: ExternalEditorInput): Promise<ExternalEditorOutput> => {
//   if (!electron || !ipcRenderer) return;
//   const projectPath = path.dirname(project.getProjectFile());
//   const initialResourcePath = getLocalResourceFullPath(
//     project,
//     resourceNames[0]
//   );

//   const externalEditorData = {
//     resourcePath: initialResourcePath,
//     externalEditorData: extraOptions.externalEditorData,
//     projectPath,
//   };

//   ipcRenderer.removeAllListeners('yarn-closed');
//   ipcRenderer.on('yarn-closed', (event, newFilePath) => {
//     const name = path.relative(projectPath, newFilePath);
//     createOrUpdateResource(project, new gd.JsonResource(), name);
//     onChangesSaved([{ name }]);
//   });

//   ipcRenderer.send('yarn-load', externalEditorData);
// };

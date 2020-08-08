// @flow
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const ipc = electron ? electron.ipcRenderer : null;

/*::
type Params = {
  project?: gdProject,
  resetDate?: boolean,
};
*/

const updatePresence = (params /*: ?Params */) => {
  if (ipc === null) return;

  params = params || {};
  const { project, resetDate } = params;

  if (resetDate === true) updatePresence.date = Date.now();
  updatePresence.date = updatePresence.date || Date.now();

  let state = {
    details: 'Making a game with GDevelop.',
    state: 'Not working on any game.',
    startTimestamp: updatePresence.date,
    largeImageKey: 'gdicon',
    largeImageText: 'GDevelop',
  };

  if (project) state.state = `Working on ${project.getName()}.`;

  ipc.send('update-discord-rp', state);
};

export default updatePresence;

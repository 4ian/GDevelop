// @flow
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const ipc = electron ? electron.ipcRenderer : null;

/*::
type Params = {
  project : ?gdProject,
  resetDate: ?boolean,
};
*/

const updatePrsence = (params /*: ?Params */) => {
  if (ipc === null) return;

  params = params || {};
  const { project, resetDate } = params;

  if (resetDate === true) updatePrsence.date = Date.now();
  updatePrsence.date = updatePrsence.date || Date.now();

  let state = {
    details: 'Making a game with GDevelop.',
    state: 'Not working on any game.',
    startTimestamp: updatePrsence.date,
    largeImageKey: 'gdicon',
    largeImageText: 'GDevelop',
  };

  if (project) state.state = `Working on ${project.getName()}.`;

  ipc.send('update-discord-rp', state);
};

export default updatePrsence;

// @flow
import { useEffect, useState } from 'react';
import optionalRequire from './OptionalRequire';
const electron = optionalRequire('electron');
const ipc = electron ? electron.ipcRenderer : null;

const updateDiscordRichPresence = (project: ?gdProject) => {
  if (ipc === null) return;
  if (!updateDiscordRichPresence.date)
    updateDiscordRichPresence.date = Date.now();

  let state = {
    details: project ? 'Working on:' : 'Not working on',
    state: project ? project.getName() : 'any game',
    startTimestamp: updateDiscordRichPresence.date,
    largeImageKey: 'gdicon',
    largeImageText: 'GDevelop',
  };

  ipc.send('update-discord-rich-presence', state);
};

export const useDiscordRichPresence = (project: ?Project) => {
  const [lastCallTime, setLastCallTime] = useState(0);
  useEffect(() => updateDiscordRichPresence(project));
  useEffect(
    () => {
      console.log('hello');
      if (performance.now() - lastCallTime > 60000) {
        setLastCallTime(performance.now());
        updateDiscordRichPresence(project);
      }
      // We don't want lastCallTime as dependency
      // eslint-disable-next-line
    },
    [project]
  );
};

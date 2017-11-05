import { getUserUUID } from './UserUUID';
const FS = global.FS;

export const installFullstory = () => {
  if (FS) {
    FS.identify(getUserUUID(), {
      // displayName: 'Daniel Falko',
      // email: 'danielfalko@example.com',
    });
  }
};

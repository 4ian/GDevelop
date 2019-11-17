import Raven from 'raven-js';
import { getUserUUID } from './UserUUID';
import { getIDEVersionWithHash } from '../../Version';
const isDev = process.env.NODE_ENV === 'development';

export const installRaven = () => {
  if (isDev) return;

  Raven.config('https://e10c176ee68f432199cd292ba181e03b@sentry.io/233519', {
    release: getIDEVersionWithHash(),
  })
    .install()
    .setUserContext({
      id: getUserUUID(),
    });
};

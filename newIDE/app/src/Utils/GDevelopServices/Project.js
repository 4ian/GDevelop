// @flow
import axios from 'axios';
import { GDevelopProjectApi } from './ApiConfigs';
import optionalRequire from '../OptionalRequire';
const remote = optionalRequire('@electron/remote');

const client = axios.create({
  withCredentials: true,
});

export const getToken = async (projectId: string): Promise<void> => {
  const response = await client.get(
    `${GDevelopProjectApi.baseUrl}/project/${projectId}/action/authorize`,
    {
      params: { userId: '45' },
      withCredentials: true,
    }
  );
  return response.data;
};

export const getFile = async (): Promise<void> => {
  let cookie = null;
  if (remote) {
    const cookies = await remote.session.defaultSession.cookies.get({
      domain: 'gdevelop.io',
    });
    cookies.forEach(cookie => {
      console.log(cookie.domain);
      console.log(cookie.value);
    });
  }
  const response = await axios.get(
    'https://project-resources-dev.gdevelop.io/project4/hello.txt',
    {
      withCredentials: true,
      headers: {},
    }
  );
  console.log(response.data);
};

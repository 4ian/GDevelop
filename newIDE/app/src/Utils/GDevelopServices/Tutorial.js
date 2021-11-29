// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';

export type Tutorial = {
  id: string,
  title: string,
  description: string,
  type: 'video' | 'text',
  link: string,
  thumbnailUrl: string,
};

export const listAllTutorials = (): Promise<Array<Tutorial>> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/tutorial`)
    .then(response => response.data);
};

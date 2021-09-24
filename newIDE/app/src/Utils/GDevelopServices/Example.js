// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type Filters } from './Types.flow';
import { type UserPublicProfile } from './User';

export type ExampleShortHeader = {|
  id: string,
  name: string,
  shortDescription: string,
  license: string,
  tags: Array<string>,
  authors?: Array<UserPublicProfile>,
  previewImageUrls: Array<string>,
  gdevelopVersion: string,
|};

export type Example = {|
  ...ExampleShortHeader,
  description: string,
  projectFileUrl: string,
  authors: Array<string>,
|};

export type AllExamples = {|
  exampleShortHeaders: Array<ExampleShortHeader>,
  filters: Filters,
|};

export const listAllExamples = (): Promise<AllExamples> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/example`)
    .then(response => response.data)
    .then(({ exampleShortHeadersUrl, filtersUrl }) => {
      if (!exampleShortHeadersUrl || !filtersUrl) {
        throw new Error('Unexpected response from the example endpoint.');
      }
      return Promise.all([
        axios.get(exampleShortHeadersUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([exampleShortHeaders, filters]) => ({
        exampleShortHeaders,
        filters,
      }));
    });
};

export const getExample = (
  exampleShortHeader: ExampleShortHeader
): Promise<Example> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/example/${exampleShortHeader.id}`)
    .then(response => response.data)
    .then(({ exampleUrl }) => {
      if (!exampleUrl) {
        throw new Error('Unexpected response from the example endpoint.');
      }

      return axios.get(exampleUrl);
    })
    .then(response => response.data);
};

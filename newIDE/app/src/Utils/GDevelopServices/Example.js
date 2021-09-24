// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type Filters } from './Filters';
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

export const listAllExamples = async (): Promise<AllExamples> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example-short-header-and-filter`
  );

  return response.data;
};

export const getExample = async (
  exampleShortHeader: ExampleShortHeader
): Promise<Example> => {
  const exampleResponse = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example-v2/${exampleShortHeader.id}`
  );

  return exampleResponse.data;
};

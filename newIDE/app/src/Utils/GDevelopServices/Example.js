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

export const listAllExamples = async (): Promise<AllExamples> => {
  const examplesResponse = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example`
  );

  const { examplesDatabase, filtersUrl } = examplesResponse.data;
  if (!filtersUrl) {
    throw new Error('Unexpected response from the example endpoint.');
  }
  const filtersResponse = await axios.get(filtersUrl);

  return {
    exampleShortHeaders: examplesDatabase,
    filters: filtersResponse.data,
  };
};

export const getExample = async (
  exampleShortHeader: ExampleShortHeader
): Promise<Example> => {
  const exampleResponse = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example/${exampleShortHeader.id}`
  );

  return exampleResponse.data.example;
};

// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type Filters } from './Filters';
import { type UserPublicProfileSearch } from './User';

export type ExampleShortHeader = {|
  id: string,
  name: string,
  shortDescription: string,
  license: string,
  tags: Array<string>,
  authors?: Array<UserPublicProfileSearch>,
  authorIds?: Array<UserPublicProfileSearch>,
  previewImageUrls: Array<string>,
  gdevelopVersion: string,
  // Used to highlight text when searching for keywords in examples.
  matches?: Array<{| key: string, indices: number[][] |}>,
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
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example-v2/${exampleShortHeader.id}`
  );

  return response.data;
};

export const getUserExampleShortHeaders = async (
  authorId: string
): Promise<Array<ExampleShortHeader>> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/example-short-header`,
    {
      params: {
        authorId,
      },
    }
  );

  return response.data;
};

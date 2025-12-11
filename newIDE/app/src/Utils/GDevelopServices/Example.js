// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type Filters } from './Filters';
import { type UserPublicProfile } from './User';
import { retryIfFailed } from '../RetryIfFailed';

export type ExampleShortHeader = {|
  id: string,
  slug: string,
  name: string,
  shortDescription: string,
  description: string,
  license: string,
  tags: Array<string>,
  authors?: Array<UserPublicProfile>,
  authorIds?: Array<string>,
  previewImageUrls: Array<string>,
  quickCustomizationImageUrl?: string,
  gdevelopVersion: string,
  codeSizeLevel: string,
  difficultyLevel?: string,
  linkedExampleShortHeaders?: Array<{ slug: string, relation: string }>,
|};

export type Example = {|
  ...ExampleShortHeader,
  projectFileUrl: string,
  authors: Array<string>,
|};

export type AllExamples = {|
  exampleShortHeaders: Array<ExampleShortHeader>,
  filters: Filters,
|};

export const listAllExamples = async (): Promise<AllExamples> => {
  const response = await axios.get(`${GDevelopAssetApi.baseUrl}/example`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { exampleShortHeadersUrl, filtersUrl } = response.data;

  const [exampleShortHeaders, filters] = await Promise.all([
    retryIfFailed(
      { times: 2 },
      async () => (await axios.get(exampleShortHeadersUrl)).data
    ),
    retryIfFailed({ times: 2 }, async () => (await axios.get(filtersUrl)).data),
  ]);

  if (!Array.isArray(exampleShortHeaders)) {
    throw new Error(
      'Invalid response from the example endpoint of the Asset API, expected an array of example short headers.'
    );
  }

  const allExamples: AllExamples = {
    exampleShortHeaders,
    filters,
  };

  return allExamples;
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

  const exampleShortHeaders = response.data;
  if (!Array.isArray(exampleShortHeaders)) {
    throw new Error(
      'Invalid response from the example-short-header endpoint of the Asset API, expected an array of example short headers.'
    );
  }

  return exampleShortHeaders;
};

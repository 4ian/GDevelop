// @flow
import axios from 'axios';
import { GDevelopGenerationApi } from './ApiConfigs';

export type GenerationStatus = 'working' | 'ready' | 'error';

export type GeneratedProject = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  prompt: string,
  status: GenerationStatus,
  width: number,
  height: number,
  projectName: string,
  fileUrl?: string,
  synopsis?: string,
  error?: string,
};

export const getGeneratedProject = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    generatedProjectId,
  }: {|
    userId: string,
    generatedProjectId: string,
  |}
): Promise<GeneratedProject> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/generated-project/${generatedProjectId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const getGeneratedProjects = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<GeneratedProject>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/generated-project`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const createGeneratedProject = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    prompt,
    width,
    height,
    projectName,
  }: {|
    userId: string,
    prompt: string,
    width: number,
    height: number,
    projectName: string,
  |}
): Promise<GeneratedProject> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/generated-project`,
    {
      prompt,
      width,
      height,
      projectName,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

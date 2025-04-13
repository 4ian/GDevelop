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

export type AiRequestMessageAssistantFunctionCall = {|
  type: 'function_call',
  status: 'completed',
  call_id: string,
  name: string,
  arguments: string,
|};

export type AiRequestFunctionCallOutput = {
  type: 'function_call_output',
  call_id: string,
  output: string,
};

export type AiRequestMessage =
  | {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: Array<
        | {
            type: 'reasoning',
            status: 'completed',
            summary: {
              text: string,
              type: 'summary_text',
            },
          }
        | {
            type: 'output_text',
            status: 'completed',
            text: string,
            annotations: Array<{}>,
          }
        | AiRequestMessageAssistantFunctionCall
      >,
    }
  | {
      type: 'message',
      status: 'completed',
      role: 'user',
      content: Array<{
        type: 'user_request',
        status: 'completed',
        text: string,
      }>,
    }
  | AiRequestFunctionCallOutput;

export type AiRequest = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  gameProjectJson: string,
  status: GenerationStatus,
  error: {
    code: string,
    message: string,
  } | null,

  output: Array<AiRequestMessage>,
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

export const getAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
  }: {|
    userId: string,
    aiRequestId: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-request/${aiRequestId}`,
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

export const getAiRequests = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<AiRequest>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-request`,
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

export const createAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    userRequest,
    simplifiedProjectJson,
    payWithCredits,
  }: {|
    userId: string,
    userRequest: string,
    simplifiedProjectJson: string | null,
    payWithCredits: boolean,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/ai-request`,
    {
      userRequest,
      gameProjectJson: simplifiedProjectJson,
      payWithCredits,
      mode: 'agent',
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

export const addUserMessageToAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    userRequest,
    simplifiedProjectJson,
    payWithCredits,
  }: {|
    userId: string,
    aiRequestId: string,
    userRequest: string,
    simplifiedProjectJson: string | null,
    payWithCredits: boolean,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/add-user-message`,
    {
      userRequest,
      gameProjectJson: simplifiedProjectJson,
      payWithCredits,
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

export const addFunctionCallOutputsToAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    functionCallOutputs,
  }: {|
    userId: string,
    aiRequestId: string,
    functionCallOutputs: Array<AiRequestFunctionCallOutput>,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/add-function-call-output`,
    {
      functionCallOutputs
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

export const sendAiRequestFeedback = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    messageIndex,
    feedback,
    reason,
  }: {|
    userId: string,
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/set-feedback`,
    {
      messageIndex,
      feedback,
      reason,
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

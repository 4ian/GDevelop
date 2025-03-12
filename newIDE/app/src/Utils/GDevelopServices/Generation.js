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
        | {
            type: 'recommended_actions',
            status: 'completed',
            actions: Array<{
              actionName: string,
              actionDescription: string,
            }>,
          }
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
    };

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

const gameProjectJson = `
{
  globalObjects: [
    {
      name: "MyGlobalObject",
      type: "Sprite",
      behaviors: [],
  },
  ],
  scenes: [
    {
      name: "Main menu",
      variables: [],
      objects: [
        {
          name: "Background",
          objectType: "TiledSpriteObject::TiledSprite",
          behaviors: [],
          variables: [],
        },
        {
          name: "Title",
          objectType: "Text",
          behaviors: [],
          variables: [],
        },
        {
          name: "Play",
          objectType: "PanelSpriteButton::PanelSpriteButton",
          behaviors: [],
          variables: [],
        },
        {
          name: "Quit",
          objectType: "PanelSpriteButton::PanelSpriteButton",
          behaviors: [],
          variables: [],
        },
      ],
    },
    {
      name: "Game level",
      variables: [],
      objects: [
        {
          name: "Player",
          objectType: "Sprite",
          behaviors: [{
            name: "MyHealth",
            behaviorType: "Health::Health"
          }, {
            name: "PlatformBehavior",
            behaviorType: "PlatformBehavior::PlatformerObjectBehavior"
          }],
          variables: [],
        },
        {
          name: "Enemy",
          objectType: "Sprite",
          behaviors: [{
            name: "Health",
            behaviorType: "Health::Health"
          }],
          variables: [],
        },
        {
          name: "Quit",
          objectType: "PanelSpriteButton::PanelSpriteButton",
          behaviors: [],
          variables: [],
        },
        {
          name: "JumpBtn",
          objectType: "PanelSpriteButton::PanelSpriteButton",
          behaviors: [],
          variables: [],
        },
        {
          name: "Platform",
          objectType: "TiledSpriteObject::TiledSprite",
          behaviors: [{
            name: "PlatformBehavior",
            behaviorType: "PlatformBehavior::PlatformBehavior"
          }],
          variables: [],
        },
        {
          name: "MovingPlatform",
          objectType: "TiledSpriteObject::TiledSprite",
          behaviors: [{
            name: "PlatformBehavior",
            behaviorType: "PlatformBehavior::PlatformBehavior"
          }],
          variables: [],
        },
      ],
    }
  ]
}
`;

export const createAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    userRequest,
  }: {|
    userId: string,
    userRequest: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/ai-request`,
    {
      userRequest,
      gameProjectJson,
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
  }: {|
    userId: string,
    aiRequestId: string,
    userRequest: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/add-user-message`,
    {
      userRequest,
      gameProjectJson,
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

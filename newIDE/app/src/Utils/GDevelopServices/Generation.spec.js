// @flow
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  addMessageToAiRequest,
  apiClient,
  clearOpenAiCompatibleProviderCompatibilityCacheForTests,
  createAiProviderConfiguration,
  createAiGeneratedEvent,
  createAiRequest,
  deleteAiProviderConfiguration,
  forkAiRequest,
  getAiGeneratedEvent,
  getAiRequest,
  getAiRequestWithPreservedAiConfiguration,
  getAiRequestCustomProviderSupport,
  getAiRequestSuggestions,
  isAiProviderConfigurationRouteUnavailableError,
  isLocalAiProviderBaseUrl,
  isAiProviderUnavailableError,
  listAiProviderConfigurations,
  suspendAiRequest,
  testAiProviderConfiguration,
  updateAiRequestMessage,
  updateAiProviderConfiguration,
  type AiProviderConfiguration,
  type AiProviderConfigurationWritePayload,
  type AiSettings,
} from './Generation';

const getAuthorizationHeader = async () => 'Bearer test-token';

const mockProviderConfiguration: AiProviderConfiguration = {
  id: 'provider-1',
  name: 'OpenAI',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  temperature: null,
  maxTokens: null,
  reasoningEffort: 'high',
  hasApiKey: true,
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
};

const providerPayload: AiProviderConfigurationWritePayload = {
  name: 'OpenAI',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  temperature: 0.2,
  maxTokens: 1000,
  reasoningEffort: 'high',
  apiKey: 'sk-test',
};

const providerPayloadWithoutApiKey: AiProviderConfigurationWritePayload = {
  name: 'OpenAI',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  temperature: 0.2,
  maxTokens: 1000,
  reasoningEffort: 'high',
};

const localProviderPayload: AiProviderConfigurationWritePayload = {
  name: 'Local provider',
  providerType: 'openai-compatible',
  baseUrl: 'http://127.0.0.1:18080/',
  model: 'gpt-5.5',
  temperature: 0.2,
  maxTokens: 1000,
  reasoningEffort: 'high',
  apiKey: 'sk-local',
};

const routeUnavailableResponse: any = [
  403,
  {
    message:
      "Invalid key=value pair (missing equal-sign) in Authorization header: 'Bearer test-token'.",
  },
  {
    'x-amzn-ErrorType': 'IncompleteSignatureException',
  },
];

const baseAiRequestArgs: any = {
  userId: 'user-1',
  userRequest: 'Build a platformer',
  gameProjectJson: null,
  gameProjectJsonUserRelativeKey: null,
  projectSpecificExtensionsSummaryJson: null,
  projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
  payWithCredits: false,
  mode: 'chat',
  gameId: null,
  fileMetadata: null,
  storageProviderName: null,
  toolsVersion: 'test-tools',
};

describe('Generation service', () => {
  let mock: any;
  let providerMock: any;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    providerMock = new MockAdapter(axios);
  });

  afterEach(() => {
    clearOpenAiCompatibleProviderCompatibilityCacheForTests();
    providerMock.restore();
    mock.restore();
  });

  describe('AI requests', () => {
    const expectLocalProviderRequestToRetryWithoutTemperature = async (
      firstErrorResponseData: any
    ) => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBe(0.2);
            expect(data.reasoning_effort).toBe('high');
            return [400, firstErrorResponseData];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBeUndefined();
            expect(data.reasoning_effort).toBe('high');
            return [
              200,
              {
                choices: [{ message: { content: 'pong' } }],
              },
            ];
          });

        const aiRequest = await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(2);
        expect(aiRequest.output && aiRequest.output[1]).toEqual(
          expect.objectContaining({
            role: 'assistant',
            content: [
              {
                type: 'output_text',
                status: 'completed',
                text: 'pong',
                annotations: [],
              },
            ],
          })
        );
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    };

    const expectLocalProviderRequestToRetryWithoutReasoningEffort = async (
      firstErrorResponseData: any
    ) => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBe(0.2);
            expect(data.reasoning_effort).toBe('high');
            return [400, firstErrorResponseData];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBe(0.2);
            expect(data.reasoning_effort).toBeUndefined();
            return [
              200,
              {
                choices: [{ message: { content: 'pong' } }],
              },
            ];
          });

        const aiRequest = await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(2);
        expect(aiRequest.output && aiRequest.output[1]).toEqual(
          expect.objectContaining({
            role: 'assistant',
            content: [
              {
                type: 'output_text',
                status: 'completed',
                text: 'pong',
                annotations: [],
              },
            ],
          })
        );
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    };

    it('uses AI credits only when no custom provider is selected', async () => {
      mock.onPost('/ai-request').reply(config => {
        const data = JSON.parse(config.data);
        expect(config.params).toEqual({ userId: 'user-1' });
        expect(config.headers.Authorization).toBe('Bearer test-token');
        expect(data.aiConfiguration).toEqual({ presetId: 'default' });
        expect(data.providerConfigurationId).toBe(null);
        expect(data.payWithCredits).toBe(false);
        expect(data.payWithAiCredits).toBe(true);
        return [200, { id: 'ai-request-1' }];
      });

      await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: { presetId: 'default' },
      });
    });

    it('sends saved custom provider requests to the backend so build modes can use tools', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => [200, mockProviderConfiguration]);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      mock.onPost('/ai-request').reply(config => {
        const data = JSON.parse(config.data);
        expect(config.params).toEqual({ userId: 'user-1' });
        expect(config.headers.Authorization).toBe('Bearer test-token');
        expect(data.mode).toBe('agent');
        expect(data.aiConfiguration).toEqual({
          presetId: 'default',
          providerConfigurationId: configuration.id,
        });
        expect(data.providerConfigurationId).toBe(configuration.id);
        expect(data.payWithCredits).toBe(false);
        expect(data.payWithAiCredits).toBe(false);
        expect(data.aiConfiguration.providerConfiguration).toBeUndefined();
        return [
          200,
          {
            id: 'ai-request-1',
            aiConfiguration: data.aiConfiguration,
          },
        ];
      });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        mode: 'agent',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(mock.history.post).toHaveLength(1);
      expect(providerMock.history.post).toHaveLength(0);
      expect(aiRequest.id).toBe('ai-request-1');
      expect(aiRequest.aiConfiguration).toEqual({
        presetId: 'default',
        providerConfigurationId: configuration.id,
      });

      mock.onDelete('/ai-provider-configuration/provider-1').reply(() => [204]);
      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('sends localhost custom provider requests directly to the local endpoint', async () => {
      const getAuthorizationHeaderThatShouldNotRun = (jest.fn(async () => {
        throw new Error(
          'Localhost providers should not request authorization.'
        );
      }): any);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      providerMock
        .onPost('http://127.0.0.1:18080/chat/completions')
        .reply(config => {
          expect(config.headers.Authorization).toBe('Bearer sk-local');
          expect(JSON.parse(config.data)).toEqual(
            expect.objectContaining({
              model: 'gpt-5.5',
              reasoning_effort: 'high',
              messages: expect.arrayContaining([
                { role: 'user', content: 'Build a platformer' },
              ]),
            })
          );
          return [
            200,
            {
              choices: [{ message: { content: 'pong' } }],
            },
          ];
        });

      const aiRequest = await createAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        }
      );

      expect(configuration.id).toContain('local-');
      expect(aiRequest.id).toContain('local-custom-provider-ai-request-');
      expect(getAuthorizationHeaderThatShouldNotRun).not.toHaveBeenCalled();
      expect(mock.history.post).toHaveLength(0);
      expect(providerMock.history.post).toHaveLength(1);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('suspends local custom provider requests without calling the backend', async () => {
      const getAuthorizationHeaderThatShouldNotRun = (jest.fn(async () => {
        throw new Error(
          'Local Custom Model requests should not request authorization.'
        );
      }): any);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );
      let resolveSecondReply: any = null;
      let resolveSecondReplyStarted: any = null;
      const secondReplyStarted = new Promise(resolve => {
        resolveSecondReplyStarted = resolve;
      });

      providerMock
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'first answer' } }],
          },
        ])
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(
          () =>
            new Promise(resolve => {
              resolveSecondReply = resolve;
              resolveSecondReplyStarted();
            })
        );

      const aiRequest = await createAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        }
      );
      const addMessagePromise = addMessageToAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
          userMessage: 'Second message',
          gameId: undefined,
          functionCallOutputs: [],
          payWithCredits: false,
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          aiConfiguration: aiRequest.aiConfiguration,
        }
      );
      await secondReplyStarted;

      const suspendedRequest = await suspendAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
        }
      );
      expect(suspendedRequest.status).toBe('suspended');
      expect(mock.history.post).toHaveLength(0);

      resolveSecondReply([
        200,
        {
          choices: [{ message: { content: 'late answer' } }],
        },
      ]);
      const resolvedRequest = await addMessagePromise;

      expect(resolvedRequest.status).toBe('suspended');
      expect(resolvedRequest.output).toHaveLength(
        (aiRequest.output || []).length
      );
      expect(JSON.stringify(resolvedRequest.output)).not.toContain(
        'Second message'
      );
      expect(getAuthorizationHeaderThatShouldNotRun).not.toHaveBeenCalled();

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('forks local custom provider requests by trimming messages', async () => {
      const getAuthorizationHeaderThatShouldNotRun = (jest.fn(async () => {
        throw new Error(
          'Local Custom Model requests should not request authorization.'
        );
      }): any);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      providerMock
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'first answer' } }],
          },
        ])
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(JSON.stringify(data.messages)).toContain('Second message');
          return [
            200,
            {
              choices: [{ message: { content: 'second answer' } }],
            },
          ];
        })
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          const messages = JSON.stringify(data.messages);
          expect(messages).toContain('Build a platformer');
          expect(messages).toContain('Follow up after restore');
          expect(messages).not.toContain('Second message');
          return [
            200,
            {
              choices: [{ message: { content: 'fork answer' } }],
            },
          ];
        });

      const aiRequest = await createAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        }
      );
      const aiRequestWithSecondMessage = await addMessageToAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
          userMessage: 'Second message',
          gameId: undefined,
          functionCallOutputs: [],
          payWithCredits: false,
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          aiConfiguration: aiRequest.aiConfiguration,
        }
      );
      const firstAssistantMessage =
        aiRequest.output && aiRequest.output.length > 1
          ? aiRequest.output[1]
          : null;
      if (!firstAssistantMessage || !firstAssistantMessage.messageId) {
        throw new Error('Expected the first local assistant message to exist.');
      }

      const forkedRequest = await forkAiRequest(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          aiRequestId: aiRequestWithSecondMessage.id,
          upToMessageId: firstAssistantMessage.messageId,
        }
      );

      expect(forkedRequest.id).not.toBe(aiRequest.id);
      expect(forkedRequest.id).toContain('local-custom-provider-ai-request-');
      expect(forkedRequest.forkedFromAiRequestId).toBe(aiRequest.id);
      expect(forkedRequest.forkedAfterOriginalMessageId).toBe(
        firstAssistantMessage.messageId
      );
      expect(forkedRequest.forkedAfterNewMessageId).toBe(
        firstAssistantMessage.messageId
      );
      expect(forkedRequest.output).toHaveLength(2);

      await addMessageToAiRequest(getAuthorizationHeaderThatShouldNotRun, {
        userId: 'user-1',
        aiRequestId: forkedRequest.id,
        userMessage: 'Follow up after restore',
        gameId: undefined,
        functionCallOutputs: [],
        payWithCredits: false,
        gameProjectJson: null,
        gameProjectJsonUserRelativeKey: null,
        projectSpecificExtensionsSummaryJson: null,
        projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
        aiConfiguration: forkedRequest.aiConfiguration,
      });

      expect(mock.history.post).toHaveLength(0);
      expect(getAuthorizationHeaderThatShouldNotRun).not.toHaveBeenCalled();

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('omits reasoning effort for local custom provider requests on auto', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: {
            ...localProviderPayload,
            reasoningEffort: null,
          },
        }
      );

      providerMock
        .onPost('http://127.0.0.1:18080/chat/completions')
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(data.reasoning_effort).toBeUndefined();
          return [
            200,
            {
              choices: [{ message: { content: 'pong' } }],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(providerMock.history.post).toHaveLength(1);
      expect(aiRequest.output && aiRequest.output[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('retries local custom provider requests without temperature when unsupported', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      providerMock
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.temperature).toBe(0.2);
          expect(data.reasoning_effort).toBe('high');
          return [
            400,
            {
              error: {
                message:
                  "Error code: 400 - {'error': {'message': \"Unsupported parameter: 'temperature'\", 'type': 'invalid_request_error', 'param': 'temperature', 'code': 'unsupported_parameter'}}",
                type: 'api_error',
              },
            },
          ];
        })
        .onPost('http://127.0.0.1:18080/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.temperature).toBeUndefined();
          expect(data.reasoning_effort).toBe('high');
          return [
            200,
            {
              choices: [{ message: { content: 'pong' } }],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(providerMock.history.post).toHaveLength(2);
      expect(aiRequest.output && aiRequest.output[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              status: 'completed',
              text: 'pong',
              annotations: [],
            },
          ],
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('retries local custom provider requests without temperature for raw string errors', async () => {
      await expectLocalProviderRequestToRetryWithoutTemperature(
        JSON.stringify({
          error: {
            message: 'Unsupported parameter: temperature',
            type: 'invalid_request_error',
            param: 'temperature',
            code: 'unsupported_parameter',
          },
        })
      );
    });

    it('retries local custom provider requests without temperature for unquoted parameter errors', async () => {
      await expectLocalProviderRequestToRetryWithoutTemperature({
        error: {
          message: 'Unsupported parameter: temperature',
          type: 'invalid_request_error',
        },
      });
    });

    it('retries local custom provider requests without reasoning effort when unsupported', async () => {
      await expectLocalProviderRequestToRetryWithoutReasoningEffort({
        error: {
          message: "Unsupported parameter: 'reasoning_effort'",
          type: 'invalid_request_error',
          param: 'reasoning_effort',
          code: 'unsupported_parameter',
        },
      });
    });

    it('retries local custom provider requests without reasoning effort for unrecognized parameter errors', async () => {
      await expectLocalProviderRequestToRetryWithoutReasoningEffort({
        error: {
          message: 'Unrecognized request argument supplied: reasoning_effort',
          type: 'invalid_request_error',
        },
      });
    });

    it('caches unsupported temperature for later local custom provider requests', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBe(0.2);
            return [
              400,
              {
                error: {
                  message: "Unsupported parameter: 'temperature'",
                  param: 'temperature',
                  code: 'unsupported_parameter',
                },
              },
            ];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong' } }] }];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong 2' } }] }];
          });

        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'Again',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(3);
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('caches unsupported reasoning effort for later local custom provider requests', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.reasoning_effort).toBe('high');
            return [
              400,
              {
                error: {
                  message:
                    'Unrecognized request argument supplied: reasoning_effort',
                },
              },
            ];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.reasoning_effort).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong' } }] }];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.reasoning_effort).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong 2' } }] }];
          });

        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'Again',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(3);
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('retries and caches unsupported max tokens for local custom provider requests', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.max_tokens).toBe(1000);
            return [
              400,
              {
                error: {
                  message: "Unsupported parameter: 'max_tokens'",
                  param: 'max_tokens',
                  code: 'unsupported_parameter',
                },
              },
            ];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.max_tokens).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong' } }] }];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.max_tokens).toBeUndefined();
            return [200, { choices: [{ message: { content: 'pong 2' } }] }];
          });

        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'Again',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(3);
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('caches unsupported native tools and tool choice for local Build requests', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.tools).toBeDefined();
            expect(data.tool_choice).toBe('auto');
            return [
              400,
              {
                error: {
                  message: "Unsupported parameter: 'tools'",
                  param: 'tools',
                  code: 'unsupported_parameter',
                },
              },
            ];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.tools).toBeUndefined();
            expect(data.tool_choice).toBeUndefined();
            expect(data.messages[data.messages.length - 1].content).toContain(
              'Reply only with a JSON object'
            );
            return [
              200,
              {
                choices: [
                  {
                    message: {
                      content:
                        '{"tool_calls":[{"name":"create_scene","arguments":{"scene_name":"Game"}}]}',
                    },
                  },
                ],
              },
            ];
          })
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.tools).toBeUndefined();
            expect(data.tool_choice).toBeUndefined();
            expect(data.messages[data.messages.length - 1].content).toContain(
              'Reply only with a JSON object'
            );
            return [
              200,
              {
                choices: [
                  {
                    message: {
                      content:
                        '{"tool_calls":[{"name":"create_scene","arguments":{"scene_name":"Game2"}}]}',
                    },
                  },
                ],
              },
            ];
          });

        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'make pong',
          mode: 'agent',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'make pong again',
          mode: 'agent',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });

        expect(providerMock.history.post).toHaveLength(3);
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('does not retry local custom provider requests without temperature for unrelated errors', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.temperature).toBe(0.2);
            return [
              400,
              {
                error: {
                  message: 'The selected model is unavailable.',
                  type: 'invalid_request_error',
                },
              },
            ];
          });

        await expect(
          createAiRequest(getAuthorizationHeader, {
            ...baseAiRequestArgs,
            aiConfiguration: {
              presetId: 'default',
              providerConfigurationId: configuration.id,
            },
          })
        ).rejects.toThrow();

        expect(providerMock.history.post).toHaveLength(1);
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('fails clearly when a direct Custom Model chat completion times out', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      try {
        providerMock
          .onPost('http://127.0.0.1:18080/chat/completions')
          .replyOnce(() =>
            Promise.reject({
              code: 'ECONNABORTED',
              message: 'timeout of 180000ms exceeded',
            })
          );

        await expect(
          createAiRequest(getAuthorizationHeader, {
            ...baseAiRequestArgs,
            aiConfiguration: {
              presetId: 'default',
              providerConfigurationId: configuration.id,
            },
          })
        ).rejects.toThrow('Custom Model did not respond within 180 seconds');
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('adds messages directly to local custom provider requests', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'pong' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.messages).toEqual([
            expect.objectContaining({ role: 'system' }),
            { role: 'user', content: 'Build a platformer' },
            { role: 'assistant', content: 'pong' },
            { role: 'user', content: 'Continue' },
          ]);
          return [
            200,
            {
              choices: [{ message: { content: 'continued' } }],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });
      const updatedAiRequest = await addMessageToAiRequest(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
          userMessage: 'Continue',
          functionCallOutputs: [],
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          payWithCredits: false,
          aiConfiguration: aiRequest.aiConfiguration,
          toolsVersion: 'test-tools',
        }
      );

      expect(providerMock.history.post).toHaveLength(2);
      expect(updatedAiRequest.output).toHaveLength(4);
      expect(updatedAiRequest.output && updatedAiRequest.output[3]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              status: 'completed',
              text: 'continued',
              annotations: [],
            },
          ],
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('turns local Build tool calls into executable AI request function calls', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(data.tool_choice).toBe('auto');
          expect(data.tools).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                function: expect.objectContaining({
                  name: 'create_scene',
                }),
              }),
            ])
          );
          expect(data.messages[0].content).toContain(
            'must use the available tools'
          );
          return [
            200,
            {
              choices: [
                {
                  message: {
                    content: null,
                    tool_calls: [
                      {
                        id: 'call-create-scene',
                        type: 'function',
                        function: {
                          name: 'create_scene',
                          arguments: '{"scene_name":"Game"}',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        userRequest: 'make pong',
        mode: 'agent',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(aiRequest.output && aiRequest.output[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: [
            {
              type: 'function_call',
              status: 'completed',
              call_id: 'call-create-scene',
              name: 'create_scene',
              arguments: '{"scene_name":"Game"}',
            },
          ],
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('sends local tool results as tool messages and accepts empty user text', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [
              {
                message: {
                  content: null,
                  tool_calls: [
                    {
                      id: 'call-create-scene',
                      type: 'function',
                      function: {
                        name: 'create_scene',
                        arguments: '{"scene_name":"Game"}',
                      },
                    },
                  ],
                },
              },
            ],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          const put2dInstancesTool = data.tools.find(
            tool => tool.function.name === 'put_2d_instances'
          );
          expect(put2dInstancesTool.function.parameters.required).toContain(
            'object_name'
          );
          expect(data.messages).toEqual([
            expect.objectContaining({ role: 'system' }),
            { role: 'user', content: 'make pong' },
            {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call-create-scene',
                  type: 'function',
                  function: {
                    name: 'create_scene',
                    arguments: '{"scene_name":"Game"}',
                  },
                },
              ],
            },
            {
              role: 'tool',
              tool_call_id: 'call-create-scene',
              content: '{"ok":true}',
            },
          ]);
          return [
            200,
            {
              choices: [
                {
                  message: {
                    content: null,
                    tool_calls: [
                      {
                        id: 'call-place-ball',
                        type: 'function',
                        function: {
                          name: 'put_2d_instances',
                          arguments:
                            '{"scene_name":"Game","layer_name":"","brush_kind":"put","object_name":"Ball"}',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        userRequest: 'make pong',
        mode: 'agent',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });
      const updatedAiRequest = await addMessageToAiRequest(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
          userMessage: '',
          functionCallOutputs: [
            {
              type: 'function_call_output',
              call_id: 'call-create-scene',
              output: '{"ok":true}',
            },
          ],
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          payWithCredits: false,
          aiConfiguration: aiRequest.aiConfiguration,
          mode: 'agent',
          toolsVersion: 'test-tools',
        }
      );

      expect(providerMock.history.post).toHaveLength(2);
      expect(updatedAiRequest.output).toHaveLength(4);
      expect(updatedAiRequest.output && updatedAiRequest.output[2]).toEqual(
        expect.objectContaining({
          type: 'function_call_output',
          call_id: 'call-create-scene',
        })
      );
      expect(updatedAiRequest.output && updatedAiRequest.output[3]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: [
            {
              type: 'function_call',
              status: 'completed',
              call_id: 'call-place-ball',
              name: 'put_2d_instances',
              arguments:
                '{"scene_name":"Game","layer_name":"","brush_kind":"put","object_name":"Ball"}',
            },
          ],
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('accepts local Build text responses after tool results are sent', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      try {
        mock.reset();
        providerMock
          .onPost('https://api.openai.com/v1/chat/completions')
          .replyOnce(() => [
            200,
            {
              choices: [
                {
                  message: {
                    content: null,
                    tool_calls: [
                      {
                        id: 'call-create-scene',
                        type: 'function',
                        function: {
                          name: 'create_scene',
                          arguments: '{"scene_name":"Game"}',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ])
          .onPost('https://api.openai.com/v1/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.tools).toBeDefined();
            expect(data.tool_choice).toBe('auto');
            return [
              200,
              {
                choices: [
                  {
                    message: {
                      content: 'Done - I made the scene.',
                    },
                  },
                ],
              },
            ];
          });

        const aiRequest = await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'make pong',
          mode: 'agent',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        const updatedAiRequest = await addMessageToAiRequest(
          getAuthorizationHeader,
          {
            userId: 'user-1',
            aiRequestId: aiRequest.id,
            userMessage: '',
            functionCallOutputs: [
              {
                type: 'function_call_output',
                call_id: 'call-create-scene',
                output: '{"ok":true}',
              },
            ],
            gameProjectJson: null,
            gameProjectJsonUserRelativeKey: null,
            projectSpecificExtensionsSummaryJson: null,
            projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
            payWithCredits: false,
            aiConfiguration: aiRequest.aiConfiguration,
            mode: 'agent',
            toolsVersion: 'test-tools',
          }
        );

        expect(providerMock.history.post).toHaveLength(2);
        expect(updatedAiRequest.output).toHaveLength(4);
        expect(updatedAiRequest.output && updatedAiRequest.output[3]).toEqual(
          expect.objectContaining({
            role: 'assistant',
            content: [
              {
                type: 'output_text',
                status: 'completed',
                text: 'Done - I made the scene.',
                annotations: [],
              },
            ],
          })
        );
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('accepts local Build fallback text responses after tool results are sent', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      try {
        mock.reset();
        providerMock
          .onPost('https://api.openai.com/v1/chat/completions')
          .replyOnce(() => [
            200,
            {
              choices: [
                {
                  message: {
                    content: null,
                    tool_calls: [
                      {
                        id: 'call-create-scene',
                        type: 'function',
                        function: {
                          name: 'create_scene',
                          arguments: '{"scene_name":"Game"}',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ])
          .onPost('https://api.openai.com/v1/chat/completions')
          .replyOnce(() => [
            400,
            {
              error: {
                message: "Unsupported parameter: 'tools'",
                param: 'tools',
                code: 'unsupported_parameter',
              },
            },
          ])
          .onPost('https://api.openai.com/v1/chat/completions')
          .replyOnce(config => {
            const data = JSON.parse(config.data);
            expect(data.tools).toBeUndefined();
            expect(data.messages[data.messages.length - 1].content).toContain(
              'Reply only with a JSON object'
            );
            return [
              200,
              {
                choices: [
                  {
                    message: {
                      content: 'Done - I made the scene.',
                    },
                  },
                ],
              },
            ];
          });

        const aiRequest = await createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'make pong',
          mode: 'agent',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        });
        const updatedAiRequest = await addMessageToAiRequest(
          getAuthorizationHeader,
          {
            userId: 'user-1',
            aiRequestId: aiRequest.id,
            userMessage: '',
            functionCallOutputs: [
              {
                type: 'function_call_output',
                call_id: 'call-create-scene',
                output: '{"ok":true}',
              },
            ],
            gameProjectJson: null,
            gameProjectJsonUserRelativeKey: null,
            projectSpecificExtensionsSummaryJson: null,
            projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
            payWithCredits: false,
            aiConfiguration: aiRequest.aiConfiguration,
            mode: 'agent',
            toolsVersion: 'test-tools',
          }
        );

        expect(providerMock.history.post).toHaveLength(3);
        expect(updatedAiRequest.output).toHaveLength(4);
        expect(updatedAiRequest.output && updatedAiRequest.output[3]).toEqual(
          expect.objectContaining({
            role: 'assistant',
            content: [
              {
                type: 'output_text',
                status: 'completed',
                text: 'Done - I made the scene.',
                annotations: [],
              },
            ],
          })
        );
      } finally {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });

    it('retries local Build text responses with strict JSON tool-call mode', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'Create a scene named Game.' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.tools).toBeUndefined();
          expect(data.messages[data.messages.length - 1].content).toContain(
            'Reply only with a JSON object'
          );
          return [
            200,
            {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      tool_calls: [
                        {
                          name: 'create_scene',
                          arguments: { scene_name: 'Game' },
                        },
                      ],
                    }),
                  },
                },
              ],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        userRequest: 'make pong',
        mode: 'agent',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(providerMock.history.post).toHaveLength(2);
      expect(aiRequest.output && aiRequest.output[1]).toEqual(
        expect.objectContaining({
          role: 'assistant',
          content: [
            expect.objectContaining({
              type: 'function_call',
              name: 'create_scene',
              arguments: '{"scene_name":"Game"}',
            }),
          ],
        })
      );

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('errors clearly when local Build responses do not contain tool calls', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'Here are setup steps.' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: '{"tool_calls":[]}' } }],
          },
        ]);

      await expect(
        createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          userRequest: 'make pong',
          mode: 'agent',
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
        })
      ).rejects.toThrow('Custom Model did not return any tool calls');

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('generates local event changes with the same Custom Model provider', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'ok' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.messages[0].content).toContain(
            'GDevelop scene event changes'
          );
          expect(data.max_tokens).toBeUndefined();
          return [
            200,
            {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      resultMessage: 'Added events.',
                      changes: [
                        {
                          operationName: 'insert_at_end',
                          generatedEvents: '[]',
                        },
                      ],
                    }),
                  },
                },
              ],
            },
          ];
        })
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'not json' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'still not json' } }],
          },
        ]);

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        userRequest: 'continue',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });
      const result = await createAiGeneratedEvent(getAuthorizationHeader, {
        userId: 'user-1',
        gameProjectJson: '{"layouts":[]}',
        gameProjectJsonUserRelativeKey: null,
        projectSpecificExtensionsSummaryJson: null,
        projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
        sceneName: 'Game',
        eventsDescription: 'Move the ball and bounce on paddles.',
        extensionNamesList: '',
        objectsList: 'Ball, PlayerPaddle, AIPaddle',
        existingEventsAsText: '',
        existingEventsJson: '[]',
        existingEventsJsonUserRelativeKey: null,
        placementHint: 'insert_at_end',
        relatedAiRequestId: aiRequest.id,
        estimatedComplexity: 3,
      });

      if (!result.creationSucceeded) {
        throw new Error(result.errorMessage);
      }
      expect(result.aiGeneratedEvent.changes).toEqual([
        expect.objectContaining({
          operationName: 'insert_at_end',
          generatedEvents: '[]',
          isEventsJsonValid: true,
        }),
      ]);
      await expect(
        getAiGeneratedEvent(getAuthorizationHeader, {
          userId: 'user-1',
          aiGeneratedEventId: result.aiGeneratedEvent.id,
        })
      ).resolves.toEqual(result.aiGeneratedEvent);

      await expect(
        createAiGeneratedEvent(getAuthorizationHeader, {
          userId: 'user-1',
          gameProjectJson: '{"layouts":[]}',
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          sceneName: 'Game',
          eventsDescription: 'Move the ball.',
          extensionNamesList: '',
          objectsList: 'Ball',
          existingEventsAsText: '',
          existingEventsJson: '[]',
          existingEventsJsonUserRelativeKey: null,
          placementHint: 'insert_at_end',
          relatedAiRequestId: aiRequest.id,
          estimatedComplexity: 1,
        })
      ).resolves.toEqual({
        creationSucceeded: false,
        errorMessage: expect.stringContaining(
          'Custom Model returned invalid JSON'
        ),
      });

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('repairs malformed local event generation once and returns the corrected changes', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(() => [
          200,
          {
            choices: [{ message: { content: 'ok' } }],
          },
        ])
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.max_tokens).toBeUndefined();
          return [
            200,
            {
              choices: [{ message: { content: 'not json' } }],
            },
          ];
        })
        .onPost('https://api.openai.com/v1/chat/completions')
        .replyOnce(config => {
          const data = JSON.parse(config.data);
          expect(data.max_tokens).toBeUndefined();
          expect(data.messages[0].content).toContain(
            'previous event response failed validation'
          );
          expect(data.messages[1].content).toContain(
            'Custom Model returned invalid JSON'
          );
          return [
            200,
            {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      resultMessage: 'Repaired events.',
                      changes: [
                        {
                          operationName: 'insert_at_end',
                          generatedEvents: '[]',
                        },
                      ],
                    }),
                  },
                },
              ],
            },
          ];
        });

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });
      const result = await createAiGeneratedEvent(getAuthorizationHeader, {
        userId: 'user-1',
        gameProjectJson: '{"layouts":[]}',
        gameProjectJsonUserRelativeKey: null,
        projectSpecificExtensionsSummaryJson: null,
        projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
        sceneName: 'Game',
        eventsDescription: 'Move the ball.',
        extensionNamesList: '',
        objectsList: 'Ball',
        existingEventsAsText: '',
        existingEventsJson: '[]',
        existingEventsJsonUserRelativeKey: null,
        placementHint: 'insert_at_end',
        relatedAiRequestId: aiRequest.id,
        estimatedComplexity: 1,
      });

      expect(result).toEqual({
        creationSucceeded: true,
        aiGeneratedEvent: expect.objectContaining({
          resultMessage: 'Repaired events.',
          changes: [
            expect.objectContaining({
              operationName: 'insert_at_end',
              generatedEvents: '[]',
            }),
          ],
        }),
      });
      expect(providerMock.history.post).toHaveLength(3);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('sends saved custom provider follow-up messages to the backend', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => [200, mockProviderConfiguration]);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      mock
        .onPost('/ai-request/ai-request-1/action/add-message')
        .reply(config => {
          const data = JSON.parse(config.data);
          expect(config.params).toEqual({ userId: 'user-1' });
          expect(config.headers.Authorization).toBe('Bearer test-token');
          expect(data.providerConfigurationId).toBe(configuration.id);
          expect(data.payWithCredits).toBe(false);
          expect(data.payWithAiCredits).toBe(false);
          expect(data.aiConfiguration).toEqual({
            presetId: 'default',
            providerConfigurationId: configuration.id,
          });
          expect(data.aiConfiguration.providerConfiguration).toBeUndefined();
          return [200, { id: 'ai-request-1' }];
        });

      const updatedAiRequest = await addMessageToAiRequest(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          aiRequestId: 'ai-request-1',
          userMessage: 'Continue',
          functionCallOutputs: [],
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          payWithCredits: false,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: configuration.id,
          },
          toolsVersion: 'test-tools',
        }
      );

      expect(updatedAiRequest.id).toBe('ai-request-1');
      expect(mock.history.post).toHaveLength(1);
      expect(providerMock.history.post).toHaveLength(0);

      mock.onDelete('/ai-provider-configuration/provider-1').reply(() => [204]);
      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('handles cloud-only follow-up actions locally for custom provider requests', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );

      mock.reset();
      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .reply(() => [
          200,
          {
            choices: [{ message: { content: 'pong' } }],
          },
        ]);

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        mode: 'chat',
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });
      const assistantMessage =
        aiRequest.output && aiRequest.output.length > 1
          ? aiRequest.output[1]
          : null;
      if (!assistantMessage || !assistantMessage.messageId) {
        throw new Error('Expected an assistant message with an id.');
      }

      await updateAiRequestMessage(getAuthorizationHeader, {
        userId: 'user-1',
        aiRequestId: aiRequest.id,
        aiRequestMessageId: assistantMessage.messageId,
        projectVersionIdAfterMessage: 'version-1',
      });

      const updatedAiRequest = await getAiRequest(getAuthorizationHeader, {
        userId: 'user-1',
        aiRequestId: aiRequest.id,
      });

      expect(updatedAiRequest.output && updatedAiRequest.output[1]).toEqual(
        expect.objectContaining({
          projectVersionIdAfterMessage: 'version-1',
        })
      );
      await expect(
        getAiRequestSuggestions(getAuthorizationHeader, {
          userId: 'user-1',
          aiRequestId: aiRequest.id,
          suggestionsType: 'simple-list',
          gameProjectJson: null,
          gameProjectJsonUserRelativeKey: null,
          projectSpecificExtensionsSummaryJson: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
        })
      ).resolves.toEqual(updatedAiRequest);
      expect(mock.history.patch).toHaveLength(0);
      expect(mock.history.post).toHaveLength(0);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('requires local provider settings when a local custom provider is selected', async () => {
      await expect(
        createAiRequest(getAuthorizationHeader, {
          ...baseAiRequestArgs,
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: 'local-missing-provider',
          },
        })
      ).rejects.toThrow(
        'Custom Model needs the provider API key saved locally'
      );

      expect(mock.history.post).toHaveLength(0);
      expect(providerMock.history.post).toHaveLength(0);
    });

    it('detects provider configuration route availability errors', () => {
      expect(
        isAiProviderConfigurationRouteUnavailableError({
          response: {
            status: 403,
            headers: {
              'x-amzn-ErrorType': 'IncompleteSignatureException',
            },
            data: {
              message:
                "Invalid key=value pair (missing equal-sign) in Authorization header: 'Bearer test-token'.",
            },
          },
        })
      ).toBe(true);

      expect(
        isAiProviderConfigurationRouteUnavailableError({
          request: {},
          message: 'Network Error',
        })
      ).toBe(false);

      expect(
        isAiProviderConfigurationRouteUnavailableError({
          response: {
            status: 401,
            data: {
              code: 'AUTHENTICATION_FAILED',
            },
          },
        })
      ).toBe(false);
      expect(
        isAiProviderConfigurationRouteUnavailableError({
          response: {
            status: 403,
            data: {
              code: 'AUTHENTICATION_FAILED',
              message: 'Authentication failed.',
            },
          },
        })
      ).toBe(false);
    });

    it('preserves a custom provider configuration when the API response omits it', () => {
      expect(
        getAiRequestWithPreservedAiConfiguration({
          aiRequest: {
            id: 'ai-request-1',
            createdAt: '2026-05-15T10:00:00.000Z',
            updatedAt: '2026-05-15T10:00:00.000Z',
            userId: 'user-1',
            status: 'working',
            error: null,
          },
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: 'provider-1',
          },
        }).aiConfiguration
      ).toEqual({
        presetId: 'default',
        providerConfigurationId: 'provider-1',
      });
    });

    it('keeps the provider configuration returned by the API', () => {
      expect(
        getAiRequestWithPreservedAiConfiguration({
          aiRequest: {
            id: 'ai-request-1',
            createdAt: '2026-05-15T10:00:00.000Z',
            updatedAt: '2026-05-15T10:00:00.000Z',
            userId: 'user-1',
            status: 'working',
            error: null,
            aiConfiguration: {
              presetId: 'default',
              providerConfigurationId: 'provider-2',
            },
          },
          aiConfiguration: {
            presetId: 'default',
            providerConfigurationId: 'provider-1',
          },
        }).aiConfiguration
      ).toEqual({
        presetId: 'default',
        providerConfigurationId: 'provider-2',
      });
    });

    it('detects provider-unavailable API errors', () => {
      expect(
        isAiProviderUnavailableError({
          response: {
            status: 409,
            data: {
              code: 'AI_PROVIDER_UNAVAILABLE',
            },
          },
        })
      ).toBe(true);
      expect(
        isAiProviderUnavailableError({
          response: {
            status: 500,
            data: {
              code: 'INTERNAL_SERVER_ERROR',
            },
          },
        })
      ).toBe(false);
    });
  });

  describe('AI provider configurations', () => {
    it('detects loopback provider base URLs', () => {
      expect(isLocalAiProviderBaseUrl('http://localhost:18080/')).toBe(true);
      expect(isLocalAiProviderBaseUrl('https://127.0.0.1/v1')).toBe(true);
      expect(isLocalAiProviderBaseUrl('http://[::1]:18080/')).toBe(true);
      expect(isLocalAiProviderBaseUrl('https://api.openai.com/v1')).toBe(false);
      expect(isLocalAiProviderBaseUrl('not-a-url')).toBe(false);
    });

    it('stores localhost provider configurations locally without using backend auth', async () => {
      const getAuthorizationHeaderThatShouldNotRun = (jest.fn(async () => {
        throw new Error(
          'Localhost providers should not request authorization.'
        );
      }): any);

      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      expect(configuration.id).toContain('local-');
      expect(configuration.baseUrl).toBe('http://127.0.0.1:18080/');
      expect(configuration.reasoningEffort).toBe('high');
      expect(getAuthorizationHeaderThatShouldNotRun).not.toHaveBeenCalled();
      expect(mock.history.post).toHaveLength(0);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('turns a remote provider update to localhost into a new local provider', async () => {
      const getAuthorizationHeaderThatShouldNotRun = (jest.fn(async () => {
        throw new Error(
          'Localhost providers should not request authorization.'
        );
      }): any);

      const configuration = await updateAiProviderConfiguration(
        getAuthorizationHeaderThatShouldNotRun,
        {
          userId: 'user-1',
          providerConfigurationId: 'provider-1',
          configuration: localProviderPayload,
        }
      );

      expect(configuration.id).toContain('local-');
      expect(configuration.reasoningEffort).toBe('high');
      expect(getAuthorizationHeaderThatShouldNotRun).not.toHaveBeenCalled();
      expect(mock.history.patch).toHaveLength(0);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('turns a route-unavailable remote provider update into a usable local provider', async () => {
      mock
        .onPatch('/ai-provider-configuration/provider-1')
        .reply(() => routeUnavailableResponse);
      const configuration = await updateAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          providerConfigurationId: 'provider-1',
          configuration: providerPayload,
        }
      );

      expect(configuration.id).toContain('local-');
      expect(configuration.id).not.toBe('provider-1');

      providerMock
        .onPost('https://api.openai.com/v1/chat/completions')
        .reply(() => [
          200,
          {
            choices: [{ message: { content: 'pong' } }],
          },
        ]);

      const aiRequest = await createAiRequest(getAuthorizationHeader, {
        ...baseAiRequestArgs,
        aiConfiguration: {
          presetId: 'default',
          providerConfigurationId: configuration.id,
        },
      });

      expect(aiRequest.id).toContain('local-custom-provider-ai-request-');
      expect(providerMock.history.post).toHaveLength(1);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('lists backend provider configurations with local-only configurations', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => [200, mockProviderConfiguration]);
      const backendConfiguration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );
      const localConfiguration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      mock.reset();
      mock
        .onGet('/ai-provider-configuration')
        .reply(() => [200, [mockProviderConfiguration]]);
      const configurations = await listAiProviderConfigurations(
        getAuthorizationHeader,
        { userId: 'user-1' }
      );

      expect(configurations).toContainEqual(mockProviderConfiguration);
      expect(configurations).toContainEqual(localConfiguration);
      expect(
        configurations.filter(
          configuration => configuration.id === backendConfiguration.id
        )
      ).toHaveLength(1);

      mock.onDelete('/ai-provider-configuration/provider-1').reply(() => [204]);
      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: backendConfiguration.id,
      });
      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: localConfiguration.id,
      });
    });

    it('keeps local provider configurations scoped to the signed-in user', async () => {
      mock.onGet('/ai-provider-configuration').reply(() => [200, []]);
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );

      await expect(
        listAiProviderConfigurations(getAuthorizationHeader, {
          userId: 'user-1',
        })
      ).resolves.toContainEqual(configuration);
      await expect(
        listAiProviderConfigurations(getAuthorizationHeader, {
          userId: 'user-2',
        })
      ).resolves.not.toContainEqual(configuration);

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('uses the backend provider configuration endpoints', async () => {
      mock.onGet('/ai-provider-configuration').reply(config => {
        expect(config.params).toEqual({ userId: 'user-1' });
        expect(config.headers.Authorization).toBe('Bearer test-token');
        return [200, [mockProviderConfiguration]];
      });
      mock.onPost('/ai-provider-configuration').reply(config => {
        expect(JSON.parse(config.data)).toEqual(providerPayload);
        return [200, mockProviderConfiguration];
      });
      mock.onPatch('/ai-provider-configuration/provider-1').reply(config => {
        expect(JSON.parse(config.data)).toEqual(providerPayloadWithoutApiKey);
        return [200, mockProviderConfiguration];
      });
      mock
        .onPost('/ai-provider-configuration/provider-1/action/test')
        .reply(() => [
          200,
          { success: true, message: 'Provider is reachable.' },
        ]);
      mock.onDelete('/ai-provider-configuration/provider-1').reply(() => [204]);

      await expect(
        listAiProviderConfigurations(getAuthorizationHeader, {
          userId: 'user-1',
        })
      ).resolves.toEqual([mockProviderConfiguration]);
      await expect(
        createAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          configuration: providerPayload,
        })
      ).resolves.toEqual(mockProviderConfiguration);
      await expect(
        updateAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: 'provider-1',
          configuration: providerPayloadWithoutApiKey,
        })
      ).resolves.toEqual(mockProviderConfiguration);
      await expect(
        testAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: 'provider-1',
        })
      ).resolves.toEqual({
        success: true,
        message: 'Provider is reachable.',
      });
      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: 'provider-1',
      });
      expect(mock.history.delete).toHaveLength(1);
    });

    it('does not cache backend provider API keys locally', async () => {
      const backendConfiguration = {
        ...mockProviderConfiguration,
        id: 'provider-with-backend-secret',
      };
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => [200, backendConfiguration]);
      mock
        .onPatch('/ai-provider-configuration/provider-with-backend-secret')
        .reply(() => [200, backendConfiguration]);

      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );
      await updateAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
        configuration: {
          ...providerPayload,
          apiKey: 'sk-updated-test',
        },
      });

      mock.reset();
      mock
        .onGet('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      const localFallbackConfigurations = await listAiProviderConfigurations(
        getAuthorizationHeader,
        { userId: 'user-1' }
      );

      expect(
        localFallbackConfigurations.some(
          configuration => configuration.id === backendConfiguration.id
        )
      ).toBe(false);
    });

    it('stores provider configurations locally when the backend route is unavailable', async () => {
      mock
        .onPost('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);
      mock
        .onGet('/ai-provider-configuration')
        .reply(() => routeUnavailableResponse);

      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: providerPayload,
        }
      );
      const configurations = await listAiProviderConfigurations(
        getAuthorizationHeader,
        { userId: 'user-1' }
      );

      expect(configuration.id).toContain('local-');
      expect(configurations).toContainEqual(configuration);
      expect(configurations[0].hasApiKey).toBe(true);
      expect(configurations[0].reasoningEffort).toBe('high');
      expect((configurations[0]: any).apiKey).toBeUndefined();

      await deleteAiProviderConfiguration(getAuthorizationHeader, {
        userId: 'user-1',
        providerConfigurationId: configuration.id,
      });
    });

    it('lists local provider configurations when the dev backend returns forbidden', async () => {
      const configuration = await createAiProviderConfiguration(
        getAuthorizationHeader,
        {
          userId: 'user-1',
          configuration: localProviderPayload,
        }
      );
      const previousBaseUrl = apiClient.defaults.baseURL;

      try {
        apiClient.defaults.baseURL = 'https://api-dev.gdevelop.io/generation';
        mock
          .onGet('/ai-provider-configuration')
          .reply(() => [403, 'Forbidden']);

        const configurations = await listAiProviderConfigurations(
          getAuthorizationHeader,
          { userId: 'user-1' }
        );

        expect(configurations).toContainEqual(configuration);
      } finally {
        apiClient.defaults.baseURL = previousBaseUrl;
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: 'user-1',
          providerConfigurationId: configuration.id,
        });
      }
    });
  });

  describe('AI settings', () => {
    it('uses explicit custom provider support before development defaults', () => {
      const aiSettings: AiSettings = {
        aiRequest: {
          presets: [],
          customProviderSupport: {
            enabled: false,
            openAiCompatible: false,
          },
        },
      };

      expect(
        getAiRequestCustomProviderSupport({
          aiSettings,
          enableDevelopmentFallback: true,
        })
      ).toEqual({
        enabled: false,
        openAiCompatible: false,
      });
    });

    it('only enables development fallback outside production settings', () => {
      const aiSettings: AiSettings = {
        aiRequest: {
          presets: [],
        },
      };

      expect(
        getAiRequestCustomProviderSupport({
          aiSettings,
          enableDevelopmentFallback: false,
        })
      ).toBe(null);
      expect(
        getAiRequestCustomProviderSupport({
          aiSettings,
          enableDevelopmentFallback: true,
        })
      ).toEqual({
        enabled: true,
        openAiCompatible: true,
      });
    });
  });
});

// @flow
import axios from 'axios';
import {
  getCustomEndpointConfig,
  setCustomEndpointConfig,
  isCustomEndpointEnabled,
  normalizeBaseUrl,
  getEndpointUrl,
  extractThinkingAndContent,
  transformGDevelopMessagesToOpenAi,
  parseAssistantMessage,
  DEFAULT_CUSTOM_AI_CONFIG,
  DEFAULT_LOCAL_AI_SETTINGS,
  GDEVELOP_OPENAI_TOOLS,
  LOCAL_BYOK_USER_ID,
  _resetCustomAiClientForTesting,
  customCreateAiRequest,
  customAddMessageToAiRequest,
  customGetAiRequest,
  customGetAiRequests,
  customGetAiRequestStatuses,
  customSuspendAiRequest,
  customForkAiRequest,
  customGetAiRequestSuggestions,
  customCreateAiGeneratedEvent,
  customCreateAssetSearch,
  customCreateResourceSearch,
  testConnection,
} from './CustomAIClient';

jest.mock('axios');

describe('CustomAIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetCustomAiClientForTesting();
    setCustomEndpointConfig({
      enabled: false,
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      model: 'qwen2.5-coder',
      temperature: 0.7,
    });
  });

  describe('Configuration & URL normalization', () => {
    it('returns default configuration initially', () => {
      const config = getCustomEndpointConfig();
      expect(config.baseUrl).toBe('http://localhost:11434/v1');
      expect(config.model).toBe('qwen2.5-coder');
      expect(config.temperature).toBe(0.7);
    });

    it('updates configuration and reflects enabled state', () => {
      expect(isCustomEndpointEnabled()).toBe(false);
      setCustomEndpointConfig({
        enabled: true,
        baseUrl: 'http://localhost:8080/v1',
        apiKey: 'test-key',
        model: 'llama-3.2',
        temperature: 0.2,
      });
      expect(isCustomEndpointEnabled()).toBe(true);
      const config = getCustomEndpointConfig();
      expect(config.baseUrl).toBe('http://localhost:8080/v1');
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('llama-3.2');
      expect(config.temperature).toBe(0.2);
    });

    it('normalizes base URLs correctly without auto-appending /v1', () => {
      expect(normalizeBaseUrl('http://localhost:11434')).toBe(
        'http://localhost:11434'
      );
      expect(normalizeBaseUrl('http://localhost:11434/')).toBe(
        'http://localhost:11434'
      );
      expect(normalizeBaseUrl('http://localhost:11434/v1/')).toBe(
        'http://localhost:11434/v1'
      );
      expect(normalizeBaseUrl('localhost:11434/v1')).toBe(
        'http://localhost:11434/v1'
      );
      expect(normalizeBaseUrl('api.openai.com/v1')).toBe(
        'https://api.openai.com/v1'
      );
      expect(normalizeBaseUrl('https://api.openai.com/v1')).toBe(
        'https://api.openai.com/v1'
      );
      expect(normalizeBaseUrl('https://openrouter.ai/api/v1/')).toBe(
        'https://openrouter.ai/api/v1'
      );
      expect(normalizeBaseUrl('')).toBe(DEFAULT_CUSTOM_AI_CONFIG.baseUrl);
    });

    it('constructs correct endpoint URLs', () => {
      expect(
        getEndpointUrl('http://localhost:11434/v1', '/chat/completions')
      ).toBe('http://localhost:11434/v1/chat/completions');
      expect(getEndpointUrl('http://localhost:11434', '/models')).toBe(
        'http://localhost:11434/models'
      );
    });
  });

  describe('extractThinkingAndContent', () => {
    it('extracts <think> tags from text', () => {
      const input =
        '<think>I should create an object</think>Here is the answer';
      const result = extractThinkingAndContent(input);
      expect(result.thinking).toBe('I should create an object');
      expect(result.content).toBe('Here is the answer');
    });

    it('handles text without <think> tags', () => {
      const input = 'Simple response with no thinking tag';
      const result = extractThinkingAndContent(input);
      expect(result.thinking).toBeNull();
      expect(result.content).toBe('Simple response with no thinking tag');
    });

    it('handles empty or non-string input', () => {
      expect(extractThinkingAndContent('')).toEqual({
        thinking: null,
        cleanContent: '',
        content: '',
      });
      // $FlowFixMe
      expect(extractThinkingAndContent(null)).toEqual({
        thinking: null,
        cleanContent: '',
        content: '',
      });
    });
  });

  describe('transformGDevelopMessagesToOpenAi', () => {
    it('formats user messages and system prompt', () => {
      const messages = [
        {
          id: 'msg-1',
          type: 'user',
          text: 'Hello, create a player object',
          createdAt: new Date().toISOString(),
        },
      ];
      const openAiMessages = transformGDevelopMessagesToOpenAi(
        messages,
        '{"objects":[]}',
        null,
        'agent'
      );

      expect(openAiMessages[0].role).toBe('system');
      expect(openAiMessages[0].content).toContain('GDevelop AI Assistant');
      expect(openAiMessages[0].content).toContain('{"objects":[]}');

      const userMsg = openAiMessages.find(m => m.role === 'user');
      expect(userMsg).toBeDefined();
      expect(userMsg && userMsg.content).toBe('Hello, create a player object');
    });

    it('formats assistant messages with function calls and reasoning', () => {
      const messages = [
        {
          id: 'msg-1',
          type: 'user',
          text: 'Add sprite',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          type: 'assistant',
          text: 'I am creating the object',
          thinking: 'Let us make Player',
          functionCalls: [
            {
              id: 'call-1',
              name: 'create_or_replace_object',
              callArguments: { objectName: 'Player', objectType: 'Sprite' },
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-3',
          type: 'function_call_output',
          functionCallOutputs: [
            {
              callId: 'call-1',
              output: '{"status":"ok"}',
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ];

      const openAiMessages = transformGDevelopMessagesToOpenAi(
        messages,
        null,
        null,
        'agent'
      );

      const assistantMsg = openAiMessages.find(m => m.role === 'assistant');
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg && assistantMsg.content).toBe(
        'I am creating the object'
      );
      expect(assistantMsg && assistantMsg.tool_calls).toBeDefined();
      expect(
        assistantMsg &&
          assistantMsg.tool_calls &&
          assistantMsg.tool_calls[0].function.name
      ).toBe('create_or_replace_object');

      const toolMsg = openAiMessages.find(m => m.role === 'tool');
      expect(toolMsg).toBeDefined();
      expect(toolMsg && toolMsg.tool_call_id).toBe('call-1');
      expect(toolMsg && toolMsg.content).toBe('{"status":"ok"}');
    });
  });

  describe('parseAssistantMessage', () => {
    it('parses standard OpenAI tool calls', () => {
      const choice = {
        message: {
          role: 'assistant',
          content: 'Creating a scene',
          tool_calls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'create_scene',
                arguments: '{"sceneName":"Level1"}',
              },
            },
          ],
        },
      };

      const parsed = parseAssistantMessage(choice);
      expect(parsed.text).toBe('Creating a scene');
      expect(parsed.functionCalls).toHaveLength(1);
      expect(parsed.functionCalls[0].name).toBe('create_scene');
      expect(parsed.functionCalls[0].callArguments).toEqual({
        sceneName: 'Level1',
      });
    });

    it('extracts embedded JSON function call markdown if tool_calls not present for side-effect-free tools', () => {
      const choice = {
        message: {
          role: 'assistant',
          content:
            'I will inspect the instances now:\n```json\n{"name":"describe_instances","arguments":{"scene_name":"Level1"}}\n```',
        },
      };

      const parsed = parseAssistantMessage(choice);
      expect(parsed.functionCalls).toHaveLength(1);
      expect(parsed.functionCalls[0].name).toBe('describe_instances');
      expect(parsed.functionCalls[0].callArguments).toEqual({
        scene_name: 'Level1',
      });
    });

    it('extracts reasoning_content if provided by model', () => {
      const choice = {
        message: {
          role: 'assistant',
          content: 'Done!',
          reasoning_content: 'Step 1: check parameters. Step 2: verify.',
        },
      };

      const parsed = parseAssistantMessage(choice);
      expect(parsed.text).toBe('Done!');
      expect(parsed.thinking).toBe('Step 1: check parameters. Step 2: verify.');
    });
  });

  describe('GDevelop OpenAI Tool Definitions', () => {
    it('defines standard GDevelop tools', () => {
      const toolNames = GDEVELOP_OPENAI_TOOLS.map(t => t.function.name);
      expect(toolNames).toContain('create_scene');
      expect(toolNames).toContain('create_or_replace_object');
      expect(toolNames).toContain('add_behavior');
      expect(toolNames).toContain('put_2d_instances');
      expect(toolNames).toContain('add_scene_events');
      expect(toolNames).toContain('run_script');
      expect(toolNames).toContain('create_or_update_plan');
    });
  });

  describe('testConnection', () => {
    it('successfully connects when endpoint responds', async () => {
      // $FlowFixMe
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          data: [{ id: 'qwen2.5-coder' }, { id: 'gpt-4o' }],
        },
      });

      const result = await testConnection({
        enabled: true,
        baseUrl: 'http://localhost:11434/v1',
        apiKey: '',
        model: 'qwen2.5-coder',
        temperature: 0.7,
      });

      expect(result.success).toBe(true);
      expect(result.models).toContain('qwen2.5-coder');
    });

    it('handles endpoint error gracefully', async () => {
      // $FlowFixMe
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));
      // $FlowFixMe
      axios.post.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await testConnection({
        enabled: true,
        baseUrl: 'http://localhost:9999/v1',
        apiKey: '',
        model: 'test-model',
        temperature: 0.7,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
    });
  });

  describe('Request Store & Lifecycle Methods', () => {
    it('creates, retrieves, and updates local AI requests', async () => {
      // $FlowFixMe
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'I have processed your request.',
              },
            },
          ],
        },
      });

      const aiRequest = await customCreateAiRequest({
        userRequest: 'Hello test AI',
        gameProjectJson: null,
        projectSpecificExtensionsSummaryJson: null,
        mode: 'chat',
        aiConfiguration: { presetId: 'default' },
        gameId: null,
      });

      expect(aiRequest.id).toMatch(/^local-ai-/);
      expect(aiRequest.status).toBe('ready');
      expect(aiRequest.output.length).toBeGreaterThanOrEqual(2); // user + assistant

      const fetched = await customGetAiRequest(aiRequest.id);
      expect(fetched.id).toBe(aiRequest.id);

      const all = await customGetAiRequests();
      expect(all.aiRequests.some(r => r.id === aiRequest.id)).toBe(true);

      const statuses = await customGetAiRequestStatuses([aiRequest.id]);
      expect(statuses).toEqual([
        { id: aiRequest.id, status: 'ready', userId: LOCAL_BYOK_USER_ID },
      ]);
    });

    it('suspends an active AI request', async () => {
      // $FlowFixMe
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          choices: [{ message: { role: 'assistant', content: 'Working...' } }],
        },
      });

      const aiRequest = await customCreateAiRequest({
        userRequest: 'Test suspend',
        gameProjectJson: null,
        projectSpecificExtensionsSummaryJson: null,
        mode: 'chat',
        aiConfiguration: { presetId: 'default' },
        gameId: null,
      });

      const suspended = await customSuspendAiRequest(aiRequest.id);
      expect(suspended.status).toBe('suspended');
    });

    it('forks an AI request up to a message id', async () => {
      // $FlowFixMe
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          choices: [{ message: { role: 'assistant', content: 'Fork me' } }],
        },
      });

      const aiRequest = await customCreateAiRequest({
        userRequest: 'Original thread',
        gameProjectJson: null,
        projectSpecificExtensionsSummaryJson: null,
        mode: 'chat',
        aiConfiguration: { presetId: 'default' },
        gameId: null,
      });

      const forked = await customForkAiRequest(aiRequest.id);
      expect(forked.id).not.toBe(aiRequest.id);
      expect(forked.output.length).toBe(aiRequest.output.length);
    });

    it('returns suggestions for an AI request', async () => {
      const suggestions = await customGetAiRequestSuggestions('local-ai-123');
      expect(suggestions.suggestions).toHaveLength(3);
      expect(suggestions.suggestions[0].suggestedMessage).toBeDefined();
    });

    it('generates event changes with customCreateAiGeneratedEvent', async () => {
      // $FlowFixMe
      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content:
                  '```json\n[{"type":"add_events","events":[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]}]\n```',
              },
            },
          ],
        },
      });

      const result = await customCreateAiGeneratedEvent({
        sceneName: 'MainScene',
        eventsDescription: 'Move player right when key pressed',
        eventBatches: null,
        extensionNamesList: '',
        objectsList: 'Player',
        existingEventsAsText: '',
      });

      expect(result.creationSucceeded).toBe(true);
      if (result.creationSucceeded) {
        expect(result.aiGeneratedEvent.changes.length).toBeGreaterThan(0);
      }
    });

    it('provides empty asset and resource search results in BYOK mode', async () => {
      const assetResult = await customCreateAssetSearch({
        searchTerms: 'coin',
        objectType: 'Sprite',
      });
      expect(assetResult.id).toMatch(/^local-asset-/);
      expect(assetResult.userId).toBe(LOCAL_BYOK_USER_ID);
      expect(assetResult.results).toEqual([]);

      const resourceResult = await customCreateResourceSearch({
        searchTerms: 'jump sound',
        resourceKind: 'audio',
      });
      expect(resourceResult.id).toMatch(/^local-resource-/);
      expect(resourceResult.userId).toBe(LOCAL_BYOK_USER_ID);
      expect(resourceResult.results).toEqual([]);
    });
  });
});

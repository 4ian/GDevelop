// @flow
/**
 * Direct API Client for making requests to AI providers using custom API keys
 * This bypasses GDevelop's backend and allows unlimited usage with user's own keys
 */

import axios from 'axios';
import { getApiKeyForProvider } from './LocalStorage';

export type DirectApiMessage = {|
  role: 'user' | 'assistant' | 'system',
  content: string,
|};

export type DirectApiResponse = {|
  success: boolean,
  content?: string,
  error?: string,
  tokensUsed?: number,
|};

/**
 * OpenAI API Client
 * Documentation: https://platform.openai.com/docs/api-reference/chat
 */
const callOpenAI = async (
  messages: Array<DirectApiMessage>,
  options: {|
    model?: string,
    temperature?: number,
    maxTokens?: number,
  |} = {}
): Promise<DirectApiResponse> => {
  const apiKey = getApiKeyForProvider('openai');
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options.model || 'gpt-4',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const choice = response.data.choices?.[0];
    if (!choice) {
      return { success: false, error: 'No response from OpenAI' };
    }

    return {
      success: true,
      content: choice.message?.content || '',
      tokensUsed: response.data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

/**
 * Anthropic (Claude) API Client
 * Documentation: https://docs.anthropic.com/claude/reference/messages_post
 */
const callAnthropic = async (
  messages: Array<DirectApiMessage>,
  options: {|
    model?: string,
    temperature?: number,
    maxTokens?: number,
  |} = {}
): Promise<DirectApiResponse> => {
  const apiKey = getApiKeyForProvider('anthropic');
  if (!apiKey) {
    return { success: false, error: 'Anthropic API key not configured' };
  }

  try {
    // Anthropic requires system messages to be separate
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: options.model || 'claude-3-opus-20240229',
        messages: userMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        system: systemMessage?.content,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.content?.[0];
    if (!content) {
      return { success: false, error: 'No response from Anthropic' };
    }

    return {
      success: true,
      content: content.text || '',
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens,
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

/**
 * Google AI (Gemini) API Client
 * Documentation: https://ai.google.dev/api/rest
 */
const callGoogleAI = async (
  messages: Array<DirectApiMessage>,
  options: {|
    model?: string,
    temperature?: number,
    maxTokens?: number,
  |} = {}
): Promise<DirectApiResponse> => {
  const apiKey = getApiKeyForProvider('google');
  if (!apiKey) {
    return { success: false, error: 'Google AI API key not configured' };
  }

  try {
    const model = options.model || 'gemini-pro';
    
    // Convert messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      return { success: false, error: 'No response from Google AI' };
    }

    return {
      success: true,
      content: candidate.content?.parts?.[0]?.text || '',
      tokensUsed: response.data.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    console.error('Google AI API error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

/**
 * HuggingFace API Client
 * Documentation: https://huggingface.co/docs/api-inference/index
 */
const callHuggingFace = async (
  messages: Array<DirectApiMessage>,
  options: {|
    model?: string,
    temperature?: number,
    maxTokens?: number,
  |} = {}
): Promise<DirectApiResponse> => {
  const apiKey = getApiKeyForProvider('huggingface');
  if (!apiKey) {
    return { success: false, error: 'HuggingFace API key not configured' };
  }

  try {
    const model = options.model || 'meta-llama/Llama-2-70b-chat-hf';
    
    // Combine messages into a single prompt
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: prompt,
        parameters: {
          temperature: options.temperature ?? 0.7,
          max_new_tokens: options.maxTokens ?? 2000,
          return_full_text: false,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generated = response.data?.[0]?.generated_text;
    if (!generated) {
      return { success: false, error: 'No response from HuggingFace' };
    }

    return {
      success: true,
      content: generated,
    };
  } catch (error) {
    console.error('HuggingFace API error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * Main function to make direct API calls using custom keys
 * Automatically selects the provider based on available API keys
 */
export const makeDirectApiCall = async (
  messages: Array<DirectApiMessage>,
  options: {|
    provider?: 'openai' | 'anthropic' | 'google' | 'huggingface',
    model?: string,
    temperature?: number,
    maxTokens?: number,
  |} = {}
): Promise<DirectApiResponse> => {
  const provider = options.provider || getFirstAvailableProvider();
  
  if (!provider) {
    return {
      success: false,
      error: 'No API keys configured. Please add an API key in the Custom API Keys dialog.',
    };
  }

  switch (provider) {
    case 'openai':
      return callOpenAI(messages, options);
    case 'anthropic':
      return callAnthropic(messages, options);
    case 'google':
      return callGoogleAI(messages, options);
    case 'huggingface':
      return callHuggingFace(messages, options);
    default:
      return { success: false, error: `Unknown provider: ${provider}` };
  }
};

/**
 * Get the first provider that has an API key configured
 */
const getFirstAvailableProvider = (): ?string => {
  const providers = ['openai', 'anthropic', 'google', 'huggingface'];
  for (const provider of providers) {
    if (getApiKeyForProvider(provider)) {
      return provider;
    }
  }
  return null;
};

/**
 * Check if any custom API keys are configured
 */
export const hasCustomApiKeys = (): boolean => {
  return !!getFirstAvailableProvider();
};

/**
 * Get list of providers with configured API keys
 */
export const getConfiguredProviders = (): Array<string> => {
  const providers = ['openai', 'anthropic', 'google', 'huggingface'];
  return providers.filter(provider => !!getApiKeyForProvider(provider));
};

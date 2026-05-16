// @flow
import {
  CUSTOM_PROVIDER_SELECTION_ID,
  getAvailableAiProviderConfigurations,
  getAiProviderConfigurationFromSelectionId,
  getConfigurationSelectionId,
  getPresetSelectionId,
  shouldFetchAiProviderConfigurations,
} from './AiProviderConfigurations';
import {
  type AiProviderConfiguration,
  type AiRequestCustomProviderSupport,
} from '../Utils/GDevelopServices/Generation';

const supportAll: AiRequestCustomProviderSupport = {
  enabled: true,
  openAiCompatible: true,
};

const supportDisabled: AiRequestCustomProviderSupport = {
  enabled: false,
  openAiCompatible: true,
};

const supportWithoutOpenAiCompatible: AiRequestCustomProviderSupport = {
  enabled: true,
  openAiCompatible: false,
};

const openAiCompatibleProvider: AiProviderConfiguration = {
  id: 'openai-compatible-provider',
  name: 'OpenAI-compatible',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  hasApiKey: true,
  createdAt: '',
  updatedAt: '',
};

const savedOpenAiProvider: AiProviderConfiguration = {
  id: 'saved-openai-provider',
  name: 'OpenAI',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  hasApiKey: true,
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
};

const newerSavedOpenAiProvider: AiProviderConfiguration = {
  ...savedOpenAiProvider,
  id: 'newer-saved-openai-provider',
  model: 'gpt-5.5-mini',
  updatedAt: '2026-05-16T10:00:00.000Z',
};

describe('AI provider configurations', () => {
  it('fetches providers only for signed-in users with OpenAI-compatible support', () => {
    expect(
      shouldFetchAiProviderConfigurations({
        hasAuthenticatedUser: true,
        customProviderSupport: supportAll,
      })
    ).toBe(true);
    expect(
      shouldFetchAiProviderConfigurations({
        hasAuthenticatedUser: false,
        customProviderSupport: supportAll,
      })
    ).toBe(false);
    expect(
      shouldFetchAiProviderConfigurations({
        hasAuthenticatedUser: true,
        customProviderSupport: supportWithoutOpenAiCompatible,
      })
    ).toBe(false);
  });

  it('skips provider fetches when custom provider support is missing or disabled', () => {
    expect(
      shouldFetchAiProviderConfigurations({
        hasAuthenticatedUser: true,
        customProviderSupport: null,
      })
    ).toBe(false);
    expect(
      shouldFetchAiProviderConfigurations({
        hasAuthenticatedUser: true,
        customProviderSupport: supportDisabled,
      })
    ).toBe(false);
  });

  it('lists OpenAI-compatible providers in the Ask AI dropdown', () => {
    expect(
      getAvailableAiProviderConfigurations({
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportAll,
      }).map(configuration => configuration.id)
    ).toEqual([openAiCompatibleProvider.id]);
  });

  it('honors OpenAI-compatible feature support', () => {
    expect(
      getAvailableAiProviderConfigurations({
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportWithoutOpenAiCompatible,
      })
    ).toEqual([]);
  });

  it('resolves a saved custom provider selection', () => {
    expect(
      getAiProviderConfigurationFromSelectionId({
        selectionId: getConfigurationSelectionId(openAiCompatibleProvider.id),
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportAll,
      })
    ).toBe(openAiCompatibleProvider);
  });

  it('resolves a saved preset selection to the newest matching provider', () => {
    expect(
      getAiProviderConfigurationFromSelectionId({
        selectionId: getPresetSelectionId('openai'),
        aiProviderConfigurations: [
          savedOpenAiProvider,
          newerSavedOpenAiProvider,
        ],
        customProviderSupport: supportAll,
      })
    ).toBe(newerSavedOpenAiProvider);
  });

  it('does not resolve unsaved preset or custom-new selections', () => {
    expect(
      getAiProviderConfigurationFromSelectionId({
        selectionId: getPresetSelectionId('openrouter'),
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportAll,
      })
    ).toBe(null);
    expect(
      getAiProviderConfigurationFromSelectionId({
        selectionId: CUSTOM_PROVIDER_SELECTION_ID,
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportAll,
      })
    ).toBe(null);
  });

  it('does not resolve selections when OpenAI-compatible support is unavailable', () => {
    expect(
      getAiProviderConfigurationFromSelectionId({
        selectionId: getConfigurationSelectionId(openAiCompatibleProvider.id),
        aiProviderConfigurations: [openAiCompatibleProvider],
        customProviderSupport: supportWithoutOpenAiCompatible,
      })
    ).toBe(null);
  });
});

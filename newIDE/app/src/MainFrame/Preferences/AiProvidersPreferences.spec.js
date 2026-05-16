// @flow
import * as React from 'react';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import renderer from 'react-test-renderer';
import CompactSelectField from '../../UI/CompactSelectField';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import TextField from '../../UI/TextField';
import AlertContext from '../../UI/Alert/AlertContext';
import { AiProvidersPreferences } from './AiProvidersPreferences';
import {
  AiRequestContext,
  initialAiRequestContextState,
} from '../../AiGeneration/AiRequestContext';
import PreferencesContext, { initialPreferences } from './PreferencesContext';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../fixtures/GDevelopServicesTestData';
import {
  createAiProviderConfiguration,
  deleteAiProviderConfiguration,
  updateAiProviderConfiguration,
  type AiProviderConfiguration,
  type AiRequestCustomProviderSupport,
} from '../../Utils/GDevelopServices/Generation';

jest.mock('../../Utils/GDevelopServices/Generation', () => {
  const actual: any = jest.requireActual(
    '../../Utils/GDevelopServices/Generation'
  );
  return {
    ...actual,
    createAiProviderConfiguration: jest.fn(),
    deleteAiProviderConfiguration: jest.fn(),
    updateAiProviderConfiguration: jest.fn(),
  };
});

const customProviderSupport: AiRequestCustomProviderSupport = {
  enabled: true,
  openAiCompatible: true,
};
const muiTheme = createMuiTheme();
const i18n = setupI18n({
  language: 'en',
  catalogs: {
    en: { messages: {} },
  },
});
const mockFn = (fn: Function): JestMockFn<any, any> => (fn: any);
const makeSetAiProviderSettingsSelectionId = (): any => (jest.fn(): any);
const { act }: any = (renderer: any);
const authenticatedUserId = fakeSilverAuthenticatedUser.profile
  ? fakeSilverAuthenticatedUser.profile.id
  : '';

const savedOpenAiProviderConfiguration: AiProviderConfiguration = {
  id: 'openai-provider-configuration',
  name: 'OpenAI',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-5.5',
  temperature: 0.2,
  maxTokens: null,
  hasApiKey: true,
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
};

const savedCustomProviderConfiguration: AiProviderConfiguration = {
  id: 'custom-provider-configuration',
  name: 'My provider',
  providerType: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  model: 'test-model',
  temperature: 0.2,
  maxTokens: null,
  reasoningEffort: 'high',
  hasApiKey: true,
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
};

const savedLocalProviderConfiguration: AiProviderConfiguration = {
  id: 'local-provider-configuration',
  name: 'Local provider',
  providerType: 'openai-compatible',
  baseUrl: 'http://127.0.0.1:18080/',
  model: 'gpt-5.5',
  temperature: 0.2,
  maxTokens: null,
  reasoningEffort: 'high',
  hasApiKey: true,
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
};

const getTextContent = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  return getTextContent(node.children);
};

const renderAiProvidersPreferences = ({
  aiProviderConfigurations = [],
  fetchAiProviderConfigurations = async () => {},
  aiProviderSettingsSelectionId = null,
  setAiProviderSettingsSelectionId = () => {},
}: {|
  aiProviderConfigurations?: Array<AiProviderConfiguration>,
  fetchAiProviderConfigurations?: () => Promise<void>,
  aiProviderSettingsSelectionId?: string | null,
  setAiProviderSettingsSelectionId?: (string | null) => void,
|} = {}): any => {
  let tree: any;
  const preferencesContextValue = ({
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      aiProviderSettingsSelectionId,
    },
    setAiProviderSettingsSelectionId,
  }: any);
  act(() => {
    tree = renderer.create(
      <I18nProvider
        i18n={i18n}
        language="en"
        catalogs={{ en: { messages: {} } }}
      >
        <ThemeProvider theme={muiTheme}>
          <AlertContext.Provider
            value={{
              showAlertDialog: () => {},
              showConfirmDialog: ({ callback }) => callback(true),
              showConfirmDeleteDialog: ({ callback }) => callback(true),
              showYesNoCancelDialog: ({ callback }) => callback(true),
            }}
          >
            <PreferencesContext.Provider value={preferencesContextValue}>
              <AuthenticatedUserContext.Provider
                value={{
                  ...fakeSilverAuthenticatedUser,
                  getAuthorizationHeader: async () => 'Bearer token',
                }}
              >
                <AiRequestContext.Provider
                  value={{
                    ...initialAiRequestContextState,
                    aiProviderConfigurationState: {
                      aiProviderConfigurations,
                      customProviderSupport,
                      isLoading: false,
                      fetchAiProviderConfigurations,
                    },
                  }}
                >
                  <AiProvidersPreferences />
                </AiRequestContext.Provider>
              </AuthenticatedUserContext.Provider>
            </PreferencesContext.Provider>
          </AlertContext.Provider>
        </ThemeProvider>
      </I18nProvider>
    );
  });
  // $FlowFixMe[incompatible-return]
  return tree;
};

const setSelectedProvider = (root: any, value: string) => {
  act(() => {
    root.findByType(CompactSelectField).props.onChange(value);
  });
};

const setTextFieldValue = (root: any, fieldIndex: number, value: string) => {
  act(() => {
    root.findAllByType(TextField)[fieldIndex].props.onChange({}, value);
  });
};

const getTextFieldValue = (root: any, fieldIndex: number): string =>
  root.findAllByType(TextField)[fieldIndex].props.value;

const setThinkingLevel = (root: any, value: string) => {
  act(() => {
    root.findByType(SelectField).props.onChange({}, -1, value);
  });
};

const getThinkingLevel = (root: any): string =>
  root.findByType(SelectField).props.value;

const getProviderSelectOptions = (
  root: any
): Array<{| label: any, value: string |}> =>
  root
    .findByType(CompactSelectField)
    .findAllByType(SelectOption)
    .map(option => ({
      label: option.props.label,
      value: option.props.value,
    }));

const clickSave = async (root: any) => {
  await act(async () => {
    await root.findByType(RaisedButton).props.onClick();
  });
};

const clickDelete = async (root: any) => {
  await act(async () => {
    const buttons = root.findAllByType(FlatButton);
    await buttons[buttons.length - 1].props.onClick();
  });
};

describe('AiProvidersPreferences', () => {
  beforeEach(() => {
    mockFn(createAiProviderConfiguration).mockReset();
    mockFn(deleteAiProviderConfiguration).mockReset();
    mockFn(updateAiProviderConfiguration).mockReset();
  });

  it('renders common provider presets in the provider dropdown', () => {
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    expect(getProviderSelectOptions(root).map(option => option.value)).toEqual([
      'preset:openai',
      'preset:openrouter',
      'preset:google-gemini',
      'preset:groq',
      'preset:mistral',
      'preset:deepseek',
      'preset:xai',
      'custom-new',
    ]);
    expect(getProviderSelectOptions(root).map(option => option.label)).toEqual([
      'OpenAI',
      'OpenRouter',
      'Google Gemini',
      'Groq',
      'Mistral',
      'DeepSeek',
      'xAI',
      expect.any(Object),
    ]);
  });

  it('hides saved preset configurations from the provider dropdown', () => {
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [
        savedOpenAiProviderConfiguration,
        savedCustomProviderConfiguration,
      ],
    });
    const root = tree.root;

    expect(getProviderSelectOptions(root).map(option => option.value)).toEqual([
      'preset:openai',
      'preset:openrouter',
      'preset:google-gemini',
      'preset:groq',
      'preset:mistral',
      'preset:deepseek',
      'preset:xai',
      'custom-new',
      'configuration:custom-provider-configuration',
    ]);
  });

  it('defaults new preset and custom provider optional settings', () => {
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    expect(getTextFieldValue(root, 4)).toBe('0.2');
    expect(getThinkingLevel(root)).toBe('');

    setSelectedProvider(root, 'custom-new');

    expect(getTextFieldValue(root, 4)).toBe('0.2');
    expect(getThinkingLevel(root)).toBe('');
  });

  it('displays auto for saved providers without a thinking level', () => {
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [savedOpenAiProviderConfiguration],
    });
    const root = tree.root;

    expect(getThinkingLevel(root)).toBe('');
  });

  it('displays the saved thinking level', () => {
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [savedCustomProviderConfiguration],
      aiProviderSettingsSelectionId:
        'configuration:custom-provider-configuration',
    });
    const root = tree.root;

    expect(getThinkingLevel(root)).toBe('high');
  });

  it('persists the selected saved provider from the dropdown', () => {
    const setAiProviderSettingsSelectionId = makeSetAiProviderSettingsSelectionId();
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [savedCustomProviderConfiguration],
      setAiProviderSettingsSelectionId,
    });
    const root = tree.root;

    setSelectedProvider(root, 'configuration:custom-provider-configuration');

    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith(
      'configuration:custom-provider-configuration'
    );
  });

  it('persists unsaved preset and custom entries from the dropdown', () => {
    const setAiProviderSettingsSelectionId = makeSetAiProviderSettingsSelectionId();
    const tree = renderAiProvidersPreferences({
      setAiProviderSettingsSelectionId,
    });
    const root = tree.root;

    setSelectedProvider(root, 'preset:openrouter');
    setSelectedProvider(root, 'custom-new');

    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith(
      'preset:openrouter'
    );
    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith('custom-new');
  });

  it('shows a translated validation error when saving with only a provider name', async () => {
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    setSelectedProvider(root, 'custom-new');
    setTextFieldValue(root, 0, 'My provider');
    await clickSave(root);

    expect(getTextContent(tree.toJSON())).toContain(
      'Enter a name, base URL, and model before saving.'
    );
  });

  it('shows a translated validation error when saving a new provider without an API key', async () => {
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    setSelectedProvider(root, 'custom-new');
    setTextFieldValue(root, 0, 'My provider');
    setTextFieldValue(root, 1, 'https://api.example.com/v1');
    setTextFieldValue(root, 2, 'test-model');
    await clickSave(root);

    expect(getTextContent(tree.toJSON())).toContain(
      'Enter an API key before saving this provider.'
    );
  });

  it('shows a friendly message when provider saving is forbidden', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      mockFn(createAiProviderConfiguration).mockRejectedValue({
        response: { status: 403, data: {} },
        message: 'Request failed with status code 403',
      });
      const tree = renderAiProvidersPreferences();
      const root = tree.root;

      setSelectedProvider(root, 'custom-new');
      setTextFieldValue(root, 0, 'My provider');
      setTextFieldValue(root, 1, 'https://api.example.com/v1');
      setTextFieldValue(root, 2, 'test-model');
      setTextFieldValue(root, 3, 'sk-test');
      await clickSave(root);

      expect(getTextContent(tree.toJSON())).toContain(
        "You don't have access to remote AI providers yet."
      );
      expect(getTextContent(tree.toJSON())).not.toContain(
        'Request failed with status code 403'
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('shows a friendly message when the provider rejects the authorization header', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      mockFn(createAiProviderConfiguration).mockRejectedValue({
        response: {
          data: {
            message:
              "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'abc='.",
          },
        },
      });
      const tree = renderAiProvidersPreferences();
      const root = tree.root;

      setTextFieldValue(root, 3, 'sk-test');
      await clickSave(root);

      expect(getTextContent(tree.toJSON())).toContain(
        'The provider rejected the API key format. Paste only the API key value, without "Bearer" or "Authorization:", then save again.'
      );
      expect(getTextContent(tree.toJSON())).not.toContain(
        'Invalid key=value pair'
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('shows a service availability message when the provider route is not configured', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      mockFn(createAiProviderConfiguration).mockRejectedValue({
        response: {
          headers: {
            'x-amzn-ErrorType': 'IncompleteSignatureException',
          },
          data: {
            message:
              "Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'abc='.",
          },
        },
      });
      const tree = renderAiProvidersPreferences();
      const root = tree.root;

      setTextFieldValue(root, 3, 'sk-test');
      await clickSave(root);

      expect(getTextContent(tree.toJSON())).toContain(
        'Remote AI providers are not available from this GDevelop services environment yet.'
      );
      expect(getTextContent(tree.toJSON())).not.toContain(
        'The provider rejected the API key format'
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('saves an unsaved preset by creating its backing configuration without selecting a duplicate row', async () => {
    mockFn(createAiProviderConfiguration).mockResolvedValue(
      savedOpenAiProviderConfiguration
    );
    const fetchAiProviderConfigurations = (jest.fn(): any).mockResolvedValue(
      undefined
    );
    const setAiProviderSettingsSelectionId = makeSetAiProviderSettingsSelectionId();
    const tree = renderAiProvidersPreferences({
      fetchAiProviderConfigurations,
      setAiProviderSettingsSelectionId,
    });
    const root = tree.root;

    setTextFieldValue(root, 3, 'sk-test');
    await clickSave(root);

    expect(createAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      {
        userId: authenticatedUserId,
        configuration: {
          name: 'OpenAI',
          providerType: 'openai-compatible',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-5.5',
          temperature: 0.2,
          maxTokens: null,
          reasoningEffort: null,
          apiKey: 'sk-test',
        },
      }
    );
    expect(updateAiProviderConfiguration).not.toHaveBeenCalled();
    expect(fetchAiProviderConfigurations).toHaveBeenCalled();
    expect(root.findByType(CompactSelectField).props.value).toBe(
      'preset:openai'
    );
    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith(
      'preset:openai'
    );
  });

  it('saves only the API key value when pasted with common wrappers', async () => {
    const pastedApiKeys = [
      'Authorization: Bearer sk-test',
      '-H "Authorization: Bearer sk-test"',
      'OPENROUTER_API_KEY=sk-test',
    ];

    for (const pastedApiKey of pastedApiKeys) {
      mockFn(createAiProviderConfiguration).mockReset();
      mockFn(createAiProviderConfiguration).mockResolvedValue(
        savedOpenAiProviderConfiguration
      );
      const tree = renderAiProvidersPreferences();
      const root = tree.root;

      setTextFieldValue(root, 3, pastedApiKey);
      await clickSave(root);

      expect(createAiProviderConfiguration).toHaveBeenCalledWith(
        expect.any(Function),
        {
          userId: authenticatedUserId,
          configuration: {
            name: 'OpenAI',
            providerType: 'openai-compatible',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-5.5',
            temperature: 0.2,
            maxTokens: null,
            reasoningEffort: null,
            apiKey: 'sk-test',
          },
        }
      );
    }
  });

  it('updates the newest saved preset configuration instead of creating another one', async () => {
    mockFn(updateAiProviderConfiguration).mockResolvedValue({
      ...savedOpenAiProviderConfiguration,
      model: 'gpt-5.5-mini',
    });
    const olderOpenAiConfiguration = {
      ...savedOpenAiProviderConfiguration,
      id: 'older-openai-provider-configuration',
      updatedAt: '2026-05-14T10:00:00.000Z',
    };
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [
        olderOpenAiConfiguration,
        savedOpenAiProviderConfiguration,
      ],
    });
    const root = tree.root;

    setTextFieldValue(root, 2, 'gpt-5.5-mini');
    await clickSave(root);

    expect(updateAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      {
        userId: authenticatedUserId,
        providerConfigurationId: savedOpenAiProviderConfiguration.id,
        configuration: {
          name: 'OpenAI',
          providerType: 'openai-compatible',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-5.5-mini',
          temperature: 0.2,
          maxTokens: null,
          reasoningEffort: null,
        },
      }
    );
    expect(createAiProviderConfiguration).not.toHaveBeenCalled();
    expect(root.findByType(CompactSelectField).props.value).toBe(
      'preset:openai'
    );
  });

  it('still creates custom providers from scratch', async () => {
    mockFn(createAiProviderConfiguration).mockResolvedValue(
      savedCustomProviderConfiguration
    );
    const setAiProviderSettingsSelectionId = makeSetAiProviderSettingsSelectionId();
    const tree = renderAiProvidersPreferences({
      setAiProviderSettingsSelectionId,
    });
    const root = tree.root;

    setSelectedProvider(root, 'custom-new');
    setTextFieldValue(root, 0, 'My provider');
    setTextFieldValue(root, 1, 'https://api.example.com/v1');
    setTextFieldValue(root, 2, 'test-model');
    setTextFieldValue(root, 3, 'sk-test');
    await clickSave(root);

    expect(createAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      {
        userId: authenticatedUserId,
        configuration: {
          name: 'My provider',
          providerType: 'openai-compatible',
          baseUrl: 'https://api.example.com/v1',
          model: 'test-model',
          temperature: 0.2,
          maxTokens: null,
          reasoningEffort: null,
          apiKey: 'sk-test',
        },
      }
    );
    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith(
      'configuration:custom-provider-configuration'
    );
  });

  it('saves the selected thinking level', async () => {
    mockFn(createAiProviderConfiguration).mockResolvedValue(
      savedCustomProviderConfiguration
    );
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    setSelectedProvider(root, 'custom-new');
    setTextFieldValue(root, 0, 'My provider');
    setTextFieldValue(root, 1, 'https://api.example.com/v1');
    setTextFieldValue(root, 2, 'test-model');
    setTextFieldValue(root, 3, 'sk-test');
    setThinkingLevel(root, 'high');
    await clickSave(root);

    expect(createAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        configuration: expect.objectContaining({
          reasoningEffort: 'high',
        }),
      })
    );
  });

  it('deleting the selected provider falls back to another saved provider', async () => {
    mockFn(deleteAiProviderConfiguration).mockResolvedValue(undefined);
    const fetchAiProviderConfigurations = (jest.fn(): any).mockResolvedValue(
      undefined
    );
    const setAiProviderSettingsSelectionId = makeSetAiProviderSettingsSelectionId();
    const tree = renderAiProvidersPreferences({
      aiProviderConfigurations: [
        savedCustomProviderConfiguration,
        savedOpenAiProviderConfiguration,
      ],
      fetchAiProviderConfigurations,
      aiProviderSettingsSelectionId:
        'configuration:custom-provider-configuration',
      setAiProviderSettingsSelectionId,
    });
    const root = tree.root;

    await clickDelete(root);

    expect(deleteAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      {
        userId: authenticatedUserId,
        providerConfigurationId: savedCustomProviderConfiguration.id,
      }
    );
    expect(fetchAiProviderConfigurations).toHaveBeenCalled();
    expect(setAiProviderSettingsSelectionId).toHaveBeenCalledWith(
      'preset:openai'
    );
  });

  it('allows saving a localhost custom provider', async () => {
    mockFn(createAiProviderConfiguration).mockResolvedValue(
      savedLocalProviderConfiguration
    );
    const fetchAiProviderConfigurations = (jest.fn(): any).mockResolvedValue(
      undefined
    );
    const tree = renderAiProvidersPreferences({
      fetchAiProviderConfigurations,
    });
    const root = tree.root;

    setSelectedProvider(root, 'custom-new');
    setTextFieldValue(root, 0, 'Local provider');
    setTextFieldValue(root, 1, 'http://127.0.0.1:18080/');
    setTextFieldValue(root, 2, 'gpt-5.5');
    setTextFieldValue(root, 3, 'sk-local');
    await clickSave(root);

    expect(getTextContent(tree.toJSON())).not.toContain(
      'Localhost providers are not supported'
    );
    expect(createAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      {
        userId: authenticatedUserId,
        configuration: {
          name: 'Local provider',
          providerType: 'openai-compatible',
          baseUrl: 'http://127.0.0.1:18080/',
          model: 'gpt-5.5',
          temperature: 0.2,
          maxTokens: null,
          reasoningEffort: null,
          apiKey: 'sk-local',
        },
      }
    );
    expect(fetchAiProviderConfigurations).toHaveBeenCalled();
  });

  it('saves a blank context window as auto-detect and explains the behavior', async () => {
    mockFn(createAiProviderConfiguration).mockResolvedValue(
      savedOpenAiProviderConfiguration
    );
    const tree = renderAiProvidersPreferences();
    const root = tree.root;

    setTextFieldValue(root, 3, 'sk-test');
    await clickSave(root);

    expect(createAiProviderConfiguration).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        configuration: expect.objectContaining({
          maxTokens: null,
        }),
      })
    );
    expect(getTextContent(tree.toJSON())).toContain(
      'Leave blank to auto-detect from the model/provider.'
    );
    expect(getTextContent(tree.toJSON())).toContain(
      'Auto lets the model/provider choose. If a selected level is unsupported, GDevelop retries without it.'
    );
  });
});

// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import AlertMessage from '../../UI/AlertMessage';
import CompactSelectField from '../../UI/CompactSelectField';
import FlatButton from '../../UI/FlatButton';
import { Column, Line } from '../../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import { AiRequestContext } from '../../AiGeneration/AiRequestContext';
import {
  aiProviderPresets,
  CUSTOM_PROVIDER_SELECTION_ID,
  getConfigurationIdFromSelectionId,
  getConfigurationSelectionId,
  getPresetConfiguration,
  getPresetIdFromSelectionId,
  getPresetSelectionId,
  getSelectionIdFromAiProviderConfiguration,
  isPresetConfiguration,
  type AiProviderPreset,
} from '../../AiGeneration/AiProviderConfigurations';
import PreferencesContext from './PreferencesContext';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  createAiProviderConfiguration,
  deleteAiProviderConfiguration,
  isLocalAiProviderBaseUrl,
  testAiProviderConfiguration,
  updateAiProviderConfiguration,
  type AiProviderConfiguration,
  type AiProviderConfigurationWritePayload,
  type AiProviderReasoningEffort,
} from '../../Utils/GDevelopServices/Generation';

type FormState = {|
  name: string,
  baseUrl: string,
  model: string,
  apiKey: string,
  temperature: string,
  maxTokens: string,
  reasoningEffort: string,
|};

const DEFAULT_PROVIDER_TEMPERATURE = '0.2';
const AUTO_REASONING_EFFORT = '';

const emptyFormState: FormState = {
  name: '',
  baseUrl: '',
  model: '',
  apiKey: '',
  temperature: DEFAULT_PROVIDER_TEMPERATURE,
  maxTokens: '',
  reasoningEffort: AUTO_REASONING_EFFORT,
};

const presetToFormState = (preset: AiProviderPreset): FormState => ({
  name: preset.name,
  baseUrl: preset.baseUrl,
  model: preset.model,
  apiKey: '',
  temperature: DEFAULT_PROVIDER_TEMPERATURE,
  maxTokens: '',
  reasoningEffort: AUTO_REASONING_EFFORT,
});

const configurationToFormState = (
  configuration: AiProviderConfiguration
): FormState => ({
  name: configuration.name || '',
  baseUrl: configuration.baseUrl || '',
  model: configuration.model || '',
  apiKey: '',
  temperature:
    configuration.temperature === null ||
    configuration.temperature === undefined
      ? ''
      : configuration.temperature.toString(),
  maxTokens:
    configuration.maxTokens === null || configuration.maxTokens === undefined
      ? ''
      : configuration.maxTokens.toString(),
  reasoningEffort: configuration.reasoningEffort || AUTO_REASONING_EFFORT,
});

const getNumberOrNull = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getIntegerOrNull = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsedValue = parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getReasoningEffortOrNull = (
  value: string
): AiProviderReasoningEffort | null => {
  switch (value) {
    case 'none':
    case 'minimal':
    case 'low':
    case 'medium':
    case 'high':
    case 'xhigh':
      return value;
    default:
      return null;
  }
};

const stripMatchingQuotes = (value: string): string => {
  const trimmedValue = value.trim();
  if (trimmedValue.length < 2) return trimmedValue;

  const firstCharacter = trimmedValue[0];
  const lastCharacter = trimmedValue[trimmedValue.length - 1];
  return (firstCharacter === '"' && lastCharacter === '"') ||
    (firstCharacter === "'" && lastCharacter === "'")
    ? trimmedValue.slice(1, -1).trim()
    : trimmedValue;
};

const getSanitizedApiKey = (apiKey: string): string => {
  let sanitizedApiKey = stripMatchingQuotes(apiKey);
  const headerArgumentMatch = sanitizedApiKey.match(
    /^(?:-H|--header)\s+(.+)$/i
  );
  sanitizedApiKey = headerArgumentMatch
    ? stripMatchingQuotes(headerArgumentMatch[1])
    : sanitizedApiKey;

  const apiKeyAssignmentMatch = sanitizedApiKey.match(
    /^(?:[a-z0-9_]*api[_-]?key|apiKey)\s*[:=]\s*(.+)$/i
  );
  sanitizedApiKey = apiKeyAssignmentMatch
    ? stripMatchingQuotes(apiKeyAssignmentMatch[1])
    : sanitizedApiKey;

  const authorizationHeaderMatch = sanitizedApiKey.match(
    /^authorization\s*[:=]\s*(.+)$/i
  );
  sanitizedApiKey = authorizationHeaderMatch
    ? stripMatchingQuotes(authorizationHeaderMatch[1])
    : sanitizedApiKey;

  const bearerTokenMatch = sanitizedApiKey.match(/^bearer\s+(.+)$/i);
  return bearerTokenMatch
    ? stripMatchingQuotes(bearerTokenMatch[1])
    : sanitizedApiKey;
};

const isInvalidAuthorizationHeaderMessage = (message: string): boolean =>
  /Invalid key=value pair \(missing equal-sign\) in Authorization header/i.test(
    message
  );

const getResponseHeader = (error: any, headerName: string): string | null => {
  const headers =
    error && error.response && error.response.headers
      ? error.response.headers
      : null;
  if (!headers) return null;

  const normalizedHeaderName = headerName.toLowerCase();
  const matchingHeaderName = Object.keys(headers).find(
    headerName => headerName.toLowerCase() === normalizedHeaderName
  );
  if (!matchingHeaderName) return null;

  const value = headers[matchingHeaderName];
  return typeof value === 'string' ? value : null;
};

const isGDevelopServicesIncompleteSignatureError = (error: any): boolean => {
  const errorType = getResponseHeader(error, 'x-amzn-errortype');
  return !!errorType && errorType.indexOf('IncompleteSignatureException') === 0;
};

const getErrorMessage = (
  error: any,
  fallbackMessage: MessageDescriptor
): MessageDescriptor => {
  const responseData =
    error && error.response && error.response.data ? error.response.data : null;
  if (responseData && typeof responseData.message === 'string') {
    if (isInvalidAuthorizationHeaderMessage(responseData.message)) {
      if (isGDevelopServicesIncompleteSignatureError(error)) {
        return t`Remote AI providers are not available from this GDevelop services environment yet.`;
      }

      return t`The provider rejected the API key format. Paste only the API key value, without "Bearer" or "Authorization:", then save again.`;
    }

    return responseData.message;
  }

  const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(error);
  if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
    return t`You don't have access to remote AI providers yet.`;
  }

  return fallbackMessage;
};

const TranslatedAlertMessage = ({
  kind,
  message,
}: {|
  kind: 'info' | 'warning',
  message: MessageDescriptor,
|}): React.Node => (
  <I18n>
    {({ i18n }) => <AlertMessage kind={kind}>{i18n._(message)}</AlertMessage>}
  </I18n>
);

const GDevelopAiDefaultProvider = (): React.Node => (
  <LineStackLayout noMargin alignItems="center">
    <Column noMargin expand>
      <Text noMargin>
        <Trans>GDevelop AI</Trans>
      </Text>
      <Text size="body-small" color="secondary" noMargin>
        <Trans>Default provider for new Ask AI requests.</Trans>
      </Text>
    </Column>
  </LineStackLayout>
);

export const AiProvidersPreferences = (): React.Node => {
  const {
    aiProviderConfigurationState: {
      aiProviderConfigurations,
      customProviderSupport,
      isLoading,
      fetchAiProviderConfigurations,
    },
  } = React.useContext(AiRequestContext);
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const {
    values: { aiProviderSettingsSelectionId },
    setAiProviderSettingsSelectionId,
  } = React.useContext(PreferencesContext);
  const { showConfirmation } = useAlertDialog();

  const openAiCompatibleConfigurations = React.useMemo(
    (): Array<AiProviderConfiguration> =>
      aiProviderConfigurations.filter(
        configuration => configuration.providerType === 'openai-compatible'
      ),
    [aiProviderConfigurations]
  );
  const presetConfigurationsById = React.useMemo(
    (): { [string]: AiProviderConfiguration | null } => {
      const configurationsById: {
        [string]: AiProviderConfiguration | null,
      } = {};
      aiProviderPresets.forEach(preset => {
        configurationsById[preset.id] = getPresetConfiguration(
          openAiCompatibleConfigurations,
          preset
        );
      });
      return configurationsById;
    },
    [openAiCompatibleConfigurations]
  );
  const customOpenAiCompatibleConfigurations = React.useMemo(
    (): Array<AiProviderConfiguration> =>
      openAiCompatibleConfigurations.filter(
        configuration => !isPresetConfiguration(configuration)
      ),
    [openAiCompatibleConfigurations]
  );

  const [
    selectedProviderSelectionId,
    setSelectedProviderSelectionId,
  ] = React.useState<string>(
    aiProviderSettingsSelectionId ||
      getPresetSelectionId(aiProviderPresets[0].id)
  );
  const [formState, setFormState] = React.useState<FormState>(emptyFormState);
  const [
    operationError,
    setOperationError,
  ] = React.useState<MessageDescriptor | null>(null);
  const [
    operationMessage,
    setOperationMessage,
  ] = React.useState<MessageDescriptor | null>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isTesting, setIsTesting] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const selectedPresetId = getPresetIdFromSelectionId(
    selectedProviderSelectionId
  );
  const selectedAiProviderPreset = selectedPresetId
    ? aiProviderPresets.find(preset => preset.id === selectedPresetId) || null
    : null;
  const selectedCustomConfigurationId = getConfigurationIdFromSelectionId(
    selectedProviderSelectionId
  );
  const selectedCustomConfiguration = selectedCustomConfigurationId
    ? customOpenAiCompatibleConfigurations.find(
        configuration => configuration.id === selectedCustomConfigurationId
      ) || null
    : null;
  const selectedConfiguration = selectedAiProviderPreset
    ? presetConfigurationsById[selectedAiProviderPreset.id] || null
    : selectedCustomConfiguration;

  React.useEffect(
    () => {
      if (isLoading || isSaving || isDeleting) return;

      if (selectedPresetId && !selectedAiProviderPreset) {
        const fallbackSelectionId = getPresetSelectionId(
          aiProviderPresets[0].id
        );
        setSelectedProviderSelectionId(fallbackSelectionId);
        setAiProviderSettingsSelectionId(fallbackSelectionId);
        return;
      }

      if (
        selectedCustomConfigurationId &&
        !customOpenAiCompatibleConfigurations.some(
          configuration => configuration.id === selectedCustomConfigurationId
        )
      ) {
        const fallbackSelectionId = getPresetSelectionId(
          aiProviderPresets[0].id
        );
        setSelectedProviderSelectionId(fallbackSelectionId);
        setAiProviderSettingsSelectionId(fallbackSelectionId);
      }
    },
    [
      isLoading,
      isSaving,
      isDeleting,
      customOpenAiCompatibleConfigurations,
      setAiProviderSettingsSelectionId,
      selectedAiProviderPreset,
      selectedCustomConfigurationId,
      selectedPresetId,
    ]
  );

  React.useEffect(
    () => {
      setOperationError(null);
      setOperationMessage(null);
      setFormState(
        selectedConfiguration
          ? configurationToFormState(selectedConfiguration)
          : selectedAiProviderPreset
          ? presetToFormState(selectedAiProviderPreset)
          : emptyFormState
      );
    },
    [selectedConfiguration, selectedAiProviderPreset]
  );

  const setFormValue = React.useCallback(
    (key: $Keys<FormState>, value: string) => {
      setFormState(
        (formState: FormState): FormState => {
          switch (key) {
            case 'name':
              return { ...formState, name: value };
            case 'baseUrl':
              return { ...formState, baseUrl: value };
            case 'model':
              return { ...formState, model: value };
            case 'apiKey':
              return { ...formState, apiKey: value };
            case 'temperature':
              return { ...formState, temperature: value };
            case 'maxTokens':
              return { ...formState, maxTokens: value };
            case 'reasoningEffort':
              return { ...formState, reasoningEffort: value };
            default:
              return formState;
          }
        }
      );
    },
    []
  );

  const getPayload = React.useCallback(
    (): AiProviderConfigurationWritePayload | null => {
      const name = selectedAiProviderPreset
        ? selectedAiProviderPreset.name
        : formState.name.trim();
      const baseUrl = selectedAiProviderPreset
        ? selectedAiProviderPreset.baseUrl
        : formState.baseUrl.trim();
      const model = formState.model.trim();
      const apiKey = getSanitizedApiKey(formState.apiKey);

      if (!name || !baseUrl || !model) {
        setOperationError(t`Enter a name, base URL, and model before saving.`);
        return null;
      }

      if (
        (!selectedConfiguration || !selectedConfiguration.hasApiKey) &&
        !apiKey
      ) {
        setOperationError(t`Enter an API key before saving this provider.`);
        return null;
      }
      if (
        selectedConfiguration &&
        selectedConfiguration.hasApiKey &&
        isLocalAiProviderBaseUrl(baseUrl) &&
        !isLocalAiProviderBaseUrl(selectedConfiguration.baseUrl || '') &&
        !apiKey
      ) {
        setOperationError(
          t`Enter an API key before saving this provider locally.`
        );
        return null;
      }

      const payload: AiProviderConfigurationWritePayload = {
        name,
        providerType: 'openai-compatible',
        baseUrl,
        model,
        temperature: getNumberOrNull(formState.temperature),
        maxTokens: getIntegerOrNull(formState.maxTokens),
        reasoningEffort: getReasoningEffortOrNull(formState.reasoningEffort),
      };
      if (apiKey) {
        payload.apiKey = apiKey;
      }
      return payload;
    },
    [formState, selectedAiProviderPreset, selectedConfiguration]
  );

  const onSave = React.useCallback(
    async () => {
      if (!profile) return;

      setOperationError(null);
      setOperationMessage(null);

      const payload = getPayload();
      if (!payload) return;

      setIsSaving(true);
      try {
        const savedConfiguration = selectedConfiguration
          ? await updateAiProviderConfiguration(getAuthorizationHeader, {
              userId: profile.id,
              providerConfigurationId: selectedConfiguration.id,
              configuration: payload,
            })
          : await createAiProviderConfiguration(getAuthorizationHeader, {
              userId: profile.id,
              configuration: payload,
            });

        setSelectedProviderSelectionId(
          selectedAiProviderPreset
            ? getPresetSelectionId(selectedAiProviderPreset.id)
            : getConfigurationSelectionId(savedConfiguration.id)
        );
        setAiProviderSettingsSelectionId(
          selectedAiProviderPreset
            ? getPresetSelectionId(selectedAiProviderPreset.id)
            : getConfigurationSelectionId(savedConfiguration.id)
        );
        setFormState(configurationToFormState(savedConfiguration));
        setOperationMessage(t`AI provider saved.`);
        await fetchAiProviderConfigurations();
      } catch (error) {
        console.error('Error saving AI provider configuration:', error);
        setOperationError(
          getErrorMessage(error, t`Unable to save this AI provider.`)
        );
      } finally {
        setIsSaving(false);
      }
    },
    [
      fetchAiProviderConfigurations,
      getAuthorizationHeader,
      getPayload,
      profile,
      setAiProviderSettingsSelectionId,
      selectedAiProviderPreset,
      selectedConfiguration,
    ]
  );

  const onTest = React.useCallback(
    async () => {
      if (!profile || !selectedConfiguration) return;

      setOperationError(null);
      setOperationMessage(null);
      setIsTesting(true);
      try {
        const result = await testAiProviderConfiguration(
          getAuthorizationHeader,
          {
            userId: profile.id,
            providerConfigurationId: selectedConfiguration.id,
          }
        );

        if (result.success) {
          setOperationMessage(result.message || t`AI provider test succeeded.`);
        } else {
          setOperationError(result.message || t`AI provider test failed.`);
        }
      } catch (error) {
        console.error('Error testing AI provider configuration:', error);
        setOperationError(
          getErrorMessage(error, t`Unable to test this AI provider.`)
        );
      } finally {
        setIsTesting(false);
      }
    },
    [getAuthorizationHeader, profile, selectedConfiguration]
  );

  const onDelete = React.useCallback(
    async () => {
      if (!profile || !selectedConfiguration) return;

      const shouldDelete = await showConfirmation({
        title: t`Delete AI provider?`,
        message: t`This removes this provider from GDevelop. It does not revoke the key at the provider.`,
        confirmButtonLabel: t`Delete`,
      });
      if (!shouldDelete) return;

      setOperationError(null);
      setOperationMessage(null);
      setIsDeleting(true);
      try {
        await deleteAiProviderConfiguration(getAuthorizationHeader, {
          userId: profile.id,
          providerConfigurationId: selectedConfiguration.id,
        });
        const fallbackConfiguration =
          openAiCompatibleConfigurations.find(
            configuration => configuration.id !== selectedConfiguration.id
          ) || null;
        const fallbackSelectionId = fallbackConfiguration
          ? getSelectionIdFromAiProviderConfiguration(fallbackConfiguration)
          : getPresetSelectionId(aiProviderPresets[0].id);
        if (fallbackConfiguration) {
          setSelectedProviderSelectionId(fallbackSelectionId);
          setFormState(configurationToFormState(fallbackConfiguration));
        } else {
          setSelectedProviderSelectionId(fallbackSelectionId);
          setFormState(presetToFormState(aiProviderPresets[0]));
        }
        setAiProviderSettingsSelectionId(fallbackSelectionId);
        setOperationMessage(t`AI provider deleted.`);
        await fetchAiProviderConfigurations();
      } catch (error) {
        console.error('Error deleting AI provider configuration:', error);
        setOperationError(
          getErrorMessage(error, t`Unable to delete this AI provider.`)
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [
      fetchAiProviderConfigurations,
      getAuthorizationHeader,
      profile,
      openAiCompatibleConfigurations,
      setAiProviderSettingsSelectionId,
      selectedConfiguration,
      showConfirmation,
    ]
  );

  if (!customProviderSupport || !customProviderSupport.enabled) {
    return (
      <ColumnStackLayout noMargin>
        <GDevelopAiDefaultProvider />
        <AlertMessage kind="info">
          <Trans>
            Custom AI providers are not available from the GDevelop services
            yet.
          </Trans>
        </AlertMessage>
      </ColumnStackLayout>
    );
  }

  const isOpenAiCompatibleSupported = !!customProviderSupport.openAiCompatible;

  if (!profile) {
    return (
      <ColumnStackLayout noMargin>
        <GDevelopAiDefaultProvider />
        <AlertMessage kind="info">
          <Trans>Sign in to configure OpenAI-compatible providers.</Trans>
        </AlertMessage>
      </ColumnStackLayout>
    );
  }

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage kind="info">
        <Trans>Configure OpenAI-compatible providers for Ask AI.</Trans>
      </AlertMessage>
      <GDevelopAiDefaultProvider />
      {isOpenAiCompatibleSupported ? (
        <ColumnStackLayout>
          <Text size="sub-title">
            <Trans>OpenAI-compatible provider</Trans>
          </Text>
          <LineStackLayout noMargin alignItems="center">
            <Column noMargin expand>
              <Text noMargin>
                <Trans>Provider</Trans>
              </Text>
            </Column>
            <Column noMargin expand>
              <CompactSelectField
                value={selectedProviderSelectionId}
                disabled={isLoading || isSaving || isDeleting || isTesting}
                onChange={(value: string) => {
                  setSelectedProviderSelectionId(value);
                  setAiProviderSettingsSelectionId(value);
                }}
              >
                {aiProviderPresets.map(preset => (
                  <SelectOption
                    key={preset.id}
                    value={getPresetSelectionId(preset.id)}
                    label={preset.name}
                    shouldNotTranslate
                  />
                ))}
                <SelectOption
                  value={CUSTOM_PROVIDER_SELECTION_ID}
                  label={t`Custom provider`}
                />
                {customOpenAiCompatibleConfigurations.map(configuration => (
                  <SelectOption
                    key={configuration.id}
                    value={getConfigurationSelectionId(configuration.id)}
                    label={configuration.name}
                    shouldNotTranslate
                  />
                ))}
              </CompactSelectField>
            </Column>
          </LineStackLayout>
          <TextField
            value={formState.name}
            floatingLabelText={<Trans>Name</Trans>}
            fullWidth
            disabled={
              !!selectedAiProviderPreset || isSaving || isDeleting || isTesting
            }
            onChange={(event, value) => setFormValue('name', value)}
          />
          <TextField
            value={formState.baseUrl}
            floatingLabelText={<Trans>Base URL</Trans>}
            hintText="https://api.openai.com/v1"
            fullWidth
            disabled={
              !!selectedAiProviderPreset || isSaving || isDeleting || isTesting
            }
            onChange={(event, value) => setFormValue('baseUrl', value)}
          />
          <TextField
            value={formState.model}
            floatingLabelText={<Trans>Model</Trans>}
            hintText="gpt-5.5"
            fullWidth
            disabled={isSaving || isDeleting || isTesting}
            onChange={(event, value) => setFormValue('model', value)}
          />
          <TextField
            value={formState.apiKey}
            floatingLabelText={
              selectedConfiguration && selectedConfiguration.hasApiKey ? (
                <Trans>Replace API key</Trans>
              ) : (
                <Trans>API key</Trans>
              )
            }
            type="password"
            fullWidth
            disabled={isSaving || isDeleting || isTesting}
            onChange={(event, value) => setFormValue('apiKey', value)}
          />
          <I18n>
            {({ i18n }) => (
              <SelectField
                value={formState.reasoningEffort}
                floatingLabelText={<Trans>Thinking level</Trans>}
                helperMarkdownText={i18n._(
                  t`Auto lets the model/provider choose. If a selected level is unsupported, GDevelop retries without it.`
                )}
                fullWidth
                disabled={isSaving || isDeleting || isTesting}
                onChange={(event, index, value) =>
                  setFormValue('reasoningEffort', value)
                }
              >
                <SelectOption value={AUTO_REASONING_EFFORT} label={t`Auto`} />
                <SelectOption value="none" label={t`None`} />
                <SelectOption value="minimal" label={t`Minimal`} />
                <SelectOption value="low" label={t`Low`} />
                <SelectOption value="medium" label={t`Medium`} />
                <SelectOption value="high" label={t`High`} />
                <SelectOption value="xhigh" label={t`Maximum`} />
              </SelectField>
            )}
          </I18n>
          <LineStackLayout noMargin alignItems="flex-start">
            <Column noMargin expand>
              <TextField
                value={formState.temperature}
                floatingLabelText={<Trans>Temperature</Trans>}
                type="number"
                fullWidth
                disabled={isSaving || isDeleting || isTesting}
                onChange={(event, value) => setFormValue('temperature', value)}
              />
            </Column>
            <Column noMargin expand>
              <I18n>
                {({ i18n }) => (
                  <TextField
                    value={formState.maxTokens}
                    floatingLabelText={<Trans>Max output tokens</Trans>}
                    helperMarkdownText={i18n._(
                      t`Leave blank to use the model/provider default.`
                    )}
                    type="number"
                    fullWidth
                    disabled={isSaving || isDeleting || isTesting}
                    onChange={(event, value) =>
                      setFormValue('maxTokens', value)
                    }
                  />
                )}
              </I18n>
            </Column>
          </LineStackLayout>
          {operationError && (
            <TranslatedAlertMessage kind="warning" message={operationError} />
          )}
          {operationMessage && (
            <TranslatedAlertMessage kind="info" message={operationMessage} />
          )}
          <Line noMargin justifyContent="space-between">
            <LineStackLayout noMargin>
              <RaisedButton
                primary
                label={
                  isSaving ? <Trans>Saving...</Trans> : <Trans>Save</Trans>
                }
                disabled={isSaving || isDeleting || isTesting}
                onClick={onSave}
              />
              <FlatButton
                label={
                  isTesting ? <Trans>Testing...</Trans> : <Trans>Test</Trans>
                }
                disabled={
                  !selectedConfiguration || isSaving || isDeleting || isTesting
                }
                onClick={onTest}
              />
            </LineStackLayout>
            {selectedConfiguration && (
              <FlatButton
                label={
                  isDeleting ? (
                    <Trans>Deleting...</Trans>
                  ) : (
                    <Trans>Delete</Trans>
                  )
                }
                disabled={isSaving || isDeleting || isTesting}
                onClick={onDelete}
              />
            )}
          </Line>
        </ColumnStackLayout>
      ) : (
        <AlertMessage kind="info">
          <Trans>
            OpenAI-compatible providers are not available from this backend yet.
          </Trans>
        </AlertMessage>
      )}
    </ColumnStackLayout>
  );
};

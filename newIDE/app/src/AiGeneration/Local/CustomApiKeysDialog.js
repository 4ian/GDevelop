// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';
import RaisedButton from '../../UI/RaisedButton';
import AlertMessage from '../../UI/AlertMessage';

export type ApiKeyConfig = {|
  provider: string,
  apiKey: string,
|};

type Props = {|
  onClose: () => void,
  onSave: (apiKeys: Array<ApiKeyConfig>) => void,
  open: boolean,
  savedApiKeys?: Array<ApiKeyConfig>,
|};

const SUPPORTED_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    placeholder: 'sk-...',
    description: 'Use your own OpenAI API key for GPT models',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    description: 'Use your own Anthropic API key for Claude models',
  },
  {
    id: 'google',
    name: 'Google AI',
    placeholder: 'AIza...',
    description: 'Use your own Google API key for Gemini models',
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    placeholder: 'hf_...',
    description: 'Use your own HuggingFace API key for various models',
  },
];

const CustomApiKeysDialog = ({ onClose, onSave, open, savedApiKeys }: Props) => {
  const [apiKeys, setApiKeys] = React.useState<{
    [provider: string]: string,
  }>({});
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open && savedApiKeys) {
      const keyMap = {};
      savedApiKeys.forEach(config => {
        keyMap[config.provider] = config.apiKey;
      });
      setApiKeys(keyMap);
    }
  }, [open, savedApiKeys]);

  const handleSave = () => {
    const configs: Array<ApiKeyConfig> = Object.entries(apiKeys)
      .filter(([_, key]) => key && key.trim() !== '')
      .map(([provider, apiKey]) => ({
        provider,
        // $FlowFixMe - We know apiKey is a string
        apiKey: apiKey.trim(),
      }));

    onSave(configs);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [provider]: value,
    });
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Custom API Keys</Trans>}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
            />,
            <RaisedButton
              key="save"
              label={<Trans>Save</Trans>}
              primary
              onClick={handleSave}
            />,
          ]}
          onRequestClose={onClose}
          open={open}
          maxWidth="md"
        >
          <Column noMargin>
            <Text>
              <Trans>
                Configure your own API keys to use online AI models.
                API keys are stored locally and never sent to GDevelop servers.
              </Trans>
            </Text>
            {showSuccess && (
              <AlertMessage kind="info">
                <Trans>API keys saved successfully!</Trans>
              </AlertMessage>
            )}
            {SUPPORTED_PROVIDERS.map(provider => (
              <Column key={provider.id} noMargin>
                <Text size="block-title">{provider.name}</Text>
                <Text size="body-small">{provider.description}</Text>
                <TextField
                  fullWidth
                  type="password"
                  value={apiKeys[provider.id] || ''}
                  onChange={(e, value) => handleKeyChange(provider.id, value)}
                  hintText={provider.placeholder}
                  floatingLabelText={i18n._(t`API Key`)}
                />
              </Column>
            ))}
            <Line>
              <Text size="body-small">
                <Trans>
                  Note: Using custom API keys will bypass GDevelop's usage
                  limits, but you'll be charged directly by the provider.
                </Trans>
              </Text>
            </Line>
          </Column>
        </Dialog>
      )}
    </I18n>
  );
};

export default CustomApiKeysDialog;

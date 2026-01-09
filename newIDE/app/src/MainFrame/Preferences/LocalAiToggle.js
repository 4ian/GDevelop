// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import { CompactToggleField } from '../../UI/CompactToggleField';
import { LocalAiApi } from '../../Utils/GDevelopServices/ApiConfigs';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import CompactTextField from '../../UI/CompactTextField';
import AlertMessage from '../../UI/AlertMessage';

type Props = {|
  i18n: I18n,
|};

export const LocalAiToggle = ({ i18n }: Props) => {
  const [useLocalAi, setUseLocalAi] = React.useState(LocalAiApi.isEnabled());
  const [localAiUrl, setLocalAiUrl] = React.useState(LocalAiApi.getBaseUrl());
  const [serverStatus, setServerStatus] = React.useState<
    'checking' | 'available' | 'unavailable'
  >('checking');

  // Check server availability when enabled
  React.useEffect(() => {
    if (!useLocalAi) {
      setServerStatus('checking');
      return;
    }

    const checkServer = async () => {
      setServerStatus('checking');
      try {
        const response = await fetch(`${localAiUrl}/health`, {
          method: 'GET',
        });
        const data = await response.json();
        if (data.status === 'ok') {
          setServerStatus('available');
        } else {
          setServerStatus('unavailable');
        }
      } catch (error) {
        setServerStatus('unavailable');
      }
    };

    checkServer();
  }, [useLocalAi, localAiUrl]);

  const handleToggle = (checked: boolean) => {
    setUseLocalAi(checked);
    LocalAiApi.setEnabled(checked);
  };

  const handleUrlChange = (newUrl: string) => {
    setLocalAiUrl(newUrl);
    LocalAiApi.setBaseUrl(newUrl);
  };

  return (
    <ColumnStackLayout noMargin>
      <CompactToggleField
        labelColor="primary"
        hideTooltip
        onCheck={handleToggle}
        checked={useLocalAi}
        label={i18n._(t`Use local Claude AI (requires local server)`)}
      />
      {useLocalAi && (
        <ColumnStackLayout noMargin>
          <LineStackLayout noMargin alignItems="center">
            <Column noMargin expand>
              <Text noMargin size="body2">
                <Trans>Local AI Server URL</Trans>
              </Text>
            </Column>
            <Column noMargin expand>
              <CompactTextField
                value={localAiUrl}
                onChange={handleUrlChange}
              />
            </Column>
          </LineStackLayout>
          {serverStatus === 'checking' && (
            <Text size="body2" color="secondary">
              <Trans>Checking server...</Trans>
            </Text>
          )}
          {serverStatus === 'available' && (
            <AlertMessage kind="valid">
              <Trans>Local AI server is available and running.</Trans>
            </AlertMessage>
          )}
          {serverStatus === 'unavailable' && (
            <AlertMessage kind="warning">
              <Trans>
                Local AI server is not available. Make sure to run{' '}
                <code>cd localAIServer && npm start</code> in the GDevelop
                directory.
              </Trans>
            </AlertMessage>
          )}
        </ColumnStackLayout>
      )}
    </ColumnStackLayout>
  );
};

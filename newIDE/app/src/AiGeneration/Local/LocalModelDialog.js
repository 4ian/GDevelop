// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import {
  AVAILABLE_LOCAL_MODELS,
  isModelDownloaded,
  downloadModel,
  deleteModel,
  type LocalModel,
} from './LocalModelManager';
import RaisedButton from '../../UI/RaisedButton';
import LinearProgress from '../../UI/LinearProgress';
import AlertMessage from '../../UI/AlertMessage';

type Props = {|
  onClose: () => void,
  open: boolean,
|};

const LocalModelDialog = ({ onClose, open }: Props) => {
  const [downloadingModels, setDownloadingModels] = React.useState<{
    [modelId: string]: boolean,
  }>({});
  const [downloadProgress, setDownloadProgress] = React.useState<{
    [modelId: string]: number,
  }>({});
  const [downloadedModels, setDownloadedModels] = React.useState<{
    [modelId: string]: boolean,
  }>({});
  const [error, setError] = React.useState<?string>(null);

  React.useEffect(() => {
    // Check which models are already downloaded
    const checkDownloadedModels = async () => {
      const downloaded = {};
      AVAILABLE_LOCAL_MODELS.forEach(model => {
        downloaded[model.id] = isModelDownloaded(model.id);
      });
      setDownloadedModels(downloaded);
    };
    if (open) {
      checkDownloadedModels();
    }
  }, [open]);

  const handleDownload = async (modelId: string) => {
    setDownloadingModels({ ...downloadingModels, [modelId]: true });
    setDownloadProgress({ ...downloadProgress, [modelId]: 0 });
    setError(null);

    const result = await downloadModel(modelId, (progress: number) => {
      setDownloadProgress({ ...downloadProgress, [modelId]: progress });
    });

    setDownloadingModels({ ...downloadingModels, [modelId]: false });

    if (result.success) {
      setDownloadedModels({ ...downloadedModels, [modelId]: true });
    } else {
      setError(result.error || 'Unknown error occurred');
    }
  };

  const handleDelete = async (modelId: string) => {
    setError(null);
    const result = await deleteModel(modelId);

    if (result.success) {
      setDownloadedModels({ ...downloadedModels, [modelId]: false });
    } else {
      setError(result.error || 'Unknown error occurred');
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Manage Local AI Models</Trans>}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              onClick={onClose}
            />,
          ]}
          onRequestClose={onClose}
          open={open}
          maxWidth="md"
        >
          <Column noMargin>
            <Text>
              <Trans>
                Download AI models to run locally with unlimited requests.
                Local models do not require internet connection and don't count
                against usage limits.
              </Trans>
            </Text>
            {error && (
              <AlertMessage kind="error">
                {error}
              </AlertMessage>
            )}
            {AVAILABLE_LOCAL_MODELS.map((model: LocalModel) => {
              const isDownloading = downloadingModels[model.id];
              const isDownloaded = downloadedModels[model.id];
              const progress = downloadProgress[model.id] || 0;

              return (
                <Line key={model.id} justifyContent="space-between">
                  <Column expand noMargin>
                    <Text size="block-title">{model.name}</Text>
                    <Text size="body-small">{model.description}</Text>
                    <Text size="body-small">
                      <Trans>Size: {model.size}</Trans>
                    </Text>
                    {isDownloading && (
                      <LinearProgress
                        value={progress}
                        variant={
                          progress > 0 ? 'determinate' : 'indeterminate'
                        }
                      />
                    )}
                  </Column>
                  <Column noMargin>
                    {isDownloaded ? (
                      <FlatButton
                        label={<Trans>Delete</Trans>}
                        onClick={() => handleDelete(model.id)}
                        disabled={isDownloading}
                      />
                    ) : (
                      <RaisedButton
                        label={<Trans>Download</Trans>}
                        onClick={() => handleDownload(model.id)}
                        disabled={isDownloading}
                      />
                    )}
                  </Column>
                </Line>
              );
            })}
          </Column>
        </Dialog>
      )}
    </I18n>
  );
};

export default LocalModelDialog;

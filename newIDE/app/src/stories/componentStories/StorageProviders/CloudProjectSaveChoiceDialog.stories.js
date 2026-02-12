// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import CloudProjectSaveChoiceDialog from '../../../ProjectsStorage/CloudStorageProvider/CloudProjectSaveChoiceDialog';

export default {
  title: 'Storage Providers/CloudStorageProvider/CloudProjectSaveChoiceDialog',
  component: CloudProjectSaveChoiceDialog,
};

export const Default = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(
    () => {
      if (isLoading) {
        const timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    },
    [isLoading]
  );
  return (
    <CloudProjectSaveChoiceDialog
      isLoading={isLoading}
      onClose={() => action('onClose')()}
      onSaveAsDuplicate={() => setIsLoading(true)}
      onSaveAsMainVersion={() => setIsLoading(true)}
    />
  );
};

// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import QuitInAppTutorialDialog from '../../../InAppTutorial/QuitInAppTutorialDialog';
import { delay } from '../../../Utils/Delay';

export default {
  title: 'In-app tutorial/QuitInAppTutorialDialog',
  component: QuitInAppTutorialDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [canEndTutorial, setCanEndTutorial] = React.useState<boolean>(false);
  return (
    <QuitInAppTutorialDialog
      canEndTutorial={canEndTutorial}
      onSaveProject={async () => {
        setIsSaving(true);
        await delay(1500);
        setCanEndTutorial(true);
        setIsSaving(false);
      }}
      isSavingProject={isSaving}
      onClose={() => action('on close')()}
      endTutorial={() => action('end tutorial')()}
    />
  );
};

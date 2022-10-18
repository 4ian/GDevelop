// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import muiDecorator from '../../ThemeDecorator';
import InAppTutorialEndDialog from '../../../InAppTutorial/InAppTutorialEndDialog';

export default {
  title: 'In-app tutorial/InAppTutorialEndDialog',
  component: InAppTutorialEndDialog,
  decorators: [paperDecorator, muiDecorator],
};

const endDialog = {
  content: [
    {
      messageByLocale: { en: '## Congratulations' },
    },
    { messageByLocale: { en: 'you made it until the end of the tutorial!' } },
    {
      messageByLocale: {
        en:
          'You can be proud. You just discovered all the **concepts** of GDevelop',
      },
    },
    {
      cta: {
        imageSource:
          'https://resources.gdevelop-app.com/games-showcase/images/1e3QbK4hN5LXABOOcXQ3tRnmj_qPc23Wi',
        linkHref: 'https://gdevelop.io',
      },
    },
    {
      messageByLocale: {
        en: 'To know more about all you just saw, click on the image above.',
      },
    },
    { messageByLocale: { en: 'See you later!' } },
  ],
};

export const Default = () => {
  return (
    <InAppTutorialEndDialog
      onClose={() => action('On close dialog')()}
      endDialog={endDialog}
    />
  );
};

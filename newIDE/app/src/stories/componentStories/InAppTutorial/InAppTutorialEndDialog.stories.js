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
      text:
        '## Congratulations\n\nyou made it until the end of the tutorial!\n\nYou can be proud. You just discovered all the **concepts** of GDevelop',
    },
    {
      cta: {
        imageSource:
          'https://resources.gdevelop-app.com/games-showcase/images/1e3QbK4hN5LXABOOcXQ3tRnmj_qPc23Wi',
        linkHref: 'https://gdevelop.io',
      },
    },
    {
      text:
        'To know more about all you just saw, click on the image above.\n\nSee you later!',
    },
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

// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import GeneratedProjectInformationDialog from '../../../ProjectCreation/GeneratedProjectInformationDialog';
import { type GeneratedProject } from '../../../Utils/GDevelopServices/Generation';

export default {
  title: 'Project Creation/GeneratedProjectInformationDialog',
  component: GeneratedProjectInformationDialog,
  decorators: [paperDecorator, muiDecorator],
};

const successfulGeneratedProject: GeneratedProject = {
  id: 'some-id',
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  userId: 'some-user-id',
  prompt: 'A great fantasy game',
  status: 'ready',
  width: 1280,
  height: 720,
  projectName: 'My great game',
  fileUrl: 'https://example.com/my-great-game.zip',
  synopsis:
    'The first level takes place in the downtown area of the city. The player must navigate through traffic and avoid obstacles to reach the finish line. The game is played using the arrow keys on the keyboard to control the vehicle.',
  layoutExplanation:
    "I placed a tall blue building on the left side of the scene to create a sense of depth. I added a highway sign on the right side to give the impression of a busy street. I placed several light poles along the road to create a realistic city environment. I placed the wooden car in the center of the scene as the player's vehicle. I added several red signs along the road to create obstacles. I placed a few small blue holes on the sides of the road to add variety and challenge.",
};

export const Default = () => {
  return (
    <GeneratedProjectInformationDialog
      onClose={() => action('on close')()}
      generatedProject={successfulGeneratedProject}
    />
  );
};

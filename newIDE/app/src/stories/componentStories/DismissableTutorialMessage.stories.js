// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import { DismissableTutorialMessageWidget } from '../../Hints/DismissableTutorialMessage';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import { initialPreferences } from '../../MainFrame/Preferences/PreferencesContext';

export default {
  title: 'Tutorial/DismissableTutorialMessageWidget',
  component: DismissableTutorialMessageWidget,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  tutorials: [
    {
      id: 'tutorial-1',
      title: 'Tutorial 1',
      description: 'Description 1',
      thumbnailUrl:
        'https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png',
      link: 'https://example.com/tutorial.html',
      type: 'video',
    },
    {
      id: 'tutorial-2',
      title: 'Tutorial 2',
      description: 'Description 2',
      thumbnailUrl:
        'https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png',
      link: 'https://example.com/tutorial.html',
      type: 'text',
    },
  ],
  showTutorialHint: action('showTutorialHint'),
  preferencesValues: {
    ...initialPreferences.values,
  },
};

export const NoTutorialsLoaded = () => (
  <DismissableTutorialMessageWidget
    {...defaultProps}
    tutorials={null}
    tutorialId="tutorial-1"
  />
);

export const NoTutorialsFound = () => (
  <DismissableTutorialMessageWidget
    {...defaultProps}
    tutorials={[]}
    tutorialId="tutorial-1"
  />
);

export const HiddenTutorial = () => (
  <DismissableTutorialMessageWidget
    {...defaultProps}
    tutorialId="tutorial-1"
    preferencesValues={{
      ...defaultProps.preferencesValues,
      hiddenTutorialHints: { 'tutorial-1': true },
    }}
  />
);

export const TutorialNotInList = () => (
  <DismissableTutorialMessageWidget {...defaultProps} tutorialId="tutorial-3" />
);

export const DefaultVideo = () => (
  <DismissableTutorialMessageWidget {...defaultProps} tutorialId="tutorial-1" />
);

export const DefaultText = () => (
  <DismissableTutorialMessageWidget {...defaultProps} tutorialId="tutorial-2" />
);

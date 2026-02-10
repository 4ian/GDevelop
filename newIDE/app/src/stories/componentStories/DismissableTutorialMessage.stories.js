// @flow
import * as React from 'react';
import paperDecorator from '../PaperDecorator';

import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import {
  initialPreferences,
  type Preferences,
} from '../../MainFrame/Preferences/PreferencesContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { TutorialContext } from '../../Tutorial/TutorialContext';

const defaultTutorials: Array<Tutorial> = [
  {
    id: 'tutorial-1',
    titleByLocale: { en: 'Tutorial 1' },
    category: 'official-beginner',
    descriptionByLocale: { en: 'Description 1' },
    thumbnailUrlByLocale: {
      en:
        'https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png',
    },
    linkByLocale: { en: 'https://example.com/tutorial.html' },
    type: 'video',
  },
  {
    id: 'tutorial-2',
    titleByLocale: { en: 'Tutorial 2' },
    category: 'official-beginner',
    descriptionByLocale: { en: 'Description 2' },
    thumbnailUrlByLocale: {
      en:
        'https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png',
    },
    linkByLocale: { en: 'https://example.com/tutorial.html' },
    type: 'text',
  },
];

type Props = {|
  tutorials?: ?Array<Tutorial>,
  preferences?: Preferences,
  tutorialId: string,
|};

const WrappedDismissableTutorialMessage = ({
  tutorials = defaultTutorials,
  // $FlowFixMe[incompatible-type]
  preferences = initialPreferences,
  tutorialId,
}: Props): React.Node => (
  <PreferencesContext.Provider value={preferences}>
    <TutorialContext.Provider
      value={{
        tutorials,
        fetchTutorials: () => {},
        error: null,
      }}
    >
      <DismissableTutorialMessage tutorialId={tutorialId} />
    </TutorialContext.Provider>
  </PreferencesContext.Provider>
);

export default {
  title: 'Tutorial/DismissableTutorialMessageWidget',
  component: WrappedDismissableTutorialMessage,
  decorators: [paperDecorator],
};

export const NoTutorialsLoaded = (): React.Node => (
  <WrappedDismissableTutorialMessage tutorials={null} tutorialId="tutorial-1" />
);

export const NoTutorialsFound = (): React.Node => (
  <WrappedDismissableTutorialMessage tutorials={[]} tutorialId="tutorial-1" />
);

export const HiddenTutorial = (): React.Node => (
  <WrappedDismissableTutorialMessage
    tutorialId="tutorial-1"
    // $FlowFixMe[incompatible-type]
    preferences={{
      ...initialPreferences,
      // $FlowFixMe[incompatible-type]
      values: {
        ...initialPreferences.values,
        hiddenTutorialHints: { 'tutorial-1': true },
      },
    }}
  />
);

export const TutorialNotInList = (): React.Node => (
  <WrappedDismissableTutorialMessage tutorialId="tutorial-3" />
);

export const DefaultVideo = (): React.Node => (
  <WrappedDismissableTutorialMessage tutorialId="tutorial-1" />
);

export const DefaultText = (): React.Node => (
  <WrappedDismissableTutorialMessage tutorialId="tutorial-2" />
);

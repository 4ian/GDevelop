// @flow
import * as React from 'react';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { TutorialContext } from '../Tutorial/TutorialContext';
import getTutorial from './getTutorial';
import TutorialMessage from './TutorialMessage';

/**
 * Returns the DismissableTutorialMessage component if the tutorial can be found,
 * otherwise returns null.
 * Useful to use when you need to know if the component is null before rendering,
 * to avoid spacing issues when the component is hidden.
 */
const useDismissableTutorialMessage = (tutorialId: string) => {
  const preferences = React.useContext(PreferencesContext);
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const { tutorials } = React.useContext(TutorialContext);
  const tutorial = getTutorial(preferences, tutorials, tutorialId);

  const DismissableTutorialMessage = React.useMemo(
    () => {
      if (!tutorial || currentlyRunningInAppTutorial) return null;
      return <TutorialMessage tutorial={tutorial} />;
    },
    [tutorial, currentlyRunningInAppTutorial]
  );

  return {
    DismissableTutorialMessage,
  };
};

export default useDismissableTutorialMessage;

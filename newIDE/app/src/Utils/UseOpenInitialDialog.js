// @flow
import * as React from 'react';
import RouterContext from '../MainFrame/RouterContext';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import { FLING_GAME_IN_APP_TUTORIAL_ID } from './GDevelopServices/InAppTutorial';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  openInAppTutorialDialog: (tutorialId: string) => void,
  openProfileDialog: boolean => void,
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
const useOpenInitialDialog = ({
  openInAppTutorialDialog,
  openProfileDialog,
}: Props) => {
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const {
    onOpenCreateAccountDialog,
    onOpenLoginDialog,
    authenticated,
  } = React.useContext(AuthenticatedUserContext);

  React.useEffect(
    () => {
      switch (routeArguments['initial-dialog']) {
        case 'subscription':
          openSubscriptionDialog({
            analyticsMetadata: { reason: 'Landing dialog at opening' },
          });
          removeRouteArguments(['initial-dialog']);
          break;
        case 'signup':
          // Add timeout to give time to the app to sign in with Firebase
          // to make sure the most relevant dialog is opened.
          const signupTimeoutId = setTimeout(() => {
            if (authenticated) {
              openProfileDialog(true);
            } else {
              onOpenCreateAccountDialog();
            }
            removeRouteArguments(['initial-dialog']);
          }, 2000);
          return () => clearTimeout(signupTimeoutId);
        case 'onboarding':
        case 'guided-lesson':
          const tutorialId = routeArguments['tutorial-id'];
          if (tutorialId) {
            openInAppTutorialDialog(tutorialId);
          } else {
            // backward compatibility, open the fling game tutorial.
            openInAppTutorialDialog(FLING_GAME_IN_APP_TUTORIAL_ID);
          }
          removeRouteArguments(['initial-dialog', 'tutorial-id']);
          break;
        case 'games-dashboard':
          // Do nothing as it should open the games dashboard on the homepage
          // in the manage tab. So the homepage handles the route arguments itself.
          break;
        default:
          break;
      }
    },
    [
      routeArguments,
      openInAppTutorialDialog,
      openProfileDialog,
      removeRouteArguments,
      openSubscriptionDialog,
      authenticated,
      onOpenCreateAccountDialog,
      onOpenLoginDialog,
    ]
  );
};

export default useOpenInitialDialog;

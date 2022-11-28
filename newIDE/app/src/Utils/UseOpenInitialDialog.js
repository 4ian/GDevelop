// @flow
import * as React from 'react';
import {
  type GameDetailsTab,
  gameDetailsTabs,
} from '../GameDashboard/GameDetailsDialog';
import { type ProfileTab } from '../Profile/ProfileDialog';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import Window from './Window';

type Props = {|
  parameters: {|
    initialDialog?: string,
    initialGameId?: string,
    initialGamesDashboardTab?: string,
  |},
  actions: {|
    openOnboardingDialog: boolean => void,
    openProfileDialog: boolean => void,
  |},
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
export const useOpenInitialDialog = ({ parameters, actions }: Props) => {
  // Put the initial info in a ref, so that we con change its value
  // and not rely on what stays in the parameters + prevent re-rendering.
  const initialDialogRef = React.useRef<?string>(parameters.initialDialog);
  const initialGameIdRef = React.useRef<?string>(parameters.initialGameId);
  const initialGamesDashboardTabRef = React.useRef<?string>(
    parameters.initialGamesDashboardTab
  );
  const [
    profileDialogInitialTab,
    setProfileDialogInitialTab,
  ] = React.useState<ProfileTab>('profile');
  const [
    gamesDashboardInitialGameId,
    setGamesDashboardInitialGameId,
  ] = React.useState<?string>(null);
  const [
    gamesDashboardInitialTab,
    setGamesDashboardInitialTab,
  ] = React.useState<GameDetailsTab>('details');
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  const openProfileDialogWithTab = (profileDialogInitialTab: ProfileTab) => {
    setProfileDialogInitialTab(profileDialogInitialTab);
    actions.openProfileDialog(true);
  };

  const openGameDashboard = React.useCallback(
    ({ gameId, tab }: {| gameId?: ?string, tab?: ?string |}) => {
      setProfileDialogInitialTab('games-dashboard');
      if (gameId) setGamesDashboardInitialGameId(gameId);
      if (tab) {
        // Ensure that the tab is valid.
        const gameDetailsTab = gameDetailsTabs.find(
          gameDetailsTab => gameDetailsTab.value === tab
        );
        if (gameDetailsTab) setGamesDashboardInitialTab(gameDetailsTab.value);
      }
      actions.openProfileDialog(true);
    },
    [actions]
  );

  React.useEffect(
    () => {
      console.log(parameters);
      switch (initialDialogRef.current) {
        case 'subscription':
          openSubscriptionDialog({ reason: 'Landing dialog at opening' });
          Window.removeArguments(); // Remove the arguments from the URL for cleanup.
          initialDialogRef.current = null; // Reset the initial dialog, to avoid opening it again.
          break;
        case 'onboarding':
          actions.openOnboardingDialog(true);
          Window.removeArguments(); // Remove the arguments from the URL for cleanup.
          initialDialogRef.current = null; // Reset the initial dialog, to avoid opening it again.
          break;
        case 'games-dashboard':
          openGameDashboard({
            gameId: initialGameIdRef.current,
            tab: initialGamesDashboardTabRef.current,
          });
          // Ensure any arguments are removed from the URL to prevent
          // triggering a reopen of the game on the next dashboard opening.
          Window.removeArguments(); // Remove the arguments from the URL for cleanup.
          initialDialogRef.current = null; // Reset the initial dialog and parameters, to avoid opening it again.
          initialGameIdRef.current = null;
          initialGamesDashboardTabRef.current = null;
          break;
        default:
          break;
      }
    },
    [parameters, actions, openGameDashboard, openSubscriptionDialog]
  );

  return {
    profileDialogInitialTab,
    openProfileDialogWithTab,
    gamesDashboardInitialGameId,
    gamesDashboardInitialTab,
  };
};

// @flow
import * as React from 'react';
import {
  type GameDetailsTab,
  gameDetailsTabs,
} from '../GameDashboard/GameDetailsDialog';
import { type ProfileTab } from '../Profile/ProfileDialog';

type Props = {|
  parameters: {|
    initialDialog?: string,
    initialGameId?: string,
    initialGamesDashboardTab?: string,
  |},
  actions: {|
    openSubscriptionDialog: boolean => void,
    openOnboardingDialog: boolean => void,
    openProfileDialog: boolean => void,
  |},
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
export const useOpenInitialDialog = ({ parameters, actions }: Props) => {
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

  const openProfileDialogWithTab = (profileDialogInitialTab: ProfileTab) => {
    setProfileDialogInitialTab(profileDialogInitialTab);
    actions.openProfileDialog(true);
  };

  const openGameDashboard = React.useCallback(
    ({ gameId, tab }: {| gameId?: string, tab?: string |}) => {
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
      switch (parameters.initialDialog) {
        case 'subscription':
          actions.openSubscriptionDialog(true);
          break;
        case 'onboarding':
          actions.openOnboardingDialog(true);
          break;
        case 'games-dashboard':
          openGameDashboard({
            gameId: parameters.initialGameId,
            tab: parameters.initialGamesDashboardTab,
          });
          break;
        default:
          break;
      }
    },
    [parameters, actions, openGameDashboard]
  );

  return {
    profileDialogInitialTab,
    openProfileDialogWithTab,
    gamesDashboardInitialGameId,
    gamesDashboardInitialTab,
  };
};

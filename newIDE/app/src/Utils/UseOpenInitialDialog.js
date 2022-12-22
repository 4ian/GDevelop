// @flow
import * as React from 'react';
import RouterContext from '../MainFrame/RouterContext';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';

type Props = {|
  openOnboardingDialog: boolean => void,
  openProfileDialog: boolean => void,
|};

/**
 * Helper for Mainframe to open a dialog when the component is mounted.
 * This corresponds to when a user opens the app on web, with a parameter in the URL.
 */
export const useOpenInitialDialog = ({
  openOnboardingDialog,
  openProfileDialog,
}: Props) => {
  const { appArguments, removeArguments } = React.useContext(RouterContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  React.useEffect(
    () => {
      switch (appArguments['initial-dialog']) {
        case 'subscription':
          openSubscriptionDialog({ reason: 'Landing dialog at opening' });
          removeArguments(['initial-dialog']);
          break;
        case 'onboarding':
          openOnboardingDialog(true);
          removeArguments(['initial-dialog']);
          break;
        case 'games-dashboard':
          openProfileDialog(true);
          // As the games dashboard is not a dialog in itself, we don't remove the argument
          // and let the ProfileDialog do it once the tab is opened.
          break;
        default:
          break;
      }
    },
    [
      appArguments,
      openOnboardingDialog,
      openProfileDialog,
      removeArguments,
      openSubscriptionDialog,
    ]
  );
};

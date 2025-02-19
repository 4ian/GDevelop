// @flow

import * as React from 'react';

import PublicProfileDialog from './PublicProfileDialog';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import RouterContext from '../MainFrame/RouterContext';

type NewProjectActions = {|
  fetchAndOpenNewProjectSetupDialogForExample: (
    exampleSlug: string
  ) => Promise<void>,
|};

type PublicProfileCallbacks = {|
  onAssetPackOpen?: (
    privateAssetPackListingData: PrivateAssetPackListingData
  ) => void,
  onGameTemplateOpen?: (
    privateAssetPackListingData: PrivateGameTemplateListingData
  ) => void,
  onGameOpen?: (gameId: string) => void,
  onExampleOpen?: (exampleShortHeader: ExampleShortHeader) => void,
|};

export type PublicProfileState = {|
  openUserPublicProfile: ({|
    userId: string,
    callbacks?: PublicProfileCallbacks,
  |}) => void,
  configureNewProjectActions: (actions: NewProjectActions) => void,
|};

const initialPublicProfileState = {
  openUserPublicProfile: () => {},
  configureNewProjectActions: () => {},
};

const PublicProfileContext = React.createContext<PublicProfileState>(
  initialPublicProfileState
);

export default PublicProfileContext;

type Props = {|
  children: React.Node,
|};

export const PublicProfileProvider = ({ children }: Props) => {
  const [
    visitedPublicProfileUserId,
    setVisitedPublicProfileUserId,
  ] = React.useState<?string>(null);
  const [
    profileCallbacks,
    setProfileCallbacks,
  ] = React.useState<?PublicProfileCallbacks>(null);
  const { navigateToRoute } = React.useContext(RouterContext);

  const [
    newProjectActions,
    setNewProjectActions,
  ] = React.useState<?NewProjectActions>(null);

  const openUserPublicProfile = React.useCallback(
    ({
      userId,
      callbacks,
    }: {|
      userId: string,
      callbacks?: PublicProfileCallbacks,
    |}): void => {
      setVisitedPublicProfileUserId(userId);
      setProfileCallbacks(callbacks);
    },
    [setVisitedPublicProfileUserId]
  );

  const closeUserPublicProfile = React.useCallback(
    (): void => {
      setVisitedPublicProfileUserId(null);
      setProfileCallbacks(null);
    },
    [setVisitedPublicProfileUserId]
  );

  const configureNewProjectActions = React.useCallback(
    (actions: NewProjectActions) => {
      setNewProjectActions(actions);
    },
    [setNewProjectActions]
  );

  const publicProfileState: PublicProfileState = React.useMemo(
    () => ({
      openUserPublicProfile,
      configureNewProjectActions,
    }),
    [openUserPublicProfile, configureNewProjectActions]
  );

  const defaultOpenAssetPackCallback = React.useCallback(
    (privateAssetPackListingData: PrivateAssetPackListingData) => {
      navigateToRoute('store', {
        'asset-pack': `product-${privateAssetPackListingData.id}`,
      });
    },
    [navigateToRoute]
  );

  const defaultOpenGameTemplateCallback = React.useCallback(
    (privateGameTemplateListingData: PrivateGameTemplateListingData) => {
      navigateToRoute('store', {
        'game-template': `product-${privateGameTemplateListingData.id}`,
      });
    },
    [navigateToRoute]
  );

  const defaultOpenGameCallback = React.useCallback(
    (gameId: string) => {
      navigateToRoute('play', {
        'playable-game-id': gameId,
      });
    },
    [navigateToRoute]
  );

  const defaultOpenExampleCallback = React.useCallback(
    async (exampleShortHeader: ExampleShortHeader) => {
      if (newProjectActions) {
        await newProjectActions.fetchAndOpenNewProjectSetupDialogForExample(
          exampleShortHeader.slug
        );
      }
    },
    [newProjectActions]
  );

  const onAssetPackOpenCallback = React.useCallback(
    (privateAssetPackListingData: PrivateAssetPackListingData) => {
      const action =
        (profileCallbacks && profileCallbacks.onAssetPackOpen) ||
        defaultOpenAssetPackCallback;
      action(privateAssetPackListingData);
      // Assume that the dialog is awlays closed after the asset pack is opened.
      closeUserPublicProfile();
    },
    [profileCallbacks, closeUserPublicProfile, defaultOpenAssetPackCallback]
  );
  const onGameTemplateOpenCallback = React.useCallback(
    (privateGameTemplateListingData: PrivateGameTemplateListingData) => {
      const action =
        (profileCallbacks && profileCallbacks.onGameTemplateOpen) ||
        defaultOpenGameTemplateCallback;
      action(privateGameTemplateListingData);
      // Assume that the dialog is awlays closed after the asset pack is opened.
      closeUserPublicProfile();
    },
    [profileCallbacks, closeUserPublicProfile, defaultOpenGameTemplateCallback]
  );
  const onGameOpenCallback = React.useCallback(
    (gameId: string) => {
      const action =
        (profileCallbacks && profileCallbacks.onGameOpen) ||
        defaultOpenGameCallback;
      action(gameId);
      // Assume that the dialog is awlays closed after the game is opened.
      closeUserPublicProfile();
    },
    [profileCallbacks, closeUserPublicProfile, defaultOpenGameCallback]
  );
  const onExampleOpenCallback = React.useCallback(
    (exampleShortHeader: ExampleShortHeader) => {
      const action =
        (profileCallbacks && profileCallbacks.onExampleOpen) ||
        defaultOpenExampleCallback;
      action(exampleShortHeader);
      // Assume that the dialog is always closed after the example is opened.
      closeUserPublicProfile();
    },
    [profileCallbacks, closeUserPublicProfile, defaultOpenExampleCallback]
  );

  return (
    <React.Fragment>
      <PublicProfileContext.Provider value={publicProfileState}>
        {children}
      </PublicProfileContext.Provider>
      {visitedPublicProfileUserId && (
        <PublicProfileDialog
          userId={visitedPublicProfileUserId}
          onClose={closeUserPublicProfile}
          onAssetPackOpen={onAssetPackOpenCallback}
          onGameTemplateOpen={onGameTemplateOpenCallback}
          onGameOpen={onGameOpenCallback}
          onExampleOpen={onExampleOpenCallback}
        />
      )}
    </React.Fragment>
  );
};

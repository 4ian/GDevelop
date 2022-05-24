// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import Language from '@material-ui/icons/Language';
import ForumIcon from '@material-ui/icons/Forum';
import HelpIcon from '@material-ui/icons/Help';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';

import FlatButton from '../../../UI/FlatButton';
import IconButton from '../../../UI/IconButton';
import { LargeSpacer, Line, Spacer } from '../../../UI/Grid';
import RaisedButton from '../../../UI/RaisedButton';
import Carousel from '../../../UI/Carousel';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import Window from '../../../Utils/Window';
import { TutorialContext } from '../../../Tutorial/TutorialContext';

import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import ScrollBackground from './ScrollBackground';
import { GamesShowcaseContext } from '../../../GamesShowcase/GamesShowcaseContext';
import { type ShowcasedGame } from '../../../Utils/GDevelopServices/Game';
import ShowcasedGameDialog from '../../../GamesShowcase/ShowcasedGameDialog';
import { type ExampleShortHeader } from '../../../Utils/GDevelopServices/Example';
import { type Tutorial } from '../../../Utils/GDevelopServices/Tutorial';
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import UserChip from '../../../UI/User/UserChip';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ExampleDialog } from '../../../AssetStore/ExampleStore/ExampleDialog';
import ProjectPreCreationDialog from '../../../ProjectCreation/ProjectPreCreationDialog';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
  type OnOpenProjectAfterCreationFunction,
  type ProjectCreationSettings,
} from '../../../ProjectCreation/CreateProjectDialog';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import PreferencesContext from '../../Preferences/PreferencesContext';
import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import { sendTutorialOpened } from '../../../Utils/Analytics/EventSender';
import { hasPendingNotifications } from '../../../Utils/Notification';
import optionalRequire from '../../../Utils/OptionalRequire';
const electron = optionalRequire('electron');

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: 1200,
    marginTop: 10,
    marginBottom: 20,
    padding: 0,
    alignSelf: 'center',
    width: '100%',
  },
};

type Props = {|
  project: ?gdProject,

  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,

  // Project opening
  canOpen: boolean,
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenExamples: () => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenTutorials: () => void,
  onOpenGamesShowcase: () => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,

  // Project creation
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onCreateBlank: OnCreateBlankFunction,
  onOpenProjectAfterCreation: OnOpenProjectAfterCreationFunction,
|};

type HomePageEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
|};

const prepareTutorials = (tutorials: Array<Tutorial>) =>
  tutorials.slice(0, 16).map(tutorial => {
    const { link, ...tutorialWithoutLink } = tutorial;
    return {
      ...tutorialWithoutLink,
      onClick: () => {
        sendTutorialOpened(tutorial.id);
        Window.openExternalURL(link);
      },
    };
  });

export const HomePage = React.memo<Props>(
  React.forwardRef<Props, HomePageEditorInterface>(
    (
      {
        project,
        canOpen,
        onOpen,
        onOpenRecentFile,
        onCreateFromExampleShortHeader,
        onCreateBlank,
        onOpenProjectAfterCreation,
        onOpenExamples,
        onOpenProjectManager,
        onCloseProject,
        onOpenTutorials,
        onOpenGamesShowcase,
        onOpenHelpFinder,
        onOpenLanguageDialog,
        onOpenProfile,
        setToolbar,
      }: Props,
      ref
    ) => {
      const getProject = () => {
        return undefined;
      };

      const updateToolbar = () => {
        if (setToolbar) setToolbar(null);
      };

      const forceUpdateEditor = () => {
        // No updates to be done
      };

      React.useImperativeHandle(ref, () => ({
        getProject,
        updateToolbar,
        forceUpdateEditor,
      }));

      const windowWidth = useResponsiveWindowWidth();
      const authenticatedUser = React.useContext(AuthenticatedUserContext);
      const { getRecentProjectFiles } = React.useContext(PreferencesContext);
      const {
        tutorials,
        fetchTutorials,
        error: tutorialLoadingError,
      } = React.useContext(TutorialContext);
      const {
        allShowcasedGames: showcasedGames,
        fetchShowcasedGamesAndFilters,
        error: showcaseLoadingError,
      } = React.useContext(GamesShowcaseContext);
      const {
        allExamples: examples,
        fetchExamplesAndFilters,
        error: exampleLoadingError,
      } = React.useContext(ExampleStoreContext);

      React.useEffect(
        () => {
          fetchShowcasedGamesAndFilters();
          fetchExamplesAndFilters();
          fetchTutorials();
        },
        [
          fetchExamplesAndFilters,
          fetchShowcasedGamesAndFilters,
          fetchTutorials,
          getRecentProjectFiles,
        ]
      );

      const [
        preCreationDialogOpen,
        setPreCreationDialogOpen,
      ] = React.useState<boolean>(false);
      const [isOpening, setIsOpening] = React.useState<boolean>(false);
      const [
        selectedShowcasedGame,
        setSelectedShowcasedGame,
      ] = React.useState<?ShowcasedGame>(null);
      const [
        selectedExample,
        setSelectedExample,
      ] = React.useState<?ExampleShortHeader>(null);

      const buildRecentProjectFilesMenuTemplate = React.useCallback(
        (i18n: I18nType) => {
          const recentFiles = getRecentProjectFiles();
          if (!recentFiles.length) {
            return [
              {
                label: i18n._(t`No project opened recently`),
                disabled: true,
              },
            ];
          }

          return recentFiles.map(file => ({
            label: file.fileMetadata.fileIdentifier,
            click: () => onOpenRecentFile(file),
          }));
        },
        [getRecentProjectFiles, onOpenRecentFile]
      );

      const prepareExamples = React.useCallback(
        (examples: Array<ExampleShortHeader>) =>
          examples
            .filter(
              example =>
                example.previewImageUrls.length &&
                example.tags.includes('Starter')
            )
            .slice(0, 16)
            .map(example => ({
              id: example.id,
              title: example.name,
              thumbnailUrl:
                example.previewImageUrls.find(url =>
                  url.endsWith('preview.png')
                ) || example.previewImageUrls[0],
              onClick: () => setSelectedExample(example),
            })),
        []
      );

      const prepareShowcasedGames = React.useCallback(
        (games: Array<ShowcasedGame>) =>
          games.slice(0, 16).map(game => ({
            id: game.title,
            title: game.title,
            thumbnailUrl: game.thumbnailUrl,
            onClick: () => setSelectedShowcasedGame(game),
          })),
        []
      );

      const createProject = async (
        i18n: I18nType,
        settings: ProjectCreationSettings
      ) => {
        setIsOpening(true);

        try {
          let projectMetadata;

          if (selectedExample) {
            projectMetadata = await onCreateFromExampleShortHeader({
              i18n,
              exampleShortHeader: selectedExample,
              settings,
            });
          } else {
            projectMetadata = await onCreateBlank({
              i18n,
              settings,
            });
          }

          if (!projectMetadata) return;

          setPreCreationDialogOpen(false);
          setSelectedExample(null);
          onOpenProjectAfterCreation({ ...projectMetadata });
        } finally {
          setIsOpening(false);
        }
      };

      return (
        <I18n>
          {({ i18n }) => (
            <>
              <ScrollBackground>
                <div style={styles.container}>
                  <div style={styles.content}>
                    <div
                      style={{
                        margin: `0px ${windowWidth === 'small' ? 15 : 35}px`,
                      }}
                    >
                      <ResponsiveLineStackLayout justifyContent="space-between">
                        <UserChip
                          profile={authenticatedUser.profile}
                          onClick={onOpenProfile}
                          displayNotificationBadge={hasPendingNotifications(
                            authenticatedUser
                          )}
                        />
                        <ResponsiveLineStackLayout
                          justifyContent="flex-end"
                          noColumnMargin
                        >
                          {!project && (
                            <RaisedButton
                              primary
                              label={<Trans>Create a blank project</Trans>}
                              onClick={() => {
                                setPreCreationDialogOpen(true);
                              }}
                              icon={<AddCircleOutline />}
                              id="home-create-blank-project-button"
                            />
                          )}
                          {!project && canOpen && (
                            <RaisedButtonWithSplitMenu
                              label={<Trans>Open a project</Trans>}
                              onClick={onOpen}
                              buildMenuTemplate={
                                buildRecentProjectFilesMenuTemplate
                              }
                            />
                          )}
                          {!!project && (
                            <>
                              <RaisedButton
                                label={<Trans>Open Project Manager</Trans>}
                                onClick={onOpenProjectManager}
                                primary
                              />
                              <Spacer />
                              <FlatButton
                                label={<Trans>Close project</Trans>}
                                onClick={() => {
                                  onCloseProject();
                                }}
                                id="home-close-project-button"
                              />
                            </>
                          )}
                        </ResponsiveLineStackLayout>
                      </ResponsiveLineStackLayout>
                    </div>
                    <Carousel
                      title={<Trans>Start from an example</Trans>}
                      items={examples ? prepareExamples(examples) : null}
                      displayItemTitles
                      onBrowseAllClick={onOpenExamples}
                      browseAllLabel={<Trans>More examples</Trans>}
                      error={
                        exampleLoadingError && (
                          <>
                            <Trans>
                              An error ocurred while loading examples.
                            </Trans>{' '}
                            <Trans>
                              Please check your internet connection or try again
                              later.
                            </Trans>
                          </>
                        )
                      }
                    />
                    <LargeSpacer />
                    <Carousel
                      title={<Trans>Learn game making</Trans>}
                      items={tutorials ? prepareTutorials(tutorials) : null}
                      displayItemTitles={false}
                      onBrowseAllClick={onOpenTutorials}
                      browseAllLabel={<Trans>All tutorials</Trans>}
                      error={
                        tutorialLoadingError && (
                          <>
                            <Trans>
                              An error ocurred while loading tutorials.
                            </Trans>{' '}
                            <Trans>
                              Please check your internet connection or try again
                              later.
                            </Trans>
                          </>
                        )
                      }
                    />
                    <LargeSpacer />
                    <Carousel
                      title={<Trans>Games made by the community</Trans>}
                      items={
                        showcasedGames
                          ? prepareShowcasedGames(showcasedGames)
                          : null
                      }
                      displayItemTitles
                      additionalAction={
                        <RaisedButton
                          label={<Trans>Play on Liluo.io</Trans>}
                          onClick={() =>
                            Window.openExternalURL('https://liluo.io')
                          }
                        />
                      }
                      onBrowseAllClick={onOpenGamesShowcase}
                      browseAllLabel={<Trans>Browse all</Trans>}
                      error={
                        showcaseLoadingError && (
                          <>
                            <Trans>
                              An error ocurred while loading showcased games.
                            </Trans>{' '}
                            <Trans>
                              Please check your internet connection or try again
                              later.
                            </Trans>
                          </>
                        )
                      }
                    />
                  </div>
                  <Line noMargin>
                    <ResponsiveLineStackLayout
                      alignItems="center"
                      justifyContent="space-between"
                      expand
                    >
                      <ResponsiveLineStackLayout
                        noMargin
                        justifyContent="center"
                      >
                        <FlatButton
                          icon={<ForumIcon />}
                          label={<Trans>Community Forums</Trans>}
                          onClick={() =>
                            Window.openExternalURL(
                              'https://forum.gdevelop.io'
                            )
                          }
                        />
                        <FlatButton
                          icon={<HelpIcon />}
                          label={<Trans>Help and documentation</Trans>}
                          onClick={onOpenHelpFinder}
                        />
                        {!electron && (
                          <RaisedButton
                            label={
                              <Trans>Download the full desktop version</Trans>
                            }
                            onClick={() =>
                              Window.openExternalURL(
                                'https://gdevelop.io/download'
                              )
                            }
                          />
                        )}
                      </ResponsiveLineStackLayout>
                      <Line
                        noMargin
                        alignItems="center"
                        justifyContent="center"
                      >
                        <IconButton
                          className="icon-youtube"
                          onClick={() =>
                            Window.openExternalURL(
                              'https://www.youtube.com/c/GDevelopApp'
                            )
                          }
                          tooltip={t`Tutorials on YouTube`}
                        />
                        <IconButton
                          className="icon-discord"
                          onClick={() =>
                            Window.openExternalURL(
                              'https://discord.gg/gdevelop'
                            )
                          }
                          tooltip={t`GDevelop on Discord`}
                        />
                        <IconButton
                          className="icon-reddit"
                          onClick={() =>
                            Window.openExternalURL(
                              'https://www.reddit.com/r/gdevelop'
                            )
                          }
                          tooltip={t`GDevelop on Reddit`}
                        />
                        <IconButton
                          className="icon-twitter"
                          onClick={() =>
                            Window.openExternalURL(
                              'https://twitter.com/GDevelopApp'
                            )
                          }
                          tooltip={t`GDevelop on Twitter`}
                        />
                        <IconButton
                          className="icon-facebook"
                          onClick={() =>
                            Window.openExternalURL(
                              'https://www.facebook.com/GDevelopApp'
                            )
                          }
                          tooltip={t`GDevelop on Facebook`}
                        />
                        <FlatButton
                          label={i18n.language}
                          onClick={onOpenLanguageDialog}
                          icon={<Language />}
                        />
                      </Line>
                    </ResponsiveLineStackLayout>
                  </Line>
                </div>
              </ScrollBackground>
              {selectedShowcasedGame && (
                <ShowcasedGameDialog
                  open
                  onClose={() => setSelectedShowcasedGame(null)}
                  showcasedGame={selectedShowcasedGame}
                />
              )}
              {selectedExample && (
                <ExampleDialog
                  isOpening={isOpening}
                  onClose={() => setSelectedExample(null)}
                  exampleShortHeader={selectedExample}
                  onOpen={() => {
                    setPreCreationDialogOpen(true);
                  }}
                />
              )}
              {preCreationDialogOpen && (
                <ProjectPreCreationDialog
                  open
                  isOpening={isOpening}
                  onClose={() => setPreCreationDialogOpen(false)}
                  onCreate={options => createProject(i18n, options)}
                />
              )}
            </>
          )}
        </I18n>
      );
    }
  ),
  // Prevent any update to the editor if the editor is not active,
  // and so not visible to the user.
  (prevProps, nextProps) => prevProps.isActive || nextProps.isActive
);

export const renderHomePageContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <HomePage
    ref={props.ref}
    project={props.project}
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
    canOpen={props.canOpen}
    onOpen={props.onOpen}
    onOpenRecentFile={props.onOpenRecentFile}
    onOpenExamples={props.onOpenExamples}
    onCreateFromExampleShortHeader={props.onCreateFromExampleShortHeader}
    onCreateBlank={props.onCreateBlank}
    onOpenProjectAfterCreation={props.onOpenProjectAfterCreation}
    onOpenProjectManager={props.onOpenProjectManager}
    onCloseProject={props.onCloseProject}
    onOpenTutorials={props.onOpenTutorials}
    onOpenGamesShowcase={props.onOpenGamesShowcase}
    onOpenHelpFinder={props.onOpenHelpFinder}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
  />
);

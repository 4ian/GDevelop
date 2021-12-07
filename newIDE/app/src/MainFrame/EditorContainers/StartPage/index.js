// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import Language from '@material-ui/icons/Language';
import ForumIcon from '@material-ui/icons/Forum';
import HelpIcon from '@material-ui/icons/Help';

import FlatButton from '../../../UI/FlatButton';
import IconButton from '../../../UI/IconButton';
import { Line, Spacer } from '../../../UI/Grid';
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
import { ExampleStoreContext } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import UserChip from '../../../UI/User/UserChip';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ExampleDialog } from '../../../AssetStore/ExampleStore/ExampleDialog';
import optionalRequire from '../../../Utils/OptionalRequire';
import { findEmptyPath } from '../../../ProjectCreation/LocalPathFinder';
import LocalProjectPreCreationDialog from '../../../ProjectCreation/LocalProjectPreCreationDialog';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
} from '../../../ProjectCreation/CreateProjectDialog';

const electron = optionalRequire('electron');
const path = optionalRequire('path');
const app = electron ? electron.remote.app : null;

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
  onOpenExamples: () => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenTutorials: () => void,
  onOpenGamesShowcase: () => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenProfile: () => void,

  // Project creation from example
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onOpenFromExampleShortHeader: (
    storageProvider: empty,
    fileMetadata: empty
  ) => Promise<void>,

  // Blank project creation
  onCreateBlank: OnCreateBlankFunction,
  onOpenBlank: (storageProvider: empty, fileMetadata: empty) => Promise<void>,
|};

type StartPageEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
|};

const betweenCarouselSpacerCount = 6;

const renderBetweenCarouselSpace = (offset: number = 0) =>
  Array(betweenCarouselSpacerCount)
    .fill(0)
    .map((e, index) => <Spacer key={`spacer${index + offset}`} />);

export const StartPage = React.memo<Props>(
  React.forwardRef<Props, StartPageEditorInterface>(
    (
      {
        project,
        canOpen,
        onOpen,
        onCreateFromExampleShortHeader,
        onOpenFromExampleShortHeader,
        onCreateBlank,
        onOpenBlank,
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
      const { tutorials, error: tutorialLoadingError } = React.useContext(
        TutorialContext
      );
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
        },
        [fetchExamplesAndFilters, fetchShowcasedGamesAndFilters]
      );

      const computeDefaultProjectPath = (): string =>
        app && path
          ? findEmptyPath(
              path.join(app.getPath('documents'), 'GDevelop projects')
            )
          : '';

      const [outputPath, setOutputPath] = React.useState<string>(
        computeDefaultProjectPath()
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
              thumbnailUrl: example.previewImageUrls[0],
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

      const onOpenProjectJustCreated = (isFromExample: boolean) => (
        ...args
      ) => {
        // Close the dialogs and compute new path after the project is created and before it is opened in the editor
        setPreCreationDialogOpen(false);
        setSelectedExample(null);
        setOutputPath(computeDefaultProjectPath());
        if (isFromExample) onOpenFromExampleShortHeader(...args);
        else onOpenBlank(...args);
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
                        />
                        <ResponsiveLineStackLayout
                          justifyContent="flex-end"
                          noColumnMargin
                        >
                          {!project && (
                            <FlatButton
                              label={<Trans>Create a blank project</Trans>}
                              onClick={() => {
                                electron
                                  ? setPreCreationDialogOpen(true)
                                  : onCreateBlank(
                                      onOpenProjectJustCreated(false)
                                    )(i18n, outputPath);
                              }}
                              primary
                            />
                          )}
                          {!project && canOpen && (
                            <>
                              <Spacer />
                              <RaisedButton
                                label={<Trans>Open a project</Trans>}
                                onClick={onOpen}
                                primary
                              />
                            </>
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
                              />
                            </>
                          )}
                        </ResponsiveLineStackLayout>
                      </ResponsiveLineStackLayout>
                    </div>
                    <Carousel
                      title={<Trans>Start from a template</Trans>}
                      items={examples ? prepareExamples(examples) : null}
                      displayItemTitles
                      onBrowseAllClick={onOpenExamples}
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
                    {renderBetweenCarouselSpace()}
                    <Carousel
                      title={<Trans>Our latest tutorials</Trans>}
                      items={tutorials ? tutorials.slice(0, 16) : null}
                      displayItemTitles={false}
                      onBrowseAllClick={onOpenTutorials}
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
                    {renderBetweenCarouselSpace(betweenCarouselSpacerCount)}
                    <Carousel
                      title={<Trans>Games Showcase</Trans>}
                      items={
                        showcasedGames
                          ? prepareShowcasedGames(showcasedGames)
                          : null
                      }
                      displayItemTitles
                      onBrowseAllClick={onOpenGamesShowcase}
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
                              'https://forum.gdevelop-app.com'
                            )
                          }
                        />
                        <FlatButton
                          icon={<HelpIcon />}
                          label={<Trans>Help and documentation</Trans>}
                          onClick={onOpenHelpFinder}
                        />
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
                    electron
                      ? setPreCreationDialogOpen(true)
                      : onCreateFromExampleShortHeader(
                          setIsOpening,
                          onOpenProjectJustCreated(true)
                        )(i18n, selectedExample);
                  }}
                />
              )}
              {preCreationDialogOpen && (
                <LocalProjectPreCreationDialog
                  open
                  onClose={() => setPreCreationDialogOpen(false)}
                  onCreate={() =>
                    selectedExample
                      ? onCreateFromExampleShortHeader(
                          setIsOpening,
                          onOpenProjectJustCreated(true)
                        )(i18n, selectedExample, outputPath)
                      : onCreateBlank(onOpenProjectJustCreated(false))(
                          i18n,
                          outputPath
                        )
                  }
                  outputPath={outputPath}
                  onChangeOutputPath={setOutputPath}
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
  (prevProps, nextProps) => nextProps.isActive
);

export const renderStartPageContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <StartPage
    ref={props.ref}
    project={props.project}
    isActive={props.isActive}
    projectItemName={props.projectItemName}
    setToolbar={props.setToolbar}
    canOpen={props.canOpen}
    onOpen={props.onOpen}
    onOpenExamples={props.onOpenExamples}
    onCreateFromExampleShortHeader={props.onCreateFromExampleShortHeader}
    onCreateBlank={props.onCreateBlank}
    onOpenBlank={props.onOpenBlank}
    onOpenFromExampleShortHeader={props.onOpenFromExampleShortHeader}
    onOpenProjectManager={props.onOpenProjectManager}
    onCloseProject={props.onCloseProject}
    onOpenTutorials={props.onOpenTutorials}
    onOpenGamesShowcase={props.onOpenGamesShowcase}
    onOpenHelpFinder={props.onOpenHelpFinder}
    onOpenLanguageDialog={props.onOpenLanguageDialog}
    onOpenProfile={props.onOpenProfile}
  />
);

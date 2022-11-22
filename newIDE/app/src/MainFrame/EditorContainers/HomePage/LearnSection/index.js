// @flow
import * as React from 'react';
import { type HomeTab } from '../HomePageMenu';
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import MainPage from './MainPage';
import TutorialsCategoryPage from './TutorialsCategoryPage';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { sendTutorialOpened } from '../../../../Utils/Analytics/EventSender';
import Window from '../../../../Utils/Window';
import { secondsToMinutesAndSeconds } from '../../../../Utils/DateDisplay';
import { type ImageTileComponent } from '../../../../UI/ImageTileGrid';
import Paper from '../../../../UI/Paper';

export const TUTORIAL_CATEGORY_TEXTS = {
  'full-game': {
    title: <Trans>Entire games</Trans>,
    description: <Trans>Make complete games step by step</Trans>,
  },
  'game-mechanic': {
    title: <Trans>Specific game mechanics</Trans>,
    description: (
      <Trans>
        Find how to implement the most common game mechanics and more
      </Trans>
    ),
  },
  'official-beginner': {
    title: <Trans>Beginner course</Trans>,
    description: <Trans>Learn the fundamental principles of GDevelop</Trans>,
  },
  'official-intermediate': {
    title: <Trans>Intermediate course</Trans>,
    description: (
      <Trans>Learn all the game-building mechanics of GDevelop</Trans>
    ),
  },
  'official-advanced': {
    title: <Trans>Advanced course</Trans>,
    description: <Trans>The icing on the cake</Trans>,
  },
};

export const formatTutorialToImageTileComponent = (
  tutorial: Tutorial
): ImageTileComponent => ({
  title: tutorial.title,
  description: tutorial.description,
  onClick: () => {
    sendTutorialOpened(tutorial.id);
    Window.openExternalURL(tutorial.link);
  },
  imageUrl: tutorial.thumbnailUrl,
  overlayText: tutorial.duration ? (
    secondsToMinutesAndSeconds(tutorial.duration)
  ) : (
    <Trans>Text</Trans>
  ),
});

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
  },
};

type Props = {|
  onCreateProject: (?ExampleShortHeader) => void,
  onTabChange: (tab: HomeTab) => void,
  onOpenHelpFinder: () => void,
|};

const LearnSection = ({
  onCreateProject,
  onTabChange,
  onOpenHelpFinder,
}: Props) => {
  const {
    tutorials,
    fetchTutorials,
    error: tutorialLoadingError,
  } = React.useContext(TutorialContext);

  React.useEffect(
    () => {
      fetchTutorials();
    },
    [fetchTutorials]
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = React.useState<?TutorialCategory>(null);

  if (tutorialLoadingError)
    return (
      <Paper square style={styles.paper} background="dark">
        <PlaceholderError onRetry={fetchTutorials}>
          <Trans>
            Can't load the tutorials. Verify your internet connection or retry
            later.
          </Trans>
        </PlaceholderError>
      </Paper>
    );

  if (!tutorials) return <PlaceholderLoader />;

  return !selectedCategory ? (
    <MainPage
      onCreateProject={onCreateProject}
      onOpenHelpFinder={onOpenHelpFinder}
      onStartTutorial={() => onTabChange('get-started')}
      onTabChange={onTabChange}
      onSelectCategory={setSelectedCategory}
      tutorials={tutorials}
    />
  ) : (
    <TutorialsCategoryPage
      onBack={() => setSelectedCategory(null)}
      category={selectedCategory}
      tutorials={tutorials}
    />
  );
};

export default LearnSection;

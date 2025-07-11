// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import {
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import ImageTileRow from '../../../../UI/ImageTileRow';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import {
  formatTutorialToImageTileComponent,
  TUTORIAL_CATEGORY_TEXTS,
  type LearnCategory,
} from './Utils';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import Paper from '../../../../UI/Paper';
import PlaceholderError from '../../../../UI/PlaceholderError';

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
  },
};

type TutorialsRowProps = {|
  limits: ?Limits,
  category: TutorialCategory | 'all-tutorials',
  onSelectCategory: (category: LearnCategory) => void,
  onSelectTutorial: (tutorial: Tutorial) => void,
  getColumnsFromWindowSize: (
    windowSize: WindowSizeType,
    isLandscape: boolean
  ) => number,
|};

export const TutorialsRow = ({
  limits,
  category,
  onSelectCategory,
  onSelectTutorial,
  getColumnsFromWindowSize,
}: TutorialsRowProps) => {
  const {
    tutorials,
    error: tutorialLoadingError,
    fetchTutorials,
  } = React.useContext(TutorialContext);
  const title =
    category === 'all-tutorials' ? (
      <Trans>Public tutorials</Trans>
    ) : (
      TUTORIAL_CATEGORY_TEXTS[category].title
    );
  const description =
    category === 'all-tutorials'
      ? null
      : TUTORIAL_CATEGORY_TEXTS[category].description;

  const getItems = (i18n: I18nType) => {
    if (!tutorials) return [];

    let filteredTutorials = tutorials;
    // If category is all, show 2 of each official category.
    if (category === 'all-tutorials') {
      const officialBeginnerTutorials = tutorials
        .filter(tutorial => tutorial.category === 'official-beginner')
        .slice(0, 2);
      const officialIntermediateTutorials = tutorials
        .filter(tutorial => tutorial.category === 'official-intermediate')
        .slice(0, 2);
      const officialAdvancedTutorials = tutorials
        .filter(tutorial => tutorial.category === 'official-advanced')
        .slice(0, 2);
      filteredTutorials = [
        ...officialBeginnerTutorials,
        ...officialIntermediateTutorials,
        ...officialAdvancedTutorials,
      ];
    } else {
      filteredTutorials = tutorials.filter(
        tutorial => tutorial.category === category
      );
    }
    return filteredTutorials.map(tutorial =>
      formatTutorialToImageTileComponent({
        i18n,
        limits,
        tutorial,
        onSelectTutorial,
      })
    );
  };

  if (tutorialLoadingError) {
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
  }

  return (
    <I18n>
      {({ i18n }) => (
        <ImageTileRow
          title={title}
          description={description}
          items={getItems(i18n)}
          isLoading={!tutorials}
          onShowAll={() => onSelectCategory(category)}
          showAllIcon={<ArrowRight fontSize="small" />}
          getColumnsFromWindowSize={getColumnsFromWindowSize}
          getLimitFromWindowSize={getColumnsFromWindowSize}
        />
      )}
    </I18n>
  );
};

export default TutorialsRow;

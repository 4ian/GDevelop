// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import {
  canAccessTutorial,
  type TutorialCategory,
  type Tutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { type ImageTileComponent } from '../../../../UI/ImageTileGrid';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { sendTutorialOpened } from '../../../../Utils/Analytics/EventSender';
import Window from '../../../../Utils/Window';
import { formatDuration } from '../../../../Utils/Duration';

export type LearnCategory =
  | TutorialCategory
  | null
  | 'all-tutorials'
  | 'all-courses'
  | 'in-app-tutorials';

export const TUTORIAL_CATEGORY_TEXTS = {
  'full-game': {
    title: <Trans>Make an entire game</Trans>,
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
  'education-curriculum': {
    title: <Trans>Education curriculum and resources</Trans>,
    description: (
      <Trans>
        For teachers and educators having the GDevelop Education subscription.
        Ready to use resources for teaching.
      </Trans>
    ),
  },
  course: {
    title: <Trans>Loading</Trans>,
    description: <Trans>Loading course...</Trans>,
  },
  recommendations: {
    title: <Trans>Recommendations</Trans>,
    description: null,
  },
};

export const getColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

export const getChipColorFromTutorialCategory = (
  category: TutorialCategory
): string | null => {
  if (category === 'official-beginner') return '#3BF7F4';
  if (category === 'official-intermediate') return '#FFBC57';
  if (category === 'official-advanced') return '#FF8569';
  if (category === 'full-game') return '#FFBC57';
  if (category === 'game-mechanic') return '#FFBC57';
  return null;
};

export const getChipTextFromTutorialCategory = (
  category: TutorialCategory,
  i18n: I18nType
) => {
  if (category === 'official-beginner') return i18n._(t`Beginner`);
  if (category === 'official-intermediate') return i18n._(t`Intermediate`);
  if (category === 'official-advanced') return i18n._(t`Advanced`);
  if (category === 'full-game') return i18n._(t`Intermediate`);
  if (category === 'game-mechanic') return i18n._(t`Intermediate`);

  return null;
};

type FormatTutorialToImageTileComponentProps = {|
  i18n: I18nType,
  limits: ?Limits,
  tutorial: Tutorial,
  onSelectTutorial: (tutorial: Tutorial) => void,
|};

export const formatTutorialToImageTileComponent = ({
  i18n,
  tutorial,
  limits,
  onSelectTutorial,
}: FormatTutorialToImageTileComponentProps): ImageTileComponent => {
  const isLocked = !canAccessTutorial(
    tutorial,
    limits ? limits.capabilities : null
  );
  return {
    title:
      selectMessageByLocale(i18n, tutorial.titleByLocale) || tutorial.title,
    description:
      selectMessageByLocale(i18n, tutorial.descriptionByLocale) ||
      tutorial.description,
    isLocked,
    onClick: () => {
      if (tutorial.isPrivateTutorial) {
        onSelectTutorial(tutorial);
        return;
      }

      sendTutorialOpened(tutorial.id);
      Window.openExternalURL(
        selectMessageByLocale(i18n, tutorial.linkByLocale)
      );
    },
    imageUrl: selectMessageByLocale(i18n, tutorial.thumbnailUrlByLocale),
    overlayText: tutorial.duration
      ? formatDuration(tutorial.duration)
      : '\u{1F4D8}',
    overlayTextPosition: 'bottomRight',
    chipText: getChipTextFromTutorialCategory(tutorial.category, i18n),
    chipColor: getChipColorFromTutorialCategory(tutorial.category),
  };
};

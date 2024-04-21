// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  type Tutorial,
  type TutorialCategory,
} from '../../../../Utils/GDevelopServices/Tutorial';
import { formatTutorialToImageTileComponent, TUTORIAL_CATEGORY_TEXTS } from '.';
import ImageTileGrid from '../../../../UI/ImageTileGrid';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';

const getColumnsFromWindowSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

type Props = {|
  onBack: () => void,
  tutorials: Array<Tutorial>,
  category: TutorialCategory,
|};

const TutorialsCategoryPage = ({ category, tutorials, onBack }: Props) => {
  const texts = TUTORIAL_CATEGORY_TEXTS[category];
  const filteredTutorials = tutorials.filter(
    tutorial => tutorial.category === category
  );
  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          title={texts.title}
          subtitleText={texts.description}
          backAction={onBack}
        >
          <SectionRow>
            <ImageTileGrid
              items={filteredTutorials.map(tutorial =>
                formatTutorialToImageTileComponent(i18n, tutorial)
              )}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

export default TutorialsCategoryPage;

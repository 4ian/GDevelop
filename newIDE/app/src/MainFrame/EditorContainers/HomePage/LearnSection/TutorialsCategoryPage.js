// @flow
import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  type Tutorial,
  type TutorialCategory,
} from '../../../../Utils/GDevelopServices/Tutorial';
import TutorialsGrid from './TutorialsGrid';
import { TUTORIAL_CATEGORY_TEXTS } from '.';

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
    <SectionContainer
      title={texts.title}
      subtitle={texts.description}
      backAction={onBack}
    >
      <SectionRow>
        <TutorialsGrid tutorials={filteredTutorials} />
      </SectionRow>
    </SectionContainer>
  );
};

export default TutorialsCategoryPage;

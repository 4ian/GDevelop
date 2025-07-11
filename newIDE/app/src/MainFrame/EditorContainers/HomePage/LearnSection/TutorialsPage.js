// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { type Tutorial } from '../../../../Utils/GDevelopServices/Tutorial';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import TutorialsRow from './TutorialsRow';
import { getColumnsFromWindowSize, type LearnCategory } from './Utils';

type Props = {|
  onSelectCategory: (category: LearnCategory) => void,
|};

const TutorialsPage = ({ onSelectCategory }: Props) => {
  const { limits } = React.useContext(AuthenticatedUserContext);
  const [
    selectedTutorial,
    setSelectedTutorial,
  ] = React.useState<Tutorial | null>(null);

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer backAction={() => onSelectCategory(null)}>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="official-beginner"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="official-intermediate"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="official-advanced"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="education-curriculum"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="full-game"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          <SectionRow>
            <TutorialsRow
              limits={limits}
              category="game-mechanic"
              onSelectCategory={onSelectCategory}
              onSelectTutorial={setSelectedTutorial}
              getColumnsFromWindowSize={getColumnsFromWindowSize}
            />
          </SectionRow>
          {selectedTutorial && (
            <PrivateTutorialViewDialog
              tutorial={selectedTutorial}
              onClose={() => setSelectedTutorial(null)}
            />
          )}
        </SectionContainer>
      )}
    </I18n>
  );
};

export default TutorialsPage;

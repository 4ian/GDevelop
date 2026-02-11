// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import SectionContainer, { SectionRow } from '../SectionContainer';
import {
  type Tutorial,
  type TutorialCategory,
} from '../../../../Utils/GDevelopServices/Tutorial';
import {
  formatTutorialToImageTileComponent,
  TUTORIAL_CATEGORY_TEXTS,
} from './Utils';
import ImageTileGrid from '../../../../UI/ImageTileGrid';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { PrivateTutorialViewDialog } from '../../../../AssetStore/PrivateTutorials/PrivateTutorialViewDialog';
import EducationCurriculumLesson from './EducationCurriculumLesson';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import Text from '../../../../UI/Text';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import { type CourseListingData } from '../../../../Utils/GDevelopServices/Shop';

const styles = {
  educationCurriculumTutorialContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  sectionTitleContainer: { marginBottom: -10 },
};

type EducationCurriculumProps = {|
  i18n: I18nType,
  limits: ?Limits,
  tutorials: Tutorial[],
  onSelectTutorial: Tutorial => void,
  onSelectCourse: (courseId: string) => void,
  onOpenTemplateFromTutorial: string => Promise<void>,
  isLocked?: boolean,
  onClickSubscribe?: () => void,
  renderInterstitialCallout?: (key: string) => React.Node,
|};

export const EducationCurriculum = ({
  i18n,
  limits,
  tutorials,
  onSelectTutorial,
  onSelectCourse,
  onOpenTemplateFromTutorial,
  isLocked,
  onClickSubscribe,
  renderInterstitialCallout,
}: EducationCurriculumProps) => {
  const listItems: React.Node[] = React.useMemo(
    () => {
      const items = [];
      let currentSection = null;
      let sectionIndex = 0;

      tutorials.forEach(tutorial => {
        if (!tutorial.sectionByLocale) return;
        const section = selectMessageByLocale(i18n, tutorial.sectionByLocale);
        if (section !== currentSection) {
          if (sectionIndex !== 0 && renderInterstitialCallout) {
            items.push(
              renderInterstitialCallout(`interstitial-${sectionIndex}`)
            );
          }
          items.push(
            <div
              style={styles.sectionTitleContainer}
              key={`section-${section}`}
            >
              <Text size="section-title" noMargin>
                {section}
              </Text>
            </div>
          );
          sectionIndex = 0;
          currentSection = section;
        }
        items.push(
          <EducationCurriculumLesson
            key={tutorial.id}
            i18n={i18n}
            limits={limits}
            tutorial={tutorial}
            isLocked={isLocked}
            onClickSubscribe={onClickSubscribe}
            onSelectTutorial={onSelectTutorial}
            onSelectCourse={onSelectCourse}
            index={sectionIndex}
            onOpenTemplateFromTutorial={
              tutorial.templateUrl
                ? () => {
                    onOpenTemplateFromTutorial(tutorial.id);
                  }
                : null
            }
          />
        );
        sectionIndex += 1;
      });
      return items;
    },
    [
      tutorials,
      i18n,
      limits,
      onSelectTutorial,
      onSelectCourse,
      onOpenTemplateFromTutorial,
      renderInterstitialCallout,
      isLocked,
      onClickSubscribe,
    ]
  );

  return (
    <div style={styles.educationCurriculumTutorialContainer}>{listItems}</div>
  );
};

const getColumnsFromWindowSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
    case 'small':
      return 2;
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

type Props = {|
  onBack: () => void,
  category: TutorialCategory,
  onOpenTemplateFromTutorial: string => Promise<void>,
  onSelectCourse: (courseListingData: CourseListingData) => void,
|};

const TutorialsCategoryPage = ({
  category,
  onBack,
  onOpenTemplateFromTutorial,
  onSelectCourse,
}: Props) => {
  const { listedCourses } = React.useContext(CourseStoreContext);
  const { limits } = React.useContext(AuthenticatedUserContext);
  const { tutorials } = React.useContext(TutorialContext);
  const texts = TUTORIAL_CATEGORY_TEXTS[category];
  const filteredTutorials = tutorials
    ? tutorials.filter(tutorial => tutorial.category === category)
    : null;

  const [
    selectedTutorial,
    setSelectedTutorial,
  ] = React.useState<Tutorial | null>(null);

  if (!filteredTutorials) {
    return (
      <SectionContainer flexBody>
        <SectionRow expand>
          <PlaceholderLoader />
        </SectionRow>
      </SectionContainer>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          title={texts.title}
          subtitleText={texts.description}
          backAction={onBack}
        >
          <SectionRow>
            {category === 'education-curriculum' ? (
              <EducationCurriculum
                tutorials={filteredTutorials}
                onSelectTutorial={setSelectedTutorial}
                onSelectCourse={courseId => {
                  if (!listedCourses) return;
                  const courseListingData = listedCourses.find(
                    course => course.id === courseId
                  );
                  if (!courseListingData) return;
                  onSelectCourse(courseListingData);
                }}
                i18n={i18n}
                limits={limits}
                onOpenTemplateFromTutorial={onOpenTemplateFromTutorial}
              />
            ) : (
              <ImageTileGrid
                items={filteredTutorials.map(tutorial =>
                  formatTutorialToImageTileComponent({
                    i18n,
                    limits,
                    tutorial,
                    onSelectTutorial: setSelectedTutorial,
                  })
                )}
                getColumnsFromWindowSize={getColumnsFromWindowSize}
              />
            )}
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

export default TutorialsCategoryPage;

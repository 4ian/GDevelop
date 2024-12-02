// @flow

import * as React from 'react';
import { type GuidedCourseChapter } from '../../../../Utils/GDevelopServices/Asset';
import SectionContainer from '../SectionContainer';
import { Trans } from '@lingui/macro';
import GuidedCourseChapterView from '../../../../GuidedCourse/GuidedCourseChapterView';

type Props = {|
  courseChapters: GuidedCourseChapter[],
  onBack: () => void,
|};

const CourseSection = ({ courseChapters, onBack }: Props) => {
  return (
    <SectionContainer
      applyTopSpacingAsMarginOnChildrenContainer
      backAction={onBack}
      title={<Trans>GDevelop design basics</Trans>}
      subtitleText={
        <Trans>
          This is a beginner-friendly course designed to introduce you to the
          fundamentals of game development using GDevelop. By the end of the
          course, you’ll have the confidence and technical skills to start
          building your own games.
        </Trans>
      }
    >
      {courseChapters.map(chapter => (
        <GuidedCourseChapterView
          guidedCourseChapter={chapter}
          onOpenTemplate={() => {}}
          key={chapter.title}
        />
      ))}
    </SectionContainer>
  );
};

export default CourseSection;

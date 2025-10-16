// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import TextBasedCourseChapterView from '../../../Course/TextBasedCourseChapterView';

import paperDecorator from '../../PaperDecorator';
import {
  premiumCourse,
  textBasedCourseChapter,
  textBasedCourseChapterWithCode,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Course/TextBasedCourseChapterView',
  component: TextBasedCourseChapterView,
  decorators: [paperDecorator],
};

export const Chapter1 = () => {
  return (
    <TextBasedCourseChapterView
      course={premiumCourse}
      courseChapter={textBasedCourseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onClickUnlock={() => action('onClickUnlock')()}
    />
  );
};

export const Chapter2 = () => {
  return (
    <TextBasedCourseChapterView
      course={premiumCourse}
      courseChapter={textBasedCourseChapterWithCode}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={1}
      onClickUnlock={() => action('onClickUnlock')()}
    />
  );
};

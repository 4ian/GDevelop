// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import VideoBasedCourseChapterView from '../../../Course/VideoBasedCourseChapterView';

import paperDecorator from '../../PaperDecorator';
import { courseChapter, lockedCourseChapter } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Course/VideoBasedCourseChapterView',
  component: VideoBasedCourseChapterView,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <VideoBasedCourseChapterView
      courseChapter={courseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};

export const Locked = () => {
  return (
    <VideoBasedCourseChapterView
      courseChapter={lockedCourseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};

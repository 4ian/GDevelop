// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import VideoBasedCourseChapterView from '../../../Course/VideoBasedCourseChapterView';

import paperDecorator from '../../PaperDecorator';
import {
  videoBasedCourseChapter,
  lockedCourseChapter,
  premiumCourse,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Course/VideoBasedCourseChapterView',
  component: VideoBasedCourseChapterView,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <VideoBasedCourseChapterView
      course={premiumCourse}
      courseChapter={videoBasedCourseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onClickUnlock={() => action('onClickUnlock')()}
    />
  );
};

export const Locked = () => {
  return (
    <VideoBasedCourseChapterView
      course={premiumCourse}
      courseChapter={lockedCourseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onClickUnlock={() => action('onClickUnlock')()}
    />
  );
};

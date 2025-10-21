// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import LockedCourseChapterPreview from '../../../Course/LockedCourseChapterPreview';

import paperDecorator from '../../PaperDecorator';
import {
  lockedCourseChapter,
  premiumCourse,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Course/LockedCourseChapterPreview',
  component: LockedCourseChapterPreview,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <LockedCourseChapterPreview
      course={premiumCourse}
      courseChapter={lockedCourseChapter}
      onClickUnlock={() => action('onClickUnlock')()}
    />
  );
};

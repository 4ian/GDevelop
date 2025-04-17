// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import LockedCourseChapterPreview from '../../../Course/LockedCourseChapterPreview';

import paperDecorator from '../../PaperDecorator';
import { lockedCourseChapter } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Course/LockedCourseChapterPreview',
  component: LockedCourseChapterPreview,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <LockedCourseChapterPreview
      courseChapter={lockedCourseChapter}
      onBuyWithCredits={async () => {
        action('onBuyWithCredits')();
        throw new Error('Error buying product with credits.');
      }}
    />
  );
};

// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import CoursePreviewBanner from '../../../Course/CoursePreviewBanner';

import paperDecorator from '../../PaperDecorator';
import {
  premiumCourse,
  videoBasedCourseChapter,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeAchievements } from '../../../fixtures/GDevelopServicesTestData/FakeAchievements';

export default {
  title: 'Course/CoursePreviewBanner',
  component: CoursePreviewBanner,
  decorators: [paperDecorator],
};

export const CompletedCourse = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={{
        ...fakeSilverAuthenticatedUser,
        badges: [
          {
            seen: true,
            unlockedAt: '2024-11-12',
            userId: 'userId',
            achievementId: 'course-premium-course',
          },
        ],
        achievements: fakeAchievements,
      }}
    >
      <CoursePreviewBanner
        course={premiumCourse}
        courseChapters={[videoBasedCourseChapter]}
        getCourseCompletion={() => ({
          percentage: 1,
          completedChapters: 1,
          chapters: 1,
        })}
        getCourseChapterCompletion={() => ({ completedTasks: 1, tasks: 1 })}
        onDisplayCourse={action('onDisplayCourse')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

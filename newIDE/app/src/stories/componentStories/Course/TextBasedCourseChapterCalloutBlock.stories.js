// @flow
import * as React from 'react';
import TextBasedCourseChapterCallout from '../../../Course/TextBasedCourseChapterCalloutBlock';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Course/TextBasedCourseChapterCallout',
  component: TextBasedCourseChapterCallout,
  decorators: [paperDecorator],
};

export const Info = () => (
  <TextBasedCourseChapterCallout
    calloutType="info"
    title="Information"
    text={
      'Test 2: Ceci est un encadré **informatif**. Il utilise les couleurs `blue` par défaut. Il est parfait pour fournir des détails supplémentaires ou des précisions techniques. Les blocs de `code` sont également bien formatés.'
    }
  />
);

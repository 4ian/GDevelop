// @flow
import * as React from 'react';
import TextBasedCourseChapterCalloutBlock from '../../../Course/TextBasedCourseChapterCalloutBlock';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Course/TextBasedCourseChapterCalloutBlock',
  component: TextBasedCourseChapterCalloutBlock,
  decorators: [paperDecorator],
};

export const Info = () => (
  <TextBasedCourseChapterCalloutBlock
    kind="info"
    text={`**Notice**

You might have seen the \`break\` keyword. Its job is simple: it stops the switch from running any more code. When JavaScript hits a \`break\`, it leaves the switch block immediately, so nothing after that case will run. One nice thing to know: for the last case that is often the default case, you don't need a \`break\`, the switch ends automatically there.`}
  />
);

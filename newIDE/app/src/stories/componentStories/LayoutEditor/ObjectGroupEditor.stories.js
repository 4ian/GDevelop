// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import ObjectGroupEditor from '../../../ObjectGroupEditor';

export default {
  title: 'LayoutEditor/ObjectGroupEditor',
  component: ObjectGroupEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ObjectGroupEditor
    project={testProject.project}
    globalObjectsContainer={testProject.project}
    objectsContainer={testProject.testLayout}
    group={testProject.group2}
  />
);

export const WithLongObjectNames = () => (
  <ObjectGroupEditor
    project={testProject.project}
    globalObjectsContainer={testProject.project}
    objectsContainer={testProject.testLayout}
    group={testProject.group4WithLongsNames}
  />
);

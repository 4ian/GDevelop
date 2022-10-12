// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ShapePainterEditor from '../../../ObjectEditor/Editors/ShapePainterEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export default {
  title: 'ObjectEditor/ShapePainterEditor',
  component: ShapePainterEditor,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.shapePainterObjectConfiguration}>
    <ShapePainterEditor
      objectConfiguration={testProject.shapePainterObjectConfiguration}
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={source => action('Choose resource from source', source)}
      resourceExternalEditors={fakeResourceExternalEditors}
      onSizeUpdated={() => {}}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);

// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../PaperDecorator';
import BehaviorTypeSelector from '../../BehaviorTypeSelector';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'BehaviorTypeSelector',
  decorators: [paperDecorator],
};

export const DefaultForABaseObject = (): React.Node => (
  <BehaviorTypeSelector
    project={testProject.project}
    eventsFunctionsExtension={null}
    value={''}
    onChange={action('change')}
    objectType=""
  />
);
DefaultForABaseObject.storyName = 'default, for a base object';

export const WithANonExistingBehaviorSelectedForABaseObject = (): React.Node => (
  <BehaviorTypeSelector
    project={testProject.project}
    eventsFunctionsExtension={null}
    value={'MyCustomExtension::BehaviorThatIsNotYetLoaded'}
    onChange={action('change')}
    objectType=""
  />
);
WithANonExistingBehaviorSelectedForABaseObject.storyName =
  'with a non existing behavior selected, for a base object';

export const DefaultForATextObject = (): React.Node => (
  <BehaviorTypeSelector
    project={testProject.project}
    eventsFunctionsExtension={null}
    value={''}
    onChange={action('change')}
    objectType="TextObject::Text"
  />
);
DefaultForATextObject.storyName = 'default, for a text object';

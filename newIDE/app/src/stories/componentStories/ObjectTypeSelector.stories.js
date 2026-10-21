// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../PaperDecorator';
import ObjectTypeSelector from '../../ObjectTypeSelector';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'ObjectTypeSelector',
  decorators: [paperDecorator],
};

export const DefaultSpriteSelected = (): React.Node => (
  <ObjectTypeSelector
    project={testProject.project}
    eventsFunctionsExtension={null}
    value={'Sprite'}
    onChange={action('change')}
  />
);
DefaultSpriteSelected.storyName = 'default (Sprite selected)';

export const CustomLabelSpriteSelected = (): React.Node => (
  <ObjectTypeSelector
    project={testProject.project}
    eventsFunctionsExtension={null}
    value={'Sprite'}
    floatingLabelText="Choose the object type to use"
    onChange={action('change')}
  />
);
CustomLabelSpriteSelected.storyName = 'custom label (Sprite selected)';

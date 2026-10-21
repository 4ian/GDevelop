// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import EmptyMessage from '../../../UI/EmptyMessage';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/EmptyMessage',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <EmptyMessage>
    Hello World, this is an empty message, which is centered.
  </EmptyMessage>
);

export { Default as _______Default };
Default.storyName = 'default';

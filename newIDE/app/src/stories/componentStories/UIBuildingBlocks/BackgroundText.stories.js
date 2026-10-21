// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import BackgroundText from '../../../UI/BackgroundText';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/BackgroundText',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <BackgroundText>Hello World, this is a background text</BackgroundText>
);

export { Default as _________Default };
Default.storyName = 'default';

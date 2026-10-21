// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import Welcome from '../Welcome';
import paperDecorator from '../PaperDecorator';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'Welcome',
  decorators: [paperDecorator],
};

export const ToStorybook = (): React.Node => <Welcome />;
ToStorybook.storyName = 'to Storybook';

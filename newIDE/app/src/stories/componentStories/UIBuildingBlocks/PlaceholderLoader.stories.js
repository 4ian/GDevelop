// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/PlaceholderLoader',
  decorators: [paperDecorator],
};

const Default = (): React.Node => <PlaceholderLoader />;

export { Default as _____Default };
Default.storyName = 'default';

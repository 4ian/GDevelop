// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import HelpButton from '../../../UI/HelpButton';
import paperDecorator from '../../PaperDecorator';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/HelpButton',
  decorators: [paperDecorator],
};

const Default = (): React.Node => <HelpButton helpPagePath="/test" />;

export { Default as _____________Default };
Default.storyName = 'default';

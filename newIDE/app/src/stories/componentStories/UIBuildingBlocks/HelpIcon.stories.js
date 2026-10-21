// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import HelpIcon from '../../../UI/HelpIcon';
import paperDecorator from '../../PaperDecorator';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/HelpIcon',
  decorators: [paperDecorator],
};

export const DefaultWikiPath = (): React.Node => (
  <HelpIcon helpPagePath="/test" />
);
DefaultWikiPath.storyName = 'default (wiki path)';

export const AbsoluteUrlCustomHelp = (): React.Node => (
  <HelpIcon helpPagePath="https://example.com/custom-help" />
);
AbsoluteUrlCustomHelp.storyName = 'absolute URL (custom help)';

export const SmallSize = (): React.Node => (
  <HelpIcon helpPagePath="/test" size="small" />
);
SmallSize.storyName = 'small size';

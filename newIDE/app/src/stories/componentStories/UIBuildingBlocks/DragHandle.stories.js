// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import { DragHandleIcon } from '../../../UI/DragHandle';
import paperDecorator from '../../PaperDecorator';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/DragHandle',
  decorators: [paperDecorator],
};

const Default = (): React.Node => <DragHandleIcon />;

export { Default as ______Default };
Default.storyName = 'default';

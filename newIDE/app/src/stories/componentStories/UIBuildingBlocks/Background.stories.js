// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import Background from '../../../UI/Background';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/Background',
};

const Default = (): React.Node => <Background>Hello world</Background>;

export { Default as ___Default };
Default.storyName = 'default';

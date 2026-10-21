// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import DragAndDropTestBed from '../../DragAndDropTestBed';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/DragAndDrop',
};

export const TestBed = (): React.Node => (
  <DragAndDropContextProvider>
    <DragAndDropTestBed />
  </DragAndDropContextProvider>
);
TestBed.storyName = 'test bed';

// @flow
import * as React from 'react';
import paperDecorator from '../PaperDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';

import FullSizeInstancesEditorWithScrollbars from '../../InstancesEditor/FullSizeInstancesEditorWithScrollbars';
import InstancesSelection from '../../InstancesEditor/InstancesSelection';
import { type InstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';

const instancesSelection = new InstancesSelection();
const instancesEditorSettings: InstancesEditorSettings = {
  grid: false,
  gridType: 'isometric',
  gridWidth: 1200,
  gridHeight: 600,
  gridOffsetX: 0,
  gridOffsetY: 0,
  gridColor: 0,
  gridAlpha: 0,
  snap: false,
  zoomFactor: 1,
  windowMask: false,
};

export default {
  title: 'Editor/FullSizeInstancesEditorWithScrollbars',
  component: FullSizeInstancesEditorWithScrollbars,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={600}>
    <DragAndDropContextProvider>
      <FullSizeInstancesEditorWithScrollbars
        project={testProject.project}
        layout={testProject.testLayout}
        selectedLayer={''}
        initialInstances={testProject.testLayout.getInitialInstances()}
        instancesEditorSettings={instancesEditorSettings}
        onInstancesEditorSettingsMutated={() => {}}
        isInstanceOf3DObject={() => false}
        instancesSelection={instancesSelection}
        onInstancesAdded={() => {}}
        onInstancesSelected={() => {}}
        onInstanceDoubleClicked={() => {}}
        onInstancesMoved={() => {}}
        onInstancesResized={() => {}}
        onInstancesRotated={() => {}}
        selectedObjectNames={[]}
        onContextMenu={() => {}}
        instancesEditorShortcutsCallbacks={{
          onCopy: () => {},
          onCut: () => {},
          onPaste: () => {},
          onDuplicate: () => {},
          onDelete: () => {},
          onUndo: () => {},
          onRedo: () => {},
          onZoomOut: () => {},
          onZoomIn: () => {},
          onShift1: () => {},
          onShift2: () => {},
          onShift3: () => {},
        }}
        wrappedEditorRef={() => {}}
        pauseRendering={false}
      />
    </DragAndDropContextProvider>
  </FixedHeightFlexContainer>
);

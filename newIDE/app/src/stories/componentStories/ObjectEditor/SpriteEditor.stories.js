// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import CollisionMasksEditor from '../../../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from '../../../ObjectEditor/Editors/SpriteEditor/PointsEditor';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/SpriteEditor',
  component: SpriteEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <SpriteEditor
        renderObjectNameField={() => null}
        objectConfiguration={testProject.spriteObjectConfiguration}
        project={testProject.project}
        layout={testProject.testLayout}
        resourceManagementProps={fakeResourceManagementProps}
        onSizeUpdated={() => {}}
        object={testProject.spriteObject}
        objectName="FakeObjectName"
      />
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

export const AnimationLocked = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <SpriteEditor
        renderObjectNameField={() => null}
        isAnimationListLocked
        objectConfiguration={testProject.spriteObjectConfiguration}
        project={testProject.project}
        layout={testProject.testLayout}
        resourceManagementProps={fakeResourceManagementProps}
        onSizeUpdated={() => {}}
        object={testProject.spriteObject}
        objectName="FakeObjectName"
      />
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

export const Empty = () => (
  <SerializedObjectDisplay object={testProject.emptySpriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <SpriteEditor
        renderObjectNameField={() => null}
        objectConfiguration={testProject.emptySpriteObjectConfiguration}
        project={testProject.project}
        layout={testProject.testLayout}
        resourceManagementProps={fakeResourceManagementProps}
        onSizeUpdated={() => {}}
        object={testProject.emptySpriteObject}
        objectName="FakeObjectName"
      />
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

export const Points = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={500}>
        <PointsEditor
          animations={testProject.spriteObjectConfiguration.getAnimations()}
          project={testProject.project}
          resourcesLoader={ResourcesLoader}
          onRenamedPoint={action('Renamed a point')}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

export const CollisionMasks = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={500}>
        <CollisionMasksEditor
          animations={testProject.spriteObjectConfiguration.getAnimations()}
          project={testProject.project}
          resourcesLoader={ResourcesLoader}
          onCreateMatchingSpriteCollisionMask={action(
            'Created a matching sprite collision mask'
          )}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

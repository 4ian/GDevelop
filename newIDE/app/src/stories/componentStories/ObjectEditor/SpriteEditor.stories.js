// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import CollisionMasksEditor from '../../../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from '../../../ObjectEditor/Editors/SpriteEditor/PointsEditor';

export default {
  title: 'ObjectEditor/SpriteEditor',
  component: SpriteEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectConfiguration}>
    <DragAndDropContextProvider>
      <SpriteEditor
        objectConfiguration={testProject.spriteObjectConfiguration}
        project={testProject.project}
        layout={testProject.testLayout}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
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
        isAnimationListLocked
        objectConfiguration={testProject.spriteObjectConfiguration}
        project={testProject.project}
        layout={testProject.testLayout}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
        onSizeUpdated={() => {}}
        object={testProject.spriteObject}
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
          objectConfiguration={testProject.spriteObjectConfiguration}
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
          objectConfiguration={testProject.spriteObjectConfiguration}
          project={testProject.project}
          resourcesLoader={ResourcesLoader}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  </SerializedObjectDisplay>
);

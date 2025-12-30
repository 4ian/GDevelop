// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import paperDecorator from '../../PaperDecorator';
import LayersList from '../../../LayersList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'LayoutEditor/LayersList',
  component: LayersList,
  decorators: [paperDecorator],
};

export const Default = () => {
  const [chosenLayer, setChosenLayer] = React.useState<string>('');
  return (
    <DragAndDropContextProvider>
      <div style={{ height: 400 }}>
        <LayersList
          project={testProject.project}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          chosenLayer={chosenLayer}
          onChooseLayer={setChosenLayer}
          onSelectLayer={action('onSelectLayer')}
          onEditLayerEffects={action('onEditLayerEffects')}
          onLayersModified={action('onLayersModified')}
          onLayersVisibilityInEditorChanged={action(
            'onLayersVisibilityInEditorChanged'
          )}
          onEditLayer={action('onEditLayer')}
          onRemoveLayer={(layerName, cb) => {
            cb(true);
          }}
          onLayerRenamed={action('onLayerRenamed')}
          onCreateLayer={action('onCreateLayer')}
          layout={testProject.testLayout}
          layersContainer={testProject.testLayout.getLayers()}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          onBackgroundColorChanged={action('onBackgroundColorChanged')}
          gameEditorMode={'embedded-game'}
        />
      </div>
    </DragAndDropContextProvider>
  );
};

export const SmallWidthAndHeight = () => {
  const [chosenLayer, setChosenLayer] = React.useState<string>('');

  return (
    <DragAndDropContextProvider>
      <div style={{ width: 250, height: 200 }}>
        <LayersList
          project={testProject.project}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          chosenLayer={chosenLayer}
          onChooseLayer={setChosenLayer}
          onSelectLayer={action('onSelectLayer')}
          onEditLayerEffects={action('onEditLayerEffects')}
          onLayersModified={action('onLayersModified')}
          onLayersVisibilityInEditorChanged={action(
            'onLayersVisibilityInEditorChanged'
          )}
          onEditLayer={action('onEditLayer')}
          onRemoveLayer={(layerName, cb) => {
            cb(true);
          }}
          onLayerRenamed={action('onLayerRenamed')}
          onCreateLayer={action('onCreateLayer')}
          layout={testProject.testLayout}
          layersContainer={testProject.testLayout.getLayers()}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          onBackgroundColorChanged={action('onBackgroundColorChanged')}
          gameEditorMode={'embedded-game'}
        />
      </div>
    </DragAndDropContextProvider>
  );
};

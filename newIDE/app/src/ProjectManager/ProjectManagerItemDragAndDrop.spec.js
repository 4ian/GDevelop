// @noflow
import fs from 'fs';
import path from 'path';
import { isCustomObjectDragItem } from './ProjectManagerItemDragAndDrop';

describe('ProjectManagerItemDragAndDrop', () => {
  const customObjectDragItem = {
    kind: 'custom-object',
    name: 'Knight',
    is3D: true,
    extensionName: 'Local',
    eventsBasedObjectName: 'Knight',
    variantName: '',
    sceneObjectName: 'Knight',
  };

  const getEmbeddedGameFrameSource = () =>
    fs
      .readFileSync(
        path.join(__dirname, '..', 'EmbeddedGame', 'EmbeddedGameFrame.js'),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getSceneEditorSource = () =>
    fs
      .readFileSync(
        path.join(__dirname, '..', 'SceneEditor', 'index.js'),
        'utf8'
      )
      .replace(/\r\n/g, '\n');

  test('recognizes prefab drag data', () => {
    expect(isCustomObjectDragItem(customObjectDragItem)).toBe(true);
    expect(
      isCustomObjectDragItem({
        ...customObjectDragItem,
        eventsBasedObjectName: undefined,
      })
    ).toBe(false);
  });

  test('forwards 3D prefab drops from the embedded frame to the scene editor', () => {
    const source = getEmbeddedGameFrameSource();

    expect(source).toContain('projectManagerItemReactDndType,');
    expect(source).toContain('isCustomObjectDragItem(item)');
    expect(source).toContain('onCustomObjectDropped({');
    expect(source).toContain('customObjectDragItem: item,');
    expect(source).toContain('x: clientOffset.x - dropTargetRect.left');
    expect(source).toContain('y: clientOffset.y - dropTargetRect.top');
  });

  test('creates a prefab instance at the embedded 3D drop position', () => {
    const source = getSceneEditorSource();
    const dropHandlerStart = source.indexOf(
      '_onCustomObjectDroppedInEmbeddedGameFrame = async'
    );
    const dropHandlerEnd = source.indexOf(
      '_on3DModelFilesDroppedInEmbeddedGameFrame = async',
      dropHandlerStart
    );
    const dropHandlerSource = source.slice(dropHandlerStart, dropHandlerEnd);

    expect(dropHandlerSource).toContain(
      'await this._getDropPositionInEmbeddedGameFrame'
    );
    expect(dropHandlerSource).toContain(
      'this._getOrCreateObjectFromCustomObjectDragItem'
    );
    expect(dropHandlerSource).toContain('notifyInGameEditor: false');
    expect(dropHandlerSource).toContain(
      'this._addInstancesForObjectsAt3DPosition'
    );
    expect(dropHandlerSource).toContain(
      'this._hotReloadObjectsAndAddInstancesInEditor3D'
    );
    expect(dropHandlerSource).toContain('this._sendAddedInstances(instances)');
    expect(dropHandlerSource).toContain('isNewObjectTypeUsed: true');
  });
});

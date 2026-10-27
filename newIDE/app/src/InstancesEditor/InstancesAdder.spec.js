// @flow
import { addSerializedInstances } from './InstancesAdder';
import { serializeToJSObject } from '../Utils/Serializer';
const gd: libGDevelop = global.gd;

describe('addSerializedInstances', () => {
  it('keeps the layer of pasted instances if it exists, otherwise uses the base layer', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const sourceLayout = project.insertNewLayout('Source', 0);
    sourceLayout.getLayers().insertNewLayer('Foreground', 1);
    sourceLayout.getLayers().insertNewLayer('UI', 2);
    const targetLayout = project.insertNewLayout('Target', 1);
    targetLayout.getLayers().insertNewLayer('UI', 1);

    const serializedInstances = ['UI', 'Foreground', ''].map(layerName => {
      const instance = sourceLayout
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('MyGlobalObject');
      instance.setLayer(layerName);
      return serializeToJSObject(instance);
    });

    const newInstances = addSerializedInstances({
      project,
      instancesContainer: targetLayout.getInitialInstances(),
      copyReferential: [0, 0],
      serializedInstances,
      doesObjectExistInContext: () => true,
      doesLayerExistInContext: layerName =>
        targetLayout.getLayers().hasLayerNamed(layerName),
    });

    expect(newInstances.map(instance => instance.getLayer())).toEqual([
      'UI',
      '',
      '',
    ]);

    project.delete();
  });
});

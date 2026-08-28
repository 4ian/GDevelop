// @flow
import { loadExtension } from '../JsExtensionsLoader';

const gd: libGDevelop = global.gd;

// The extensions are outside of the app folder, so they are not typed.
// $FlowFixMe[cannot-resolve-module]
const physics2Module = require('../../../../Extensions/Physics2Behavior/JsExtension.js');
// $FlowFixMe[cannot-resolve-module]
const physics3DModule = require('../../../../Extensions/Physics3DBehavior/JsExtension.js');

/**
 * The physics shape and collision filtering properties adapt their label and
 * visibility to the other properties (the shape and the body type).
 *
 * Their description must stay valid whatever these are, because the
 * documentation and the reference given to the AI are generated from the
 * behavior metadata, which only knows the default values.
 */
describe('Physics behaviors properties adapting to the shape and body type', () => {
  beforeAll(() => {
    const platform = gd.JsPlatform.get();
    [physics2Module, physics3DModule].forEach(jsExtensionModule => {
      const result = loadExtension(
        translatedText => translatedText,
        gd,
        platform,
        // $FlowFixMe[incompatible-call]
        jsExtensionModule
      );
      if (result.error) throw new Error(JSON.stringify(result));
    });
  });

  const makeBehavior = (behaviorType: string) => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('Scene', 0);
    const object = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Object', 0);
    object.addNewBehavior(project, behaviorType, 'Behavior');
    return { project, behavior: object.getBehavior('Behavior') };
  };

  it('gives a label matching the shape to the Physics3D dimensions', () => {
    const { project, behavior } = makeBehavior('Physics3D::Physics3DBehavior');

    behavior.updateProperty('shape', 'Box');
    let properties = behavior.getProperties();
    expect(properties.get('shapeDimensionA').getLabel()).toBe('Width');
    expect(properties.get('shapeDimensionB').getLabel()).toBe('Height');
    expect(properties.get('shapeDimensionC').isHidden()).toBe(false);

    behavior.updateProperty('shape', 'Sphere');
    properties = behavior.getProperties();
    expect(properties.get('shapeDimensionA').getLabel()).toBe('Radius');
    // A sphere only needs a radius.
    expect(properties.get('shapeDimensionB').isHidden()).toBe(true);
    expect(properties.get('shapeDimensionC').isHidden()).toBe(true);

    behavior.updateProperty('shape', 'Mesh');
    properties = behavior.getProperties();
    // A mesh uses a 3D model instead of dimensions.
    expect(properties.get('shapeDimensionA').isHidden()).toBe(true);
    expect(properties.get('meshShapeResourceName').isHidden()).toBe(false);

    project.delete();
  });

  it('gives the layers of the body type to the Physics3D bitmasks', () => {
    const { project, behavior } = makeBehavior('Physics3D::Physics3DBehavior');

    behavior.updateProperty('bodyType', 'Dynamic');
    let properties = behavior.getProperties();
    // Moving objects use the layers 5 to 8.
    expect(
      properties
        .get('layers')
        .getExtraInfo()
        .toJSArray()
    ).toContain('firstBit=4');
    expect(properties.get('masks').isHidden()).toBe(false);

    behavior.updateProperty('bodyType', 'Static');
    properties = behavior.getProperties();
    // Static objects use the layers 1 to 4 and accept every collision.
    expect(
      properties
        .get('layers')
        .getExtraInfo()
        .toJSArray()
    ).toContain('firstBit=0');
    expect(properties.get('masks').isHidden()).toBe(true);

    project.delete();
  });

  it('gives a label matching the shape to the Physics2 dimensions', () => {
    const { project, behavior } = makeBehavior('Physics2::Physics2Behavior');

    behavior.updateProperty('shape', 'Circle');
    let properties = behavior.getProperties();
    expect(properties.get('shapeDimensionA').getLabel()).toBe('Radius');
    expect(properties.get('shapeDimensionB').isHidden()).toBe(true);

    behavior.updateProperty('shape', 'Edge');
    properties = behavior.getProperties();
    expect(properties.get('shapeDimensionA').getLabel()).toBe('Length');
    expect(properties.get('shapeDimensionB').getLabel()).toBe('Angle');

    behavior.updateProperty('shape', 'Polygon');
    properties = behavior.getProperties();
    // A polygon is defined by its vertices instead of dimensions.
    expect(properties.get('shapeDimensionA').isHidden()).toBe(true);
    expect(properties.get('polygonOrigin').isHidden()).toBe(false);

    project.delete();
  });

  it('describes the properties whatever the shape and body type are', () => {
    // The documentation and the AI reference are generated from the metadata,
    // which uses the default values, so descriptions must not depend on them.
    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      gd.JsPlatform.get(),
      'Physics3D::Physics3DBehavior'
    );
    const properties = behaviorMetadata.getProperties();

    // The dimensions are described for every shape.
    expect(properties.get('shapeDimensionA').getDescription()).toContain(
      'radius'
    );
    // The layers are described for every body type.
    expect(properties.get('layers').getDescription()).toContain('Static');
    expect(properties.get('layers').getDescription()).toContain('moving');

    // The properties hidden with the default shape are still discoverable
    // from the shape description.
    expect(properties.get('meshShapeResourceName').isHidden()).toBe(true);
    expect(properties.get('shape').getDescription()).toContain(
      'Simplified 3D model'
    );
    expect(properties.get('shapeOrientation').isHidden()).toBe(true);
    expect(properties.get('shape').getDescription()).toContain(
      'Shape orientation'
    );
  });
});

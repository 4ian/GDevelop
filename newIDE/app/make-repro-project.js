const fs = require('fs');
const path = require('path');
const initializeGDevelopJs = require('libGD.js-for-tests-only');

const outFolder = process.argv[2];

initializeGDevelopJs().then(gd => {
  // Load the real Scene3D extension so Model3DObject exists.
  const { loadExtension } = require('./src/JsExtensionsLoader');
  const result = loadExtension(
    s => s,
    gd,
    gd.JsPlatform.get(),
    require('../../Extensions/3D/JsExtension.js')
  );
  if (result.error) throw new Error('Extension load failed: ' + result.message);

  const project = gd.ProjectHelper.createNewGDJSProject();
  project.setName('Model3DReplaceRepro');
  project.setGameResolutionSize(800, 600);

  // The model3D resource. Its file is swapped on disk during the test.
  const resource = new gd.Model3DResource();
  resource.setName('house.glb');
  resource.setFile('house.glb');
  project.getResourcesManager().addResource(resource);
  resource.delete();

  const layout = project.insertNewLayout('Scene', 0);
  layout.setBackgroundColor(200, 200, 220);
  const baseLayer = layout.getLayer('');
  baseLayer.setRenderingType('2d+3d');
  baseLayer.setCameraType('perspective');

  const object = layout
    .getObjects()
    .insertNewObject(project, 'Scene3D::Model3DObject', 'MyModel', 0);
  const configuration = object.getConfiguration();
  configuration.updateProperty('modelResourceName', 'house.glb');
  // "No lighting effect", so no light is needed to see the model.
  configuration.updateProperty('materialType', 'Basic');
  // Makes the default size depend on the model's bounding box, so a stale
  // model shows up as a wrong width/height/depth in the properties panel.
  configuration.updateProperty('keepAspectRatio', '1');
  configuration.updateProperty('width', '200');
  configuration.updateProperty('height', '200');
  configuration.updateProperty('depth', '200');
  configuration.updateProperty('rotationX', '0');
  configuration.updateProperty('rotationY', '0');
  configuration.updateProperty('rotationZ', '0');
  configuration.updateProperty('originLocation', 'ModelOrigin');
  configuration.updateProperty('centerLocation', 'ObjectCenter');

  const instances = layout.getInitialInstances();
  const instance = instances.insertNewInitialInstance();
  instance.setObjectName('MyModel');
  instance.setX(400);
  instance.setY(300);
  instance.setZ(0);
  // Deliberately NOT calling setHasCustomSize: the instance uses the
  // renderer's default size, like a freshly placed instance does.

  const serializedProject = new gd.SerializerElement();
  project.serializeTo(serializedProject);
  const json = gd.Serializer.toJSON(serializedProject);
  serializedProject.delete();

  fs.mkdirSync(outFolder, { recursive: true });
  fs.writeFileSync(path.join(outFolder, 'game.json'), json);
  console.log(`Wrote ${path.join(outFolder, 'game.json')}`);
});

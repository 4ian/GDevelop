const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const path = require('path');
const {
  makeFakeAbstractFileSystem,
} = require('../TestUtils/FakeAbstractFileSystem');
const extend = require('extend');

const mapFor = /*:: <T> */ (
  start /*: number */,
  end /*: number */,
  func /*: (number) => T */
) /*: Array<T> */ => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
};

describe('libGD.js', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('gd.VersionWrapper', function () {
    it('can return the version number of the library', function () {
      expect(typeof gd.VersionWrapper.major()).toBe('number');
      expect(typeof gd.VersionWrapper.minor()).toBe('number');
      expect(typeof gd.VersionWrapper.build()).toBe('number');
      expect(typeof gd.VersionWrapper.revision()).toBe('number');
      expect(typeof gd.VersionWrapper.fullString()).toBe('string');
    });
  });

  describe('gd.Project', function () {
    let project = null;
    beforeAll(() => (project = gd.ProjectHelper.createNewGDJSProject()));

    it('has properties that can be read and changed', function () {
      project.setName('My super project');
      expect(project.getName()).toBe('My super project');
      project.setDescription("This is a great game I'm really proud of");
      expect(project.getDescription()).toBe(
        "This is a great game I'm really proud of"
      );
      project.setVersion('1.2.34');
      expect(project.getVersion()).toBe('1.2.34');
      project.setPackageName('com.test.package');
      expect(project.getPackageName()).toBe('com.test.package');
      project.setOrientation('portrait');
      expect(project.getOrientation()).toBe('portrait');
      project.setOrientation('landscape');
      expect(project.getOrientation()).toBe('landscape');
      project.setAuthor('Me');
      expect(project.getAuthor()).toBe('Me');
      project.setMaximumFPS(15);
      expect(project.getMaximumFPS()).toBe(15);
      project.setMinimumFPS(15);
      expect(project.getMinimumFPS()).toBe(15);
      project.setFolderProject(true);
      expect(project.isFolderProject()).toBe(true);
      project.setFolderProject(false);
      expect(project.isFolderProject()).toBe(false);
    });

    it('can store loading screen setup', function () {
      project.getLoadingScreen().showGDevelopLogoDuringLoadingScreen(true);
      expect(
        project.getLoadingScreen().isGDevelopLogoShownDuringLoadingScreen()
      ).toBe(true);
      project.getLoadingScreen().showGDevelopLogoDuringLoadingScreen(false);
      expect(
        project.getLoadingScreen().isGDevelopLogoShownDuringLoadingScreen()
      ).toBe(false);
    });

    it('handles layouts', function () {
      expect(project.hasLayoutNamed('Scene')).toBe(false);

      project.insertNewLayout('Scene', 0);
      expect(project.hasLayoutNamed('Scene')).toBe(true);
      expect(project.getLayout('Scene').getName()).toBe('Scene');

      project.removeLayout('Scene');
      expect(project.hasLayoutNamed('Scene')).toBe(false);
    });

    it('handles external events', function () {
      expect(project.hasExternalEventsNamed('My events')).toBe(false);

      project.insertNewExternalEvents('My events', 0);
      expect(project.hasExternalEventsNamed('My events')).toBe(true);
      expect(project.getExternalEvents('My events').getName()).toBe(
        'My events'
      );

      project.removeExternalEvents('My events');
      expect(project.hasExternalEventsNamed('My events')).toBe(false);
    });

    it('handles external layouts', function () {
      expect(project.hasExternalLayoutNamed('My layout')).toBe(false);

      project.insertNewExternalLayout('My layout', 0);
      expect(project.hasExternalLayoutNamed('My layout')).toBe(true);
      expect(project.getExternalLayout('My layout').getName()).toBe(
        'My layout'
      );

      project.removeExternalLayout('My layout');
      expect(project.hasExternalLayoutNamed('My layout')).toBe(false);
    });

    it('should validate object names', function () {
      expect(gd.Project.isNameSafe('ThisNameIs_Ok_123')).toBe(true);
      expect(gd.Project.isNameSafe('ThisNameIs_👍_123')).toBe(true);
      expect(gd.Project.isNameSafe('ThisName IsNot_Ok_123')).toBe(false);
      expect(gd.Project.isNameSafe('ThisName()IsNot_Ok_123')).toBe(false);
      expect(gd.Project.isNameSafe('ThisNameIsNot_Ok!')).toBe(false);
      expect(gd.Project.isNameSafe('1ThisNameIsNot_Ok_123')).toBe(false);
      expect(gd.Project.getSafeName('ThisNameIs_Ok_123')).toBe(
        'ThisNameIs_Ok_123'
      );
      expect(gd.Project.getSafeName('ThisNameIs_👍_123')).toBe(
        'ThisNameIs_👍_123'
      );
      expect(gd.Project.getSafeName('ThisName IsNot_Ok_123')).toBe(
        'ThisName_IsNot_Ok_123'
      );
      expect(gd.Project.getSafeName('ThisName()IsNot_Ok_123')).toBe(
        'ThisName__IsNot_Ok_123'
      );
      expect(gd.Project.getSafeName('ThisNameIsNot_Ok!')).toBe(
        'ThisNameIsNot_Ok_'
      );
      expect(gd.Project.getSafeName('1ThisNameIsNot_Ok_123')).toBe(
        '_1ThisNameIsNot_Ok_123'
      );
      expect(gd.Project.getSafeName('官话 name')).toBe('官话_name');
      expect(gd.Project.getSafeName('')).toBe('Unnamed');
      expect(gd.Project.getSafeName('9')).toBe('_9');
    });

    it('should have a list of extensions', function () {
      expect(
        gd.UsedExtensionsFinder.scanProject(project)
          .getUsedExtensions()
          .toNewVectorString()
          .toJSArray()
      ).toEqual([]);

      project.insertNewObject(project, 'Sprite', 'MyObject', 0);

      expect(
        gd.UsedExtensionsFinder.scanProject(project)
          .getUsedExtensions()
          .toNewVectorString()
          .toJSArray()
      ).toEqual([
        'AnimatableCapability',
        'EffectCapability',
        'FlippableCapability',
        'OpacityCapability',
        'ResizableCapability',
        'ScalableCapability',
        'Sprite',
      ]);
    });

    it('handles events functions extensions', function () {
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(false);

      project.insertNewEventsFunctionsExtension('Ext', 0);
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(true);
      expect(project.getEventsFunctionsExtension('Ext').getName()).toBe('Ext');

      project.removeEventsFunctionsExtension('Ext');
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(false);
    });

    afterAll(function () {
      project.delete();
    });
  });

  describe('gd.Layout', function () {
    let project = null;
    let layout = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
    });

    it('can have a new name', function () {
      expect(layout.getName()).toBe('Scene');
      layout.setName('My super layout');
      expect(layout.getName()).toBe('My super layout');
    });
    it('can have a name with UTF8 characters', function () {
      layout.setName('Scene with a 官话 name');
      expect(layout.getName()).toBe('Scene with a 官话 name');
    });
    it('can store events', function () {
      let evts = layout.getEvents();
      expect(evts.getEventsCount()).toBe(0);
      let evt = evts.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      expect(evts.getEventsCount()).toBe(1);
      evt
        .getSubEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      expect(evts.getEventAt(0).getSubEvents().getEventsCount()).toBe(1);
    });
    it('can have objects', function () {
      let object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      let object2 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject2',
        1
      );

      expect(layout.getObjectAt(0).ptr).toBe(object.ptr);
      expect(layout.getObjectAt(1).ptr).toBe(object2.ptr);
      expect(layout.getObjectAt(0).getType()).toBe('Sprite');
      expect(layout.getObjectAt(1).getType()).toBe('TextObject::Text');
    });

    afterAll(function () {
      project.delete();
    });
  });

  describe('gd.Layer', function () {
    it('can have a name and visibility', function () {
      const layer = new gd.Layer();

      layer.setName('GUI');
      layer.setVisibility(false);
      expect(layer.getName()).toBe('GUI');
      expect(layer.getVisibility()).toBe(false);

      layer.delete();
    });
    it('can have effects', function () {
      const layer = new gd.Layer();

      const effects = layer.getEffects();

      expect(effects.hasEffectNamed('EffectThatDoesNotExist')).toBe(false);
      expect(effects.getEffectsCount()).toBe(0);

      expect(effects.hasEffectNamed('EffectThatDoesNotExist')).toBe(false);
      expect(effects.getEffectsCount()).toBe(0);

      effects.insertNewEffect('MyEffect', 0);
      expect(effects.hasEffectNamed('EffectThatDoesNotExist')).toBe(false);
      expect(effects.hasEffectNamed('MyEffect')).toBe(true);
      expect(effects.getEffectsCount()).toBe(1);
      expect(effects.getEffectPosition('MyEffect')).toBe(0);

      const effect2 = new gd.Effect();
      effect2.setName('MyEffect2');

      effects.insertEffect(effect2, 1);
      expect(effects.hasEffectNamed('MyEffect2')).toBe(true);
      expect(effects.getEffectsCount()).toBe(2);
      expect(effects.getEffectPosition('MyEffect')).toBe(0);

      expect(effects.getEffectPosition('MyEffect2')).toBe(1);

      effects.swapEffects(0, 1);
      expect(effects.getEffectPosition('MyEffect2')).toBe(0);
      expect(effects.getEffectPosition('MyEffect')).toBe(1);

      const effect3 = new gd.Effect();
      effect3.setName('MyEffect3');

      effects.insertEffect(effect3, 2);
      expect(effects.hasEffectNamed('MyEffect3')).toBe(true);
      expect(effects.getEffectsCount()).toBe(3);

      effects.moveEffect(2, 0);

      expect(effects.getEffectPosition('MyEffect3')).toBe(0);
      expect(effects.getEffectPosition('MyEffect2')).toBe(1);
      expect(effects.getEffectPosition('MyEffect')).toBe(2);

      layer.delete();
    });
    it('can be serialized', function () {
      const layer = new gd.Layer();
      const layer2 = new gd.Layer();

      layer.setName('GUI');
      layer.setVisibility(false);
      layer.getEffects().insertNewEffect('MyEffect', 0);
      layer.setCameraCount(1);

      const element = new gd.SerializerElement();
      layer.serializeTo(element);

      for (let i = 0; i < 5; ++i) {
        // Repeat multiple time to check idempotency.
        layer2.unserializeFrom(element);

        expect(layer2.getName()).toBe('GUI');
        expect(layer2.getVisibility()).toBe(false);
        expect(layer2.getEffects().getEffectsCount()).toBe(1);
        expect(layer2.getEffects().getEffectAt(0).getName()).toBe('MyEffect');
        expect(layer2.getCameraCount()).toBe(1);
      }

      layer.delete();
      layer2.delete();
    });
  });

  describe('gd.Effect', function () {
    it('can have a name, effect name and parameters', function () {
      const effect = new gd.Effect();

      effect.setName('MyEffect');
      effect.setEffectType('Sepia');
      expect(effect.getName()).toBe('MyEffect');
      expect(effect.getEffectType()).toBe('Sepia');

      effect.setDoubleParameter('Brightness', 1);
      effect.setDoubleParameter('Darkness', 0.3);
      effect.setDoubleParameter('Param3', 6);
      expect(effect.getAllDoubleParameters().keys().size()).toBe(3);
      expect(effect.getDoubleParameter('Brightness')).toBe(1);
      expect(effect.getDoubleParameter('Darkness')).toBe(0.3);
      expect(effect.getDoubleParameter('Param3')).toBe(6);

      effect.setStringParameter('SomeImage', 'myImageResource');
      expect(effect.getStringParameter('SomeImage')).toBe('myImageResource');
      expect(effect.getAllStringParameters().keys().size()).toBe(1);

      effect.setBooleanParameter('SomeBoolean', true);
      expect(effect.getBooleanParameter('SomeBoolean')).toBe(true);
      effect.setBooleanParameter('SomeBoolean', false);
      expect(effect.getBooleanParameter('SomeBoolean')).toBe(false);
      expect(effect.getAllBooleanParameters().keys().size()).toBe(1);

      effect.delete();
    });
  });

  describe('gd.ObjectsContainer (using gd.Layout)', function () {
    let project = null;
    beforeAll(() => (project = gd.ProjectHelper.createNewGDJSProject()));

    it('can move objects', function () {
      let layout = project.insertNewLayout('Scene', 0);
      let object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      let object2 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject2',
        1
      );
      let object3 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject3',
        2
      );

      expect(layout.getObjectAt(0).getName()).toBe('MyObject');
      expect(layout.getObjectAt(1).getName()).toBe('MyObject2');
      expect(layout.getObjectAt(2).getName()).toBe('MyObject3');
      layout.moveObject(0, 2);
      expect(layout.getObjectAt(0).getName()).toBe('MyObject2');
      expect(layout.getObjectAt(1).getName()).toBe('MyObject3');
      expect(layout.getObjectAt(2).getName()).toBe('MyObject');
      layout.moveObject(0, 0);
      expect(layout.getObjectAt(0).getName()).toBe('MyObject2');
      expect(layout.getObjectAt(1).getName()).toBe('MyObject3');
      expect(layout.getObjectAt(2).getName()).toBe('MyObject');
      layout.moveObject(1, 0);
      expect(layout.getObjectAt(0).getName()).toBe('MyObject3');
      expect(layout.getObjectAt(1).getName()).toBe('MyObject2');
      expect(layout.getObjectAt(2).getName()).toBe('MyObject');
      layout.moveObject(0, 999);
      expect(layout.getObjectAt(0).getName()).toBe('MyObject3');
      expect(layout.getObjectAt(1).getName()).toBe('MyObject2');
      expect(layout.getObjectAt(2).getName()).toBe('MyObject');
    });

    it('can find position of objects', function () {
      let layout = project.insertNewLayout('Scene2', 0);
      let object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      let object2 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject2',
        1
      );
      let object3 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject3',
        2
      );

      expect(layout.getObjectPosition('MyObject')).toBe(0);
      expect(layout.getObjectPosition('MyObject2')).toBe(1);
      expect(layout.getObjectPosition('MyObject3')).toBe(2);
      expect(layout.getObjectPosition('MyObject4')).toBe(-1);
    });

    afterAll(function () {
      project.delete();
    });
  });

  describe('gd.ObjectsContainer', function () {
    it('can move objects between containers, without moving them in memory', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();

      // Prepare two containers, one with 3 objects and one empty
      const objectsContainer1 = new gd.ObjectsContainer();
      const rootFolder1 = objectsContainer1.getRootFolder();
      const objectsContainer2 = new gd.ObjectsContainer();
      const rootFolder2 = objectsContainer2.getRootFolder();
      const subFolder2 = rootFolder2.insertNewFolder('Folder', 1);
      const mySpriteObject = objectsContainer1.insertNewObject(
        project,
        'Sprite',
        'MySprite',
        0
      );
      const mySprite2Object = objectsContainer1.insertNewObject(
        project,
        'Sprite',
        'MySprite2',
        1
      );
      const mySprite3Object = objectsContainer1.insertNewObject(
        project,
        'Sprite',
        'MySprite3',
        2
      );

      expect(objectsContainer1.getObjectsCount()).toBe(3);
      expect(objectsContainer2.getObjectsCount()).toBe(0);
      expect(rootFolder1.getChildrenCount()).toBe(3);
      expect(rootFolder2.getChildrenCount()).toBe(1);
      // Find the pointer to the objects in memory
      const mySpriteObjectPtr = gd.getPointer(objectsContainer1.getObjectAt(0));
      const mySprite2ObjectPtr = gd.getPointer(
        objectsContainer1.getObjectAt(1)
      );
      const mySprite3ObjectPtr = gd.getPointer(
        objectsContainer1.getObjectAt(2)
      );
      const mySpriteObjectFolderOrObject = rootFolder1.getChildAt(0);
      const mySprite2ObjectFolderOrObject = rootFolder1.getChildAt(1);
      const mySprite3ObjectFolderOrObject = rootFolder1.getChildAt(2);
      const mySpriteObjectFolderOrObjectPtr = gd.getPointer(
        mySpriteObjectFolderOrObject
      );
      const mySprite2ObjectFolderOrObjectPtr = gd.getPointer(
        mySprite2ObjectFolderOrObject
      );
      const mySprite3ObjectFolderOrObjectPtr = gd.getPointer(
        mySprite3ObjectFolderOrObject
      );

      // Move objects between containers
      objectsContainer1.moveObjectFolderOrObjectToAnotherContainerInFolder(
        mySprite2ObjectFolderOrObject,
        objectsContainer2,
        rootFolder2,
        0
      );
      expect(objectsContainer1.getObjectsCount()).toBe(2);
      expect(objectsContainer1.getObjectAt(0).getName()).toBe('MySprite');
      expect(objectsContainer1.getObjectAt(1).getName()).toBe('MySprite3');
      expect(objectsContainer2.getObjectsCount()).toBe(1);
      expect(objectsContainer2.getObjectAt(0).getName()).toBe('MySprite2');
      expect(rootFolder2.hasObjectNamed('MySprite2')).toBe(true);
      expect(rootFolder2.getChildrenCount()).toBe(2);
      expect(gd.getPointer(rootFolder2.getObjectChild('MySprite2'))).toBe(
        mySprite2ObjectFolderOrObjectPtr
      );
      expect(rootFolder2.getObjectChild('MySprite2')).toBe(
        mySprite2ObjectFolderOrObject
      );
      expect(mySprite2ObjectFolderOrObject.getParent()).toBe(rootFolder2);

      // Move object in sub folder.
      objectsContainer1.moveObjectFolderOrObjectToAnotherContainerInFolder(
        mySprite3ObjectFolderOrObject,
        objectsContainer2,
        subFolder2,
        0
      );
      expect(objectsContainer1.getObjectsCount()).toBe(1);
      expect(objectsContainer1.getObjectAt(0).getName()).toBe('MySprite');
      expect(objectsContainer2.getObjectsCount()).toBe(2);
      expect(objectsContainer2.getObjectAt(0).getName()).toBe('MySprite2');
      expect(objectsContainer2.getObjectAt(1).getName()).toBe('MySprite3');
      expect(subFolder2.hasObjectNamed('MySprite3')).toBe(true);
      expect(subFolder2.getChildrenCount()).toBe(1);
      expect(gd.getPointer(subFolder2.getObjectChild('MySprite3'))).toBe(
        mySprite3ObjectFolderOrObjectPtr
      );
      expect(mySprite3ObjectFolderOrObject.getParent()).toBe(subFolder2);

      // Check that the object in memory are the same, even if moved to another container
      expect(gd.getPointer(objectsContainer1.getObjectAt(0))).toBe(
        mySpriteObjectPtr
      );
      expect(gd.getPointer(objectsContainer2.getObjectAt(0))).toBe(
        mySprite2ObjectPtr
      );
      expect(gd.getPointer(objectsContainer2.getObjectAt(1))).toBe(
        mySprite3ObjectPtr
      );

      expect(gd.getPointer(rootFolder2.getObjectChild('MySprite2'))).toBe(
        mySprite2ObjectFolderOrObjectPtr
      );
      expect(rootFolder2.getObjectChild('MySprite2')).toBe(
        mySprite2ObjectFolderOrObject
      );

      // Move back first object to first container
      objectsContainer2.moveObjectFolderOrObjectToAnotherContainerInFolder(
        mySprite2ObjectFolderOrObject,
        objectsContainer1,
        rootFolder1,
        0
      );
      expect(objectsContainer1.getObjectsCount()).toBe(2);
      expect(objectsContainer1.getObjectAt(0).getName()).toBe('MySprite');
      expect(objectsContainer1.getObjectAt(1).getName()).toBe('MySprite2');
      expect(objectsContainer2.getObjectsCount()).toBe(1);
      expect(objectsContainer2.getObjectAt(0).getName()).toBe('MySprite3');
      expect(rootFolder2.hasObjectNamed('MySprite2')).toBe(false);
      expect(rootFolder2.getChildrenCount()).toBe(1);
      expect(rootFolder1.getChildrenCount()).toBe(2);
      expect(rootFolder1.getChildAt(0).getObject().getName()).toBe('MySprite2');
      expect(rootFolder1.getChildAt(1).getObject().getName()).toBe('MySprite');
      expect(rootFolder1.hasObjectNamed('MySprite2')).toBe(true);
      expect(mySprite2ObjectFolderOrObject.getParent()).toBe(rootFolder1);

      // Check again that the object in memory are the same, even if moved to another container
      expect(gd.getPointer(objectsContainer1.getObjectAt(0))).toBe(
        mySpriteObjectPtr
      );
      expect(gd.getPointer(objectsContainer1.getObjectAt(1))).toBe(
        mySprite2ObjectPtr
      );
      expect(gd.getPointer(objectsContainer2.getObjectAt(0))).toBe(
        mySprite3ObjectPtr
      );
      expect(gd.getPointer(rootFolder1.getObjectChild('MySprite2'))).toBe(
        mySprite2ObjectFolderOrObjectPtr
      );
      expect(gd.getPointer(rootFolder1.getObjectChild('MySprite'))).toBe(
        mySpriteObjectFolderOrObjectPtr
      );
      expect(gd.getPointer(subFolder2.getObjectChild('MySprite3'))).toBe(
        mySprite3ObjectFolderOrObjectPtr
      );

      project.delete();
    });
    it('enumerates folders and objects', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();

      // Prepare two containers, one with 3 objects and one empty
      const objectsContainer = new gd.ObjectsContainer();
      const rootFolder = objectsContainer.getRootFolder();
      const folder = rootFolder.insertNewFolder('Folder 1', 0);
      const mySpriteObject = objectsContainer.insertNewObjectInFolder(
        project,
        'Sprite',
        'MySprite',
        folder,
        0
      );
      const subFolder = folder.insertNewFolder('Sub Folder 1', 1);
      const mySprite2Object = objectsContainer.insertNewObjectInFolder(
        project,
        'Sprite',
        'MySprite2',
        subFolder,
        0
      );
      const mySprite3Object = objectsContainer.insertNewObjectInFolder(
        project,
        'Sprite',
        'MySprite3',
        subFolder,
        1
      );
      const subSubFolder = subFolder.insertNewFolder('Sub Sub Folder 1', 2);

      expect(objectsContainer.getObjectsCount()).toBe(3);
      expect(rootFolder.getChildrenCount()).toBe(1);
      expect(folder.getChildrenCount()).toBe(2);
      expect(subFolder.getChildrenCount()).toBe(3);

      const vectorObjectFolderOrObjects = objectsContainer.getAllObjectFolderOrObjects();
      expect(vectorObjectFolderOrObjects.size()).toBe(6);
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(0))).toBe(
        gd.getPointer(folder)
      );
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(1))).toBe(
        gd.getPointer(folder.getChildAt(0))
      );
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(2))).toBe(
        gd.getPointer(subFolder)
      );
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(3))).toBe(
        gd.getPointer(subFolder.getChildAt(0))
      );
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(4))).toBe(
        gd.getPointer(subFolder.getChildAt(1))
      );
      expect(gd.getPointer(vectorObjectFolderOrObjects.at(5))).toBe(
        gd.getPointer(subSubFolder)
      );

      objectsContainer.delete();
      project.delete();
    });
  });

  describe('gd.InitialInstancesContainer', function () {
    let container = null;
    let containerCopy = null;
    beforeAll(() => {
      container = new gd.InitialInstancesContainer();
    });

    it('initial state', function () {
      expect(container.getInstancesCount()).toBe(0);
    });
    it('adding instances', function () {
      let instance = container.insertNewInitialInstance();
      instance.setObjectName('MyObject1');
      instance.setZOrder(10);

      let instance2 = new gd.InitialInstance();
      instance2.setObjectName('MyObject2');
      instance2 = container.insertInitialInstance(instance2);

      let instance3 = container.insertNewInitialInstance();
      instance3.setObjectName('MyObject3');
      instance3.setZOrder(-1);
      instance3.setLayer('OtherLayer');

      expect(container.getInstancesCount()).toBe(3);
    });
    it('iterating', function () {
      let i = 0;
      let functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function (instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(
          (i === 0 && instance.getObjectName() === 'MyObject1') ||
            (i === 1 && instance.getObjectName() === 'MyObject2') ||
            (i === 2 && instance.getObjectName() === 'MyObject3')
        ).toBe(true);
        i++;
      };
      container.iterateOverInstances(functor);
    });
    it('can rename instances', function () {
      container.renameInstancesOfObject('MyObject1', 'MyObject');

      let i = 0;
      let functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function (instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(
          (i === 0 && instance.getObjectName() === 'MyObject') ||
            (i === 1 && instance.getObjectName() === 'MyObject2') ||
            (i === 2 && instance.getObjectName() === 'MyObject3')
        ).toBe(true);
        i++;
      };
      container.iterateOverInstances(functor);
    });
    it('iterating with z ordering', function () {
      let i = 0;
      let functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function (instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(
          (i === 0 && instance.getObjectName() === 'MyObject2') ||
            (i === 1 && instance.getObjectName() === 'MyObject')
        ).toBe(true);
        i++;
      };
      container.iterateOverInstancesWithZOrdering(functor, '');
    });
    it('moving from layers to another', function () {
      container.moveInstancesToLayer('OtherLayer', 'YetAnotherLayer');

      let functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function (instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(instance.getObjectName()).toBe('MyObject3');
      };
      container.iterateOverInstancesWithZOrdering(functor, 'YetAnotherLayer');
    });
    it('can be cloned', function () {
      containerCopy = container.clone();
      expect(containerCopy.getInstancesCount()).toBe(3);

      let instance = containerCopy.insertNewInitialInstance();
      instance.setObjectName('MyObject4');
      expect(containerCopy.getInstancesCount()).toBe(4);
      expect(container.getInstancesCount()).toBe(3);

      containerCopy.delete();
      containerCopy = null;
    });
    it('removing instances', function () {
      container.removeInitialInstancesOfObject('MyObject');
      expect(container.getInstancesCount()).toBe(2);
    });
    it('removing instances on a layer', function () {
      container.removeAllInstancesOnLayer('YetAnotherLayer');
      expect(container.getInstancesCount()).toBe(1);
    });
    it('can be serialized', function () {
      expect(container.serializeTo).not.toBe(undefined);
      expect(container.unserializeFrom).not.toBe(undefined);
    });

    afterAll(function () {
      container.delete();
    });
  });

  describe('gd.InitialInstance', function () {
    let project = null;
    let layout = null;
    let initialInstance = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);

      initialInstance = layout.getInitialInstances().insertNewInitialInstance();
    });

    it('properties', function () {
      initialInstance.setObjectName('MySpriteObject');
      expect(initialInstance.getObjectName()).toBe('MySpriteObject');
      initialInstance.setX(150);
      expect(initialInstance.getX()).toBe(150);
      initialInstance.setY(140);
      expect(initialInstance.getY()).toBe(140);
      initialInstance.setAngle(45);
      expect(initialInstance.getAngle()).toBe(45);
      initialInstance.setZOrder(12);
      expect(initialInstance.getZOrder()).toBe(12);
      initialInstance.setLayer('MyLayer');
      expect(initialInstance.getLayer()).toBe('MyLayer');
      initialInstance.setLocked(true);
      expect(initialInstance.isLocked()).toBe(true);
      initialInstance.setHasCustomSize(true);
      expect(initialInstance.hasCustomSize()).toBe(true);
      initialInstance.setCustomWidth(34);
      expect(initialInstance.getCustomWidth()).toBe(34);
      initialInstance.setCustomHeight(30);
      expect(initialInstance.getCustomHeight()).toBe(30);

      expect(initialInstance.hasCustomDepth()).toBe(false);
    });
    it('Sprite object custom properties', function () {
      initialInstance.updateCustomProperty('animation', '2', project, layout);
      expect(
        initialInstance
          .getCustomProperties(project, layout)
          .get('animation')
          .getValue()
      ).toBe('2');
      expect(initialInstance.getRawDoubleProperty('animation')).toBe(2);
    });
    it('can be serialized', function () {
      expect(initialInstance.serializeTo).not.toBe(undefined);
      expect(initialInstance.unserializeFrom).not.toBe(undefined);

      let element = new gd.SerializerElement();
      initialInstance.serializeTo(element);

      let initialInstance2 = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      initialInstance2.unserializeFrom(element);
      expect(initialInstance2.getObjectName()).toBe('MySpriteObject');
      expect(initialInstance2.getX()).toBe(150);
      expect(initialInstance2.getY()).toBe(140);
      expect(initialInstance2.getZ()).toBe(0);
      expect(initialInstance2.getAngle()).toBe(45);
      expect(initialInstance2.getRotationX()).toBe(0);
      expect(initialInstance2.getRotationY()).toBe(0);
      expect(initialInstance2.getZOrder()).toBe(12);
      expect(initialInstance2.getLayer()).toBe('MyLayer');
      expect(initialInstance2.isLocked()).toBe(true);
      expect(initialInstance2.hasCustomSize()).toBe(true);
      expect(initialInstance2.hasCustomDepth()).toBe(false);
      expect(initialInstance2.getCustomWidth()).toBe(34);
      expect(initialInstance2.getCustomHeight()).toBe(30);
      expect(initialInstance2.getCustomDepth()).toBe(0);
    });
    it('can have 3D properties migrated from number properties', function () {
      const element = gd.Serializer.fromJSObject({
        angle: 2,
        customSize: true,
        height: 100,
        layer: '',
        name: 'Walls',
        persistentUuid: '1075df65-af84-472d-a431-47d6f7a5cb63',
        width: 950,
        x: -100,
        y: -75,
        zOrder: 1,
        numberProperties: [
          {
            name: 'depth', // This indicates there is a custom depth.
            value: 300,
          },
          {
            name: 'z',
            value: 12,
          },
          {
            name: 'rotationX',
            value: 1,
          },
          {
            name: 'rotationY',
            value: 3,
          },
        ],
        stringProperties: [],
        initialVariables: [],
      });

      const migratedInstance = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      migratedInstance.unserializeFrom(element);

      element.delete();
      expect(migratedInstance.getX()).toBe(-100);
      expect(migratedInstance.getY()).toBe(-75);
      expect(migratedInstance.getZ()).toBe(12);
      expect(migratedInstance.getAngle()).toBe(2);
      expect(migratedInstance.getRotationX()).toBe(1);
      expect(migratedInstance.getRotationY()).toBe(3);
      expect(migratedInstance.hasCustomSize()).toBe(true);
      expect(migratedInstance.hasCustomDepth()).toBe(true);
      expect(migratedInstance.getCustomWidth()).toBe(950);
      expect(migratedInstance.getCustomHeight()).toBe(100);
      expect(migratedInstance.getCustomDepth()).toBe(300);
    });
    it('can have depth without a custom size', function () {
      const element = gd.Serializer.fromJSObject({
        angle: 2,
        customSize: false,
        height: 100,
        layer: '',
        name: 'Walls',
        persistentUuid: '1075df65-af84-472d-a431-47d6f7a5cb63',
        width: 950,
        x: -100,
        y: -75,
        zOrder: 1,
        z: 12,
        depth: 300, // This indicates there is a custom depth.
        rotationX: 1,
        rotationY: 3,
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
      });

      const instanceWithJustDepth = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      instanceWithJustDepth.unserializeFrom(element);

      element.delete();
      expect(instanceWithJustDepth.getX()).toBe(-100);
      expect(instanceWithJustDepth.getY()).toBe(-75);
      expect(instanceWithJustDepth.getZ()).toBe(12);
      expect(instanceWithJustDepth.getAngle()).toBe(2);
      expect(instanceWithJustDepth.getRotationX()).toBe(1);
      expect(instanceWithJustDepth.getRotationY()).toBe(3);
      expect(instanceWithJustDepth.hasCustomSize()).toBe(false);
      expect(instanceWithJustDepth.hasCustomDepth()).toBe(true);
      expect(instanceWithJustDepth.getCustomDepth()).toBe(300);
      expect(instanceWithJustDepth.getCustomWidth()).toBe(950);
      expect(instanceWithJustDepth.getCustomHeight()).toBe(100);
    });
    it('can have 3D properties', function () {
      const initialInstanceIn3D = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      initialInstanceIn3D.setX(40);
      initialInstanceIn3D.setY(41);
      initialInstanceIn3D.setZ(42);
      initialInstanceIn3D.setAngle(43);
      initialInstanceIn3D.setRotationX(44);
      initialInstanceIn3D.setRotationY(45);
      initialInstanceIn3D.setHasCustomSize(true);
      initialInstanceIn3D.setHasCustomDepth(true);
      initialInstanceIn3D.setCustomWidth(46);
      initialInstanceIn3D.setCustomHeight(47);
      initialInstanceIn3D.setCustomDepth(48);
      expect(initialInstanceIn3D.getX()).toBe(40);
      expect(initialInstanceIn3D.getY()).toBe(41);
      expect(initialInstanceIn3D.getZ()).toBe(42);
      expect(initialInstanceIn3D.getAngle()).toBe(43);
      expect(initialInstanceIn3D.getRotationX()).toBe(44);
      expect(initialInstanceIn3D.getRotationY()).toBe(45);
      expect(initialInstanceIn3D.hasCustomSize()).toBe(true);
      expect(initialInstanceIn3D.hasCustomDepth()).toBe(true);
      expect(initialInstanceIn3D.getCustomWidth()).toBe(46);
      expect(initialInstanceIn3D.getCustomHeight()).toBe(47);
      expect(initialInstanceIn3D.getCustomDepth()).toBe(48);

      const element = new gd.SerializerElement();
      initialInstanceIn3D.serializeTo(element);

      const initialInstance2 = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      initialInstance2.unserializeFrom(element);
      expect(initialInstance2.getX()).toBe(40);
      expect(initialInstance2.getY()).toBe(41);
      expect(initialInstance2.getZ()).toBe(42);
      expect(initialInstance2.getAngle()).toBe(43);
      expect(initialInstance2.getRotationX()).toBe(44);
      expect(initialInstance2.getRotationY()).toBe(45);
      expect(initialInstance2.hasCustomSize()).toBe(true);
      expect(initialInstance2.hasCustomDepth()).toBe(true);
      expect(initialInstance2.getCustomWidth()).toBe(46);
      expect(initialInstance2.getCustomHeight()).toBe(47);
      expect(initialInstance2.getCustomDepth()).toBe(48);
    });
    it('can be serialized with a persistent UUID called persistentUuid', function () {
      const initialInstance = new gd.InitialInstance();
      initialInstance.setObjectName('MyObject');

      // Serialized object must have a non empty "persistentUuid".
      let element = new gd.SerializerElement();
      initialInstance.serializeTo(element);
      const persistentUuid = element.getStringAttribute('persistentUuid');
      expect(persistentUuid).toBeTruthy();

      // The UUID must persist across serializations.
      const initialInstance2 = new gd.InitialInstance();
      initialInstance2.unserializeFrom(element);

      let element2 = new gd.SerializerElement();
      initialInstance.serializeTo(element2);
      const persistentUuid2 = element2.getStringAttribute('persistentUuid');
      expect(persistentUuid2).toBe(persistentUuid);

      // The UUID can be reset
      initialInstance2.resetPersistentUuid();
      let element3 = new gd.SerializerElement();
      initialInstance2.serializeTo(element3);
      const persistentUuid3 = element3.getStringAttribute('persistentUuid');
      expect(persistentUuid3).not.toBe(persistentUuid2);

      element.delete();
      element2.delete();
      element3.delete();
      initialInstance.delete();
      initialInstance2.delete();
    });

    afterAll(function () {
      project.delete();
    });
  });

  describe('gd.VariablesContainer', function () {
    it('container is empty after being created', function () {
      let container = new gd.VariablesContainer();

      expect(container.has('Variable')).toBe(false);
      expect(container.count()).toBe(0);
      container.delete();
    });
    it('can insert variables', function () {
      let container = new gd.VariablesContainer();

      container.insertNew('Variable', 0);
      expect(container.has('Variable')).toBe(true);
      expect(container.count()).toBe(1);

      container.insertNew('SecondVariable', 0);
      expect(container.has('SecondVariable')).toBe(true);
      expect(container.count()).toBe(2);
      container.delete();
    });
    it('can rename variables', function () {
      let container = new gd.VariablesContainer();

      container.insertNew('Variable', 0);
      container
        .insertNew('SecondVariable', 0)
        .setString('String of SecondVariable');
      container.insertNew('ThirdVariable', 0);

      expect(container.has('SecondVariable')).toBe(true);
      expect(container.has('NewName')).toBe(false);
      container.rename('SecondVariable', 'NewName');
      expect(container.has('SecondVariable')).toBe(false);
      expect(container.has('NewName')).toBe(true);

      expect(container.get('NewName').getString()).toBe(
        'String of SecondVariable'
      );
      container.delete();
    });
    it('can swap variables', function () {
      let container = new gd.VariablesContainer();

      container.insertNew('Variable', 0).setValue(4);
      container
        .insertNew('SecondVariable', 1)
        .setString('String of SecondVariable');
      container.insertNew('ThirdVariable', 2).getChild('Child1').setValue(7);

      expect(container.getNameAt(0)).toBe('Variable');
      expect(container.getNameAt(2)).toBe('ThirdVariable');

      container.swap(0, 2);
      expect(container.getNameAt(0)).toBe('ThirdVariable');
      expect(container.getNameAt(2)).toBe('Variable');
      expect(container.getAt(2).getValue()).toBe(4);

      container.delete();
    });
    it('can move variables', function () {
      let container = new gd.VariablesContainer();

      container.insertNew('Variable', 0).setValue(4);
      container
        .insertNew('SecondVariable', 1)
        .setString('String of SecondVariable');
      container.insertNew('ThirdVariable', 2).getChild('Child1').setValue(7);

      container.move(1, 2);
      expect(container.getNameAt(0)).toBe('Variable');
      expect(container.getNameAt(1)).toBe('ThirdVariable');
      expect(container.getNameAt(2)).toBe('SecondVariable');

      container.move(1, 9999);
      expect(container.getNameAt(0)).toBe('Variable');
      expect(container.getNameAt(1)).toBe('ThirdVariable');
      expect(container.getNameAt(2)).toBe('SecondVariable');

      container.move(2, 0);
      expect(container.getNameAt(0)).toBe('SecondVariable');
      expect(container.getNameAt(1)).toBe('Variable');
      expect(container.getNameAt(2)).toBe('ThirdVariable');

      container.delete();
    });
  });

  describe('gd.Variable', function () {
    let variable = null;
    beforeEach(() => (variable = new gd.Variable()));

    it('should have initial value', function () {
      expect(variable.getValue()).toBe(0);
      expect(variable.getType()).toBe(gd.Variable.Number);
    });
    it('can have a value', function () {
      variable.setValue(5);
      expect(variable.getValue()).toBe(5);
      expect(variable.getType()).toBe(gd.Variable.Number);
    });
    it('can have a string value', function () {
      variable.setString('Hello');
      expect(variable.getString()).toBe('Hello');
      expect(variable.getType()).toBe(gd.Variable.String);
    });
    it('can have a boolean value', function () {
      variable.setBool(true);
      expect(variable.getBool()).toBe(true);
      expect(variable.getType()).toBe(gd.Variable.Boolean);
    });
    it('can be a structure', function () {
      variable.getChild('FirstChild').setValue(1);
      variable.getChild('SecondChild').setString('two');
      expect(variable.hasChild('FirstChild')).toBe(true);
      expect(variable.hasChild('SecondChild')).toBe(true);
      expect(variable.hasChild('NotExisting')).toBe(false);
      expect(variable.getChild('SecondChild').getString()).toBe('two');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      variable.removeChild('FirstChild');
      expect(variable.hasChild('FirstChild')).toBe(false);
      expect(variable.getType()).toBe(gd.Variable.Structure);
      variable.removeChild('SecondChild');
      expect(variable.getType()).toBe(gd.Variable.Structure);
    });
    it('can insert a child in structure', function () {
      variable.getChild('FirstChild').setValue(1);
      variable.getChild('SecondChild').setString('two');
      expect(variable.getType()).toBe(gd.Variable.Structure);
      const variableToInsert = new gd.Variable();
      variableToInsert.setString('strVariable');
      {
        const result = variable.insertChild('FirstChild', variableToInsert);
        expect(result).toBe(false);
      }
      {
        const result = variable.insertChild('ThirdChild', variableToInsert);
        expect(result).toBe(true);
      }
      variableToInsert.delete();
      expect(variable.hasChild('ThirdChild')).toBe(true);
      expect(variable.getChild('ThirdChild').getString()).toBe('strVariable');
    });
    it('can expose its children', function () {
      variable.getChild('FirstChild').setValue(1);
      variable.getChild('SecondChild').setValue(1);

      let childrenNames = variable.getAllChildrenNames();
      expect(childrenNames.size()).toBe(2);

      variable.getChild(childrenNames.get(0)).setString('one');
      variable.getChild(childrenNames.get(1)).setValue(2);

      expect(variable.getChild('FirstChild').getString()).toBe('one');
      expect(variable.getChild('SecondChild').getValue()).toBe(2);

      expect(childrenNames.size()).toBe(2);
    });
    it('can be an array', function () {
      variable.getAtIndex(0).setValue(1);
      expect(variable.getType()).toBe(gd.Variable.Array);
      variable.getAtIndex(2).setString('three');
      expect(variable.getAllChildrenArray().size()).toBe(3);
      expect(variable.getAtIndex(0).getValue()).toBe(1);
      expect(variable.getAtIndex(1).getValue()).toBe(0);
      expect(variable.getAtIndex(2).getType()).toBe(gd.Variable.String);
      variable.removeAtIndex(2);
      expect(variable.getType()).toBe(gd.Variable.Array);
      variable.removeAtIndex(1);
      variable.removeAtIndex(0);
      expect(variable.getType()).toBe(gd.Variable.Array);
    });
    it('can move children inside array', function () {
      variable.getAtIndex(0).setValue(1);
      expect(variable.getType()).toBe(gd.Variable.Array);
      variable.getAtIndex(1).setValue(2);
      variable.getAtIndex(2).setValue(3);
      variable.getAtIndex(3).setValue(4);
      variable.moveChildInArray(2, 0);
      expect(variable.getAtIndex(2).getValue()).toBe(2);
      expect(variable.getAtIndex(0).getValue()).toBe(3);
    });
    it('can insert child in array', function () {
      variable.getAtIndex(0).setValue(1);
      expect(variable.getType()).toBe(gd.Variable.Array);
      variable.getAtIndex(1).setValue(2);
      variable.getAtIndex(2).setValue(3);
      variable.getAtIndex(3).setValue(4);
      const variableToInsert = new gd.Variable();
      variableToInsert.setString('strVariable');
      const result = variable.insertAtIndex(variableToInsert, 2);
      variableToInsert.delete();
      expect(result).toBe(true);
      expect(variable.getAtIndex(2).getString()).toBe('strVariable');
      expect(variable.getAtIndex(3).getValue()).toBe(3);
      expect(variable.getAtIndex(4).getValue()).toBe(4);
    });
    it('can search inside children and remove them recursively', function () {
      let parentVariable = new gd.Variable();

      let child1 = parentVariable.getChild('Child1');
      let child2 = parentVariable.getChild('Child2');
      let grandChild1 = parentVariable
        .getChild('Child1')
        .getChild('GrandChild');
      let grandChild2 = parentVariable.getChild('Child2').getAtIndex(0);

      expect(parentVariable.contains(grandChild1, true)).toBe(true);
      expect(parentVariable.contains(grandChild1, false)).toBe(false);
      expect(parentVariable.contains(grandChild2, true)).toBe(true);
      expect(parentVariable.contains(grandChild2, false)).toBe(false);
      expect(parentVariable.contains(child1, true)).toBe(true);
      expect(parentVariable.contains(child2, true)).toBe(true);
      expect(parentVariable.contains(child1, false)).toBe(true);
      expect(parentVariable.contains(child2, false)).toBe(true);

      expect(child1.contains(grandChild1, true)).toBe(true);
      expect(child1.contains(grandChild1, false)).toBe(true);
      expect(child2.contains(grandChild1, true)).toBe(false);
      expect(child2.contains(grandChild1, false)).toBe(false);

      expect(child1.contains(grandChild2, true)).toBe(false);
      expect(child1.contains(grandChild2, false)).toBe(false);
      expect(child2.contains(grandChild2, true)).toBe(true);
      expect(child2.contains(grandChild2, false)).toBe(true);

      expect(grandChild1.contains(grandChild1, true)).toBe(false);
      expect(grandChild1.contains(grandChild1, false)).toBe(false);
      expect(grandChild1.contains(child1, true)).toBe(false);
      expect(grandChild1.contains(child2, true)).toBe(false);
      expect(grandChild1.contains(parentVariable, true)).toBe(false);
      expect(grandChild1.contains(child1, false)).toBe(false);
      expect(grandChild1.contains(child2, false)).toBe(false);
      expect(grandChild1.contains(parentVariable, false)).toBe(false);

      expect(grandChild2.contains(grandChild1, true)).toBe(false);
      expect(grandChild2.contains(grandChild1, false)).toBe(false);
      expect(grandChild2.contains(child1, true)).toBe(false);
      expect(grandChild2.contains(child2, true)).toBe(false);
      expect(grandChild2.contains(parentVariable, true)).toBe(false);
      expect(grandChild2.contains(child1, false)).toBe(false);
      expect(grandChild2.contains(child2, false)).toBe(false);
      expect(grandChild2.contains(parentVariable, false)).toBe(false);

      parentVariable.removeRecursively(grandChild1);
      expect(child1.hasChild('GrandChild')).toBe(false);
      expect(child1.getChildrenCount()).toBe(0);
      expect(parentVariable.getChildrenCount()).toBe(2);

      parentVariable.removeRecursively(grandChild2);
      expect(child2.getAllChildrenArray().size()).toBe(0);
      expect(child2.getChildrenCount()).toBe(0);
      expect(parentVariable.getChildrenCount()).toBe(2);

      parentVariable.removeRecursively(child2);
      expect(parentVariable.getChildrenCount()).toBe(1);
      expect(parentVariable.hasChild('Child1')).toBe(true);
      expect(parentVariable.hasChild('Child2')).toBe(false);

      parentVariable.delete();
    });

    afterAll(function () {
      variable.delete();
    });
  });

  describe('gd.ImageResource', function () {
    it('should have name and file', function () {
      const resource = new gd.ImageResource();
      resource.setName('MyResource');
      resource.setFile('MyFile');
      expect(resource.getName()).toBe('MyResource');
      expect(resource.getFile()).toBe('MyFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.ImageResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });

    it('has smooth and alreadyLoaded custom properties', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const resource = new gd.ImageResource();

      const properties = resource.getProperties();
      expect(properties.get('Smooth the image').getValue()).toBe('true');
      expect(properties.get('Always loaded in memory').getValue()).toBe(
        'false'
      );

      // Note: updateProperty expect the booleans in an usual "0" or "1" format.
      resource.updateProperty('Smooth the image', '0');
      resource.updateProperty('Always loaded in memory', '1');

      const updatedProperties = resource.getProperties();
      expect(updatedProperties.get('Smooth the image').getValue()).toBe(
        'false'
      );
      expect(updatedProperties.get('Always loaded in memory').getValue()).toBe(
        'true'
      );

      resource.delete();
      project.delete();
    });
  });

  describe('gd.AudioResource', function () {
    it('should have name and file', function () {
      const resource = new gd.AudioResource();
      resource.setName('MyAudioResource');
      resource.setFile('MyAudioFile');
      expect(resource.getName()).toBe('MyAudioResource');
      expect(resource.getFile()).toBe('MyAudioFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.AudioResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.FontResource', function () {
    it('should have name and file', function () {
      const resource = new gd.FontResource();
      resource.setName('MyFontResource');
      resource.setFile('MyFontFile');
      expect(resource.getName()).toBe('MyFontResource');
      expect(resource.getFile()).toBe('MyFontFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.FontResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.BitmapFontResource', function () {
    it('should have name and file', function () {
      const resource = new gd.BitmapFontResource();
      resource.setName('MyBitmapFontResource');
      resource.setFile('MyBitmapFontFile');
      expect(resource.getName()).toBe('MyBitmapFontResource');
      expect(resource.getFile()).toBe('MyBitmapFontFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.BitmapFontResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.VideoResource', function () {
    it('should have name and file', function () {
      const resource = new gd.VideoResource();
      resource.setName('MyVideoResource');
      resource.setFile('MyVideoFile');
      expect(resource.getName()).toBe('MyVideoResource');
      expect(resource.getFile()).toBe('MyVideoFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.VideoResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.JsonResource', function () {
    it('should have name and file', function () {
      const resource = new gd.JsonResource();
      resource.setName('MyJsonResource');
      resource.setFile('MyJsonFile');
      expect(resource.getName()).toBe('MyJsonResource');
      expect(resource.getFile()).toBe('MyJsonFile');
      resource.delete();
    });
    it('can have metadata', function () {
      const resource = new gd.JsonResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });

    it('has disablePreload custom properties', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const resource = new gd.JsonResource();

      const properties = resource.getProperties();
      expect(properties.get('disablePreload').getValue()).toBe('false');

      // Note: updateProperty expect the booleans in an usual "0" or "1" format.
      resource.updateProperty('disablePreload', '1');

      const updatedProperties = resource.getProperties();
      expect(updatedProperties.get('disablePreload').getValue()).toBe('true');

      resource.delete();
      project.delete();
    });
  });

  describe('gd.ResourcesManager', function () {
    it('should support adding resources', function () {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let resource = new gd.Resource();
      let resource2 = new gd.Resource();
      resource.setName('MyResource');
      resource2.setName('MyResource2');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);
      let allResources = project.getResourcesManager().getAllResourceNames();

      expect(allResources.size()).toBe(2);
      project.delete();
    });

    it('should support finding resources', function () {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let resource = new gd.Resource();
      let resource2 = new gd.Resource();
      resource.setName('MyResource');
      resource2.setName('MyResource2');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);

      expect(
        project.getResourcesManager().getResourcePosition('MyResource')
      ).toBe(0);
      expect(
        project.getResourcesManager().getResourcePosition('MyResource2')
      ).toBe(1);
      expect(
        project.getResourcesManager().getResourcePosition('MyResource3')
      ).toBe(-1);
      project.delete();
    });

    it('can find files that are not in the resources', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const resource = new gd.ImageResource();
      const resource2 = new gd.AudioResource();
      const resource3 = new gd.AudioResource();
      const resource4 = new gd.JsonResource();
      resource.setName('MyResource');
      resource.setFile('MyFile.png');
      resource2.setName('MyResource2');
      resource2.setFile('MySubFolder/MyOtherFile.mp3');
      resource3.setName('MyResource3');
      resource3.setFile('MySubFolder\\MyOtherFileInWindowsFormat.mp3');
      resource4.setName('MyResource4');
      resource4.setFile('MySubFolder/MyOtherFileInUnixFormat.json');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);
      project.getResourcesManager().addResource(resource3);
      project.getResourcesManager().addResource(resource4);

      const filesToCheck = new gd.VectorString();
      [
        'MyFile.png',
        'MySubFolder/MyFileMissingInResource.png',
        'MySubFolder/MyOtherFile.mp3',
        // Check that resources can be found even if specified using
        // a different path separator:
        'MySubFolder/MyOtherFileInWindowsFormat.mp3',
        'MySubFolder\\MyOtherFileInUnixFormat.json',
      ].forEach((filePath) => {
        filesToCheck.push_back(filePath);
      });
      const filesNotInResources = project
        .getResourcesManager()
        .findFilesNotInResources(filesToCheck);
      filesToCheck.delete();

      expect(filesNotInResources.size()).toBe(1);
      expect(filesNotInResources.at(0)).toBe(
        'MySubFolder/MyFileMissingInResource.png'
      );

      project.delete();
    });

    it('should support removing resources', function () {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let resource = new gd.Resource();
      resource.setName('MyResource');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().removeResource('MyResource');

      let allResources = project.getResourcesManager().getAllResourceNames();
      expect(allResources.size()).toBe(0);
      project.delete();
    });
  });

  describe('gd.ProjectResourcesAdder', function () {
    it('should support removing useless resources', function () {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let resource1 = new gd.ImageResource();
      resource1.setName('Useless');
      let resource2 = new gd.ImageResource();
      resource2.setName('Used');
      project.getResourcesManager().addResource(resource1);
      project.getResourcesManager().addResource(resource2);

      //Create an object using a resource
      let obj = project.insertNewObject(project, 'Sprite', 'MyObject', 0);
      let sprite1 = new gd.Sprite();
      sprite1.setImageName('Used');

      let anim1 = new gd.Animation();
      anim1.setDirectionsCount(1);
      anim1.getDirection(0).addSprite(sprite1);

      gd.castObject(obj.getConfiguration(), gd.SpriteObject).getAnimations().addAnimation(
        anim1
      );

      {
        let allResources = project.getResourcesManager().getAllResourceNames();
        expect(allResources.size()).toBe(2);
      }

      gd.ProjectResourcesAdder.removeAllUseless(project, 'image');

      {
        let allResources = project.getResourcesManager().getAllResourceNames();
        expect(allResources.size()).toBe(1);
        expect(allResources.get(0)).toBe('Used');
      }
      project.delete();
    });

    it('should not remove loading screen image when removing useless resources', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const resource = new gd.ImageResource();
      resource.setName('LoadingScreenImage');
      project
        .getLoadingScreen()
        .setBackgroundImageResourceName(resource.getName());

      expect(project.getLoadingScreen().getBackgroundImageResourceName()).toBe(
        'LoadingScreenImage'
      );

      const worker = new gd.ResourcesInUseHelper();
      gd.ResourceExposer.exposeWholeProjectResources(project, worker);
      expect(worker.getAllImages().toNewVectorString().toJSArray().length).toBe(
        1
      );
      expect(worker.getAllImages().toNewVectorString().toJSArray()[0]).toBe(
        'LoadingScreenImage'
      );

      gd.ProjectResourcesAdder.removeAllUseless(project, 'image');

      const newWorker = new gd.ResourcesInUseHelper();
      gd.ResourceExposer.exposeWholeProjectResources(project, newWorker);
      expect(
        newWorker.getAllImages().toNewVectorString().toJSArray().length
      ).toBe(1);
      expect(newWorker.getAllImages().toNewVectorString().toJSArray()[0]).toBe(
        'LoadingScreenImage'
      );

      project.delete();
    });
  });

  describe('gd.ArbitraryResourceWorker', function () {
    it('should be called with resources of the project', function (done) {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let obj = project.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const spriteConfiguration = gd.asSpriteConfiguration(
        obj.getConfiguration()
      );
      let sprite1 = new gd.Sprite();
      sprite1.setImageName('Used');
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      animation.getDirection(0).addSprite(sprite1);
      spriteConfiguration.getAnimations().addAnimation(animation);

      let worker = extend(new gd.ArbitraryResourceWorkerJS(project.getResourcesManager()), {
        exposeImage: function (image) {
          expect(image).toBe('Used');
          done();

          return image;
        },
      });

      gd.ResourceExposer.exposeWholeProjectResources(project, worker);
      project.delete();
    });
  });

  describe('gd.ResourcesInUseHelper', function () {
    it('should find the images used by objects', function () {
      let sprite1 = new gd.Sprite();
      sprite1.setImageName('Image1');
      let sprite2 = new gd.Sprite();
      sprite2.setImageName('Image2');
      let sprite3 = new gd.Sprite();
      sprite3.setImageName('Image3');

      const spriteObject = new gd.SpriteObject();
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      animation.getDirection(0).addSprite(sprite1);
      animation.getDirection(0).addSprite(sprite2);
      animation.getDirection(0).addSprite(sprite1);
      spriteObject.getAnimations().addAnimation(animation);

      const spriteObject2 = new gd.SpriteObject();
      const animation2 = new gd.Animation();
      animation2.setDirectionsCount(1);
      animation2.getDirection(0).addSprite(sprite1);
      animation2.getDirection(0).addSprite(sprite3);
      animation2.getDirection(0).addSprite(sprite1);
      spriteObject2.getAnimations().addAnimation(animation2);

      const resourcesInUse = new gd.ResourcesInUseHelper();

      {
        spriteObject.exposeResources(resourcesInUse);
        const resourceNames = resourcesInUse
          .getAllImages()
          .toNewVectorString()
          .toJSArray();
        expect(resourceNames).toHaveLength(2);
        expect(resourceNames).toContain('Image1');
        expect(resourceNames).toContain('Image2');
      }

      {
        spriteObject2.exposeResources(resourcesInUse);
        const resourceNames = resourcesInUse
          .getAllImages()
          .toNewVectorString()
          .toJSArray();
        expect(resourceNames).toHaveLength(3);
        expect(resourceNames).toContain('Image1');
        expect(resourceNames).toContain('Image2');
        expect(resourceNames).toContain('Image3');
      }

      resourcesInUse.delete();

      spriteObject.delete();
      spriteObject2.delete();
    });
  });

  describe('gd.ObjectsUsingResourceCollector', function () {
    it('lists objects that use the given resources', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);

      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const sprite1 = new gd.Sprite();
      sprite1.setImageName('Image1');
      const sprite2 = new gd.Sprite();
      sprite2.setImageName('Image2');
      const sprite3 = new gd.Sprite();
      sprite3.setImageName('Image3');

      const spriteObject = gd.asSpriteConfiguration(object.getConfiguration());
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      animation.getDirection(0).addSprite(sprite1);
      animation.getDirection(0).addSprite(sprite2);
      animation.getDirection(0).addSprite(sprite1);
      spriteObject.getAnimations().addAnimation(animation);

      const object2 = project.insertNewObject(
        project,
        'Sprite',
        'MyObject2',
        0
      );
      const spriteObject2 = gd.asSpriteConfiguration(
        object2.getConfiguration()
      );
      const animation2 = new gd.Animation();
      animation2.setDirectionsCount(1);
      animation2.getDirection(0).addSprite(sprite1);
      animation2.getDirection(0).addSprite(sprite3);
      animation2.getDirection(0).addSprite(sprite1);
      spriteObject2.getAnimations().addAnimation(animation2);

      {
        const objectsCollector = new gd.ObjectsUsingResourceCollector(project.getResourcesManager(), 'Image1');
        gd.ProjectBrowserHelper.exposeProjectObjects(project, objectsCollector);
        const objectNames = objectsCollector.getObjectNames().toJSArray();
        objectsCollector.delete();
        expect(objectNames.length).toEqual(2);
        expect(objectNames).toContain('MyObject');
        expect(objectNames).toContain('MyObject2');
      }
      {
        const objectsCollector = new gd.ObjectsUsingResourceCollector(project.getResourcesManager(), 'Image2');
        gd.ProjectBrowserHelper.exposeProjectObjects(project, objectsCollector);
        const objectNames = objectsCollector.getObjectNames().toJSArray();
        objectsCollector.delete();
        expect(objectNames.length).toEqual(1);
        expect(objectNames).toContain('MyObject');
      }
      {
        const objectsCollector = new gd.ObjectsUsingResourceCollector(project.getResourcesManager(), 'Image3');
        gd.ProjectBrowserHelper.exposeProjectObjects(project, objectsCollector);
        const objectNames = objectsCollector.getObjectNames().toJSArray();
        objectsCollector.delete();
        expect(objectNames.length).toEqual(1);
        expect(objectNames).toContain('MyObject2');
      }

      project.delete();
    });
  });

  describe('gd.Behavior', function () {
    it('update a not existing property', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const behavior = new gd.Behavior();
      const serializerElement = new gd.SerializerElement();

      expect(
        behavior.updateProperty(
          serializerElement,
          'PropertyThatDoesNotExist',
          'MyValue'
        )
      ).toBe(false);

      serializerElement.delete();
      behavior.delete();
      project.delete();
    });
  });

  describe('gd.BehaviorsSharedData', function () {
    it('can be created by gd.Layout.updateBehaviorsSharedData', function () {
      let project = gd.ProjectHelper.createNewGDJSProject();
      let layout = project.insertNewLayout('Scene', 0);
      let object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);

      layout.updateBehaviorsSharedData(project);
      expect(layout.hasBehaviorSharedData('Physics')).toBe(false);
      let behaviorContent = object.addNewBehavior(
        project,
        'PhysicsBehavior::PhysicsBehavior',
        'Physics'
      );
      expect(layout.hasBehaviorSharedData('Physics')).toBe(false);
      layout.updateBehaviorsSharedData(project);
      expect(layout.hasBehaviorSharedData('Physics')).toBe(true);
      layout.removeObject('MyObject');
      expect(layout.hasBehaviorSharedData('Physics')).toBe(true);
      layout.updateBehaviorsSharedData(project);
      expect(layout.hasBehaviorSharedData('Physics')).toBe(false);

      project.delete();
    });
  });

  describe('gd.BehaviorSharedDataJsImplementation', function () {
    it('can declare a gd.BehaviorSharedDataJsImplementation and pass sanity checks', function () {
      let mySharedData = new gd.BehaviorSharedDataJsImplementation();
      mySharedData.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'My first property') {
          behaviorContent.setStringAttribute('property1', newValue);
          return true;
        }
        if (propertyName === 'My other property') {
          behaviorContent.setBoolAttribute('property2', newValue === '1');
          return true;
        }

        return false;
      };
      mySharedData.getProperties = function (behaviorContent) {
        let properties = new gd.MapStringPropertyDescriptor();

        properties
          .getOrCreate('My first property')
          .setValue(behaviorContent.getStringAttribute('property1'));
        properties
          .getOrCreate('My other property')
          .setValue(behaviorContent.getBoolAttribute('property2') ? '1' : '0')
          .setType('Boolean');

        return properties;
      };
      mySharedData.initializeContent = function (behaviorContent) {
        behaviorContent.setStringAttribute('property1', 'Initial value 1');
        behaviorContent.setBoolAttribute('property2', true);
      };

      try {
        expect(
          gd.ProjectHelper.sanityCheckBehaviorsSharedDataProperty(
            mySharedData,
            'My first property',
            'Value1'
          )
        ).toBe('');
        expect(
          gd.ProjectHelper.sanityCheckBehaviorsSharedDataProperty(
            mySharedData,
            'My other property',
            '0'
          )
        ).toBe('');
      } catch (ex) {
        console.error(ex);

        throw Error(
          'Exception caught while launching sanityCheckBehavior on a gd.BehaviorSharedDataJsImplementation.'
        );
      }
    });
  });

  describe('gd.NamedPropertyDescriptor', function () {
    const makeNewProperty = () => {
      const property = new gd.NamedPropertyDescriptor();
      property
        .setName('Property1')
        .setLabel('The first property')
        .setValue('Hello world')
        .setType('string')
        .addExtraInfo('Info1')
        .addExtraInfo('Info2');

      return property;
    };

    it('can be created and manipulated', function () {
      const property = makeNewProperty();
      expect(property.getName()).toBe('Property1');
      expect(property.getLabel()).toBe('The first property');
      expect(property.getValue()).toBe('Hello world');
      expect(property.getType()).toBe('string');
      expect(property.getExtraInfo().toJSArray()).toContain('Info1');
      expect(property.getExtraInfo().toJSArray()).toContain('Info2');

      property.delete();
    });
    it('can be serialized', function () {
      const property = makeNewProperty();

      let serializerElement = new gd.SerializerElement();
      property.serializeTo(serializerElement);
      property.delete();

      const property2 = new gd.NamedPropertyDescriptor();
      property2.unserializeFrom(serializerElement);
      serializerElement.delete();

      expect(property2.getName()).toBe('Property1');
      expect(property2.getLabel()).toBe('The first property');
      expect(property2.getValue()).toBe('Hello world');
      expect(property2.getType()).toBe('string');
      expect(property2.getExtraInfo().toJSArray()).toContain('Info1');
      expect(property2.getExtraInfo().toJSArray()).toContain('Info2');
    });
  });

  describe('gd.PropertiesContainer', function () {
    it('can be used to store named properties', function () {
      const list = new gd.PropertiesContainer(0);

      const property1 = list.insertNew('Property1', 0);
      expect(list.has('Property1')).toBe(true);
      expect(list.getCount()).toBe(1);

      expect(property1.getName()).toBe('Property1');
      expect(list.getAt(0).getName()).toBe('Property1');

      property1.setLabel('Property 1');
      property1.setValue('123');
      expect(list.getAt(0).getLabel()).toBe('Property 1');
      expect(list.getAt(0).getValue()).toBe('123');
      list.delete();
    });
  });

  describe('gd.MapStringPropertyDescriptor', function () {
    it('can be used to manipulate properties', function () {
      let properties = new gd.MapStringPropertyDescriptor();
      expect(properties.has('Property0')).toBe(false);

      // Ensure the "set" method works (though in practice, prefer "getOrCreate")
      const property1 = new gd.PropertyDescriptor('Hello Property1');
      properties.set('Property1', property1);
      property1.delete();

      expect(properties.get('Property1').getValue()).toBe('Hello Property1');
      expect(properties.get('Property1').getType()).toBe('string');
      properties.get('Property1').setValue('Hello modified Property1');
      expect(properties.get('Property1').getValue()).toBe(
        'Hello modified Property1'
      );
      expect(properties.keys().toJSArray()).not.toContain('Property0');
      expect(properties.keys().toJSArray()).toContain('Property1');

      // Ensure the "getOrCreate" method works
      expect(properties.has('Property0')).toBe(false);
      properties
        .getOrCreate('Property0')
        .setValue('Hello Property0')
        .setType('another type')
        .addExtraInfo('Info1')
        .addExtraInfo('Info3');
      expect(properties.has('Property0')).toBe(true);
      expect(properties.get('Property0').getValue()).toBe('Hello Property0');
      expect(properties.get('Property0').getType()).toBe('another type');
      expect(properties.get('Property0').getExtraInfo().toJSArray()).toContain(
        'Info1'
      );
      expect(
        properties.get('Property0').getExtraInfo().toJSArray()
      ).not.toContain('Info2');
      expect(properties.get('Property0').getExtraInfo().toJSArray()).toContain(
        'Info3'
      );
      expect(properties.has('Property0')).toBe(true);
      expect(properties.has('Property1')).toBe(true);
      expect(properties.keys().toJSArray()).toContain('Property0');
      expect(properties.keys().toJSArray()).toContain('Property1');
      properties.delete();
    });
  });

  describe('gd.BehaviorJsImplementation', function () {
    it('can declare a gd.BehaviorJsImplementation and pass sanity checks', function () {
      let myBehavior = new gd.BehaviorJsImplementation();
      myBehavior.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'My first property') {
          behaviorContent.setStringAttribute('property1', newValue);
          return true;
        }
        if (propertyName === 'My other property') {
          behaviorContent.setBoolAttribute('property2', newValue === '1');
          return true;
        }

        return false;
      };
      myBehavior.getProperties = function (behaviorContent) {
        let properties = new gd.MapStringPropertyDescriptor();

        properties
          .getOrCreate('My first property')
          .setValue(behaviorContent.getStringAttribute('property1'));
        properties
          .getOrCreate('My other property')
          .setValue(behaviorContent.getBoolAttribute('property2') ? '1' : '0')
          .setType('Boolean');

        return properties;
      };
      myBehavior.initializeContent = function (behaviorContent) {
        behaviorContent.setStringAttribute('property1', 'Initial value 1');
        behaviorContent.setBoolAttribute('property2', true);
      };

      try {
        expect(
          gd.ProjectHelper.sanityCheckBehaviorProperty(
            myBehavior,
            'My first property',
            'Value1'
          )
        ).toBe('');
        expect(
          gd.ProjectHelper.sanityCheckBehaviorProperty(
            myBehavior,
            'My other property',
            '0'
          )
        ).toBe('');
      } catch (ex) {
        console.error(ex);

        throw Error(
          'Exception caught while launching sanityCheckBehavior on a gd.BehaviorJsImplementation.'
        );
      }
    });
  });

  describe('gd.Object', function () {
    let project = null;
    let layout = null;
    let object = null;
    let object2 = null;

    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      object2 = layout.insertNewObject(project, 'Sprite', 'MyObject2', 1);
    });

    it('has properties and initial values', function () {
      object.setName('TheObject');
      expect(object.getName()).toBe('TheObject');
      expect(object.hasBehaviorNamed('DoNotExists')).toBe(false);
    });

    it('can have its type retrieved with gd.getTypeOfObject', function () {
      expect(gd.getTypeOfObject(project, layout, 'TheObject', true)).toBe(
        'Sprite'
      );
    });

    it('can have behaviors', function () {
      let behavior = object.addNewBehavior(
        project,
        'DraggableBehavior::Draggable',
        'Draggable'
      );
      expect(object.hasBehaviorNamed('Draggable')).toBe(true);
      expect(object.getBehavior('Draggable')).toBe(behavior);
    });

    const spriteDefaultBehaviorCount = 6;

    it('can have its behaviors retrieved with gd.getBehaviorsOfObject', function () {
      let behaviors = gd.getBehaviorsOfObject(
        project,
        layout,
        'TheObject',
        true
      );
      expect(behaviors.size()).toBe(1 + spriteDefaultBehaviorCount);
      expect(behaviors.get(1)).toBe('Draggable');
    });

    it('can be un/serialized (basic)', function () {
      let serializerElement = new gd.SerializerElement();
      object.serializeTo(serializerElement);
      object2.unserializeFrom(project, serializerElement);
      object2.unserializeFrom(project, serializerElement); // Also check that multiple
      object2.unserializeFrom(project, serializerElement); // unserialization is idempotent
      serializerElement.delete();

      //Check that behaviors were persisted and restored
      let behaviors = object2.getAllBehaviorNames();
      expect(behaviors.size()).toBe(1 + spriteDefaultBehaviorCount);
      expect(behaviors.at(1)).toBe('Draggable');
    });

    it('can be un/serialized (with behavior content)', function () {
      const behaviorContent = object.getBehavior('Draggable');
      behaviorContent.updateProperty('checkCollisionMask', 'true');

      let serializerElement = new gd.SerializerElement();
      object.serializeTo(serializerElement);
      object2.unserializeFrom(project, serializerElement);
      object2.unserializeFrom(project, serializerElement); // Also check that multiple
      object2.unserializeFrom(project, serializerElement); // unserialization is idempotent
      serializerElement.delete();

      //Check that behaviors were persisted and restored
      let behaviors = object2.getAllBehaviorNames();
      expect(behaviors.size()).toBe(1 + spriteDefaultBehaviorCount);
      expect(behaviors.at(1)).toBe('Draggable');

      const behaviorContent2 = object2.getBehavior('Draggable');
      expect(
        behaviorContent2.getProperties().get('checkCollisionMask').getValue()
      ).toBe('true');
    });

    afterAll(function () {
      project.delete();
    });
  });

  describe('gd.ObjectJsImplementation', function () {
    const createSampleObjectJsImplementation = () => {
      let myObject = new gd.ObjectJsImplementation();
      myObject.updateProperty = function (content, propertyName, newValue) {
        if (propertyName === 'My first property') {
          content.property1 = newValue;
          return true;
        }
        if (propertyName === 'My other property') {
          content.property2 = newValue === '1';
          return true;
        }

        return false;
      };
      myObject.getProperties = function (content) {
        let properties = new gd.MapStringPropertyDescriptor();

        properties.getOrCreate('My first property').setValue(content.property1);
        properties
          .getOrCreate('My other property')
          .setValue(content.property2 ? '1' : '0')
          .setType('Boolean');

        return properties;
      };
      myObject.setRawJSONContent(
        JSON.stringify({
          property1: 'Initial value 1',
          property2: true,
        })
      );

      myObject.updateInitialInstanceProperty = function (
        content,
        instance,
        propertyName,
        newValue,
        project,
        layout
      ) {
        if (propertyName === 'My instance property') {
          instance.setRawStringProperty('instanceprop1', newValue);
          return true;
        }
        if (propertyName === 'My other instance property') {
          instance.setRawDoubleProperty('instanceprop2', parseFloat(newValue));
          return true;
        }

        return false;
      };
      myObject.getInitialInstanceProperties = function (
        content,
        instance,
        project,
        layout
      ) {
        let properties = new gd.MapStringPropertyDescriptor();

        properties
          .getOrCreate('My instance property')
          .setValue(instance.getRawStringProperty('instanceprop1'));
        properties
          .getOrCreate('My other instance property')
          .setValue(instance.getRawDoubleProperty('instanceprop2').toString())
          .setType('number');

        return properties;
      };

      // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
      // and associated methods are redefined in JS, they have different arguments (
      // see ObjectJsImplementation C++ implementation). If called directly here from JS,
      // the arguments will be mismatched. To workaround this, always case the object to
      // a base gdObject to ensure C++ methods are called.
      return gd.castObject(myObject, gd.ObjectConfiguration);
    };

    it('can create a gd.ObjectJsImplementation and pass sanity checks', function () {
      const myObject = createSampleObjectJsImplementation();

      try {
        expect(
          gd.ProjectHelper.sanityCheckObjectProperty(
            myObject,
            'My first property',
            'Value1'
          )
        ).toBe('');
        expect(
          gd.ProjectHelper.sanityCheckObjectProperty(
            myObject,
            'My other property',
            '0'
          )
        ).toBe('');
        expect(
          gd.ProjectHelper.sanityCheckObjectInitialInstanceProperty(
            myObject,
            'My instance property',
            'Value1'
          )
        ).toBe('');
        expect(
          gd.ProjectHelper.sanityCheckObjectInitialInstanceProperty(
            myObject,
            'My other instance property',
            '0'
          )
        ).toBe('');
      } catch (ex) {
        console.error(ex);

        throw Error(
          'Exception caught while launching sanityCheckObject on a gd.ObjectJsImplementation.'
        );
      }
    });

    it('can clone a gd.ObjectJsImplementation', function () {
      const object1 = createSampleObjectJsImplementation();
      expect(
        object1.getProperties().get('My first property').getValue() ==
          'Initial value 1'
      );

      object1.updateProperty('My first property', 'test1');
      const object2 = object1.clone().release();
      const object3 = object1.clone().release();

      {
        const propertiesObject1 = object1.getProperties();
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() == 'test1'
        );
        const propertiesObject2 = object2.getProperties();
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() == 'test1'
        );
      }

      {
        object1.updateProperty('My first property', 'updated value');
        const propertiesObject1 = object1.getProperties();
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() ==
            'updated value'
        );
        const propertiesObject2 = object2.getProperties();
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() == 'test1'
        );
      }

      {
        object2.updateProperty('My first property', 'updated value object 2');
        const propertiesObject1 = object1.getProperties();
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() ==
            'updated value'
        );
        const propertiesObject2 = object2.getProperties();
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() ==
            'updated value object 2'
        );
        const propertiesObject3 = object3.getProperties();
        expect(propertiesObject3.has('My first property'));
        expect(
          propertiesObject3.get('My first property').getValue() == 'test1'
        );
      }
    });
  });

  describe('gd.ObjectGroupsContainer', function () {
    let container = null;
    let group1 = null;
    let group2 = null;
    let group3 = null;

    beforeAll(() => (container = new gd.ObjectGroupsContainer()));

    it('can have groups inserted', function () {
      group1 = container.insertNew('Group1', 0);
      group2 = container.insertNew('Group2', 1);
      group3 = container.insertNew('Group3', 2);

      expect(container.getAt(0).getName()).toBe('Group1');
      expect(container.getAt(1).getName()).toBe('Group2');
      expect(container.getAt(2).getName()).toBe('Group3');
      expect(container.has('Group1')).toBe(true);
      expect(container.has('Group2')).toBe(true);
      expect(container.has('Group3')).toBe(true);
      expect(container.has('Group4')).toBe(false);
      expect(container.get('Group1').getName()).toBe('Group1');
      expect(container.get('Group2').getName()).toBe('Group2');
      expect(container.get('Group3').getName()).toBe('Group3');
      expect(container.count()).toBe(3);
    });

    it('can move groups', function () {
      container.move(0, 1);
      expect(container.getAt(0).getName()).toBe('Group2');
      expect(container.getAt(1).getName()).toBe('Group1');
      expect(container.getAt(2).getName()).toBe('Group3');
    });

    it('can rename groups', function () {
      container.rename('Inexisting', 'Whatever');
      container.rename('Group1', 'Group1Renamed');

      expect(container.has('Group1')).toBe(false);
      expect(container.has('Group1Renamed')).toBe(true);
    });

    it('can remove groups', function () {
      container.remove('Group2');
      expect(container.has('Group2')).toBe(false);
      expect(container.has('Group3')).toBe(true);
      expect(container.count()).toBe(2);
    });
  });

  describe('gd.Instruction', function () {
    it('initial values', function () {
      let instr = new gd.Instruction();
      expect(instr.getParametersCount()).toBe(0);
      expect(instr.getSubInstructions().size()).toBe(0);
      instr.delete();
    });
    it('setting parameters', function () {
      let instr = new gd.Instruction();
      instr.setParametersCount(3);
      expect(instr.getParametersCount()).toBe(3);
      expect(instr.getParameter(1).getPlainString()).toBe('');
      instr.setParameter(2, 'MyValue');
      expect(instr.getParameter(2).getPlainString()).toBe('MyValue');
      instr.delete();
    });
    it('can be cloned', function () {
      let instr = new gd.Instruction();
      instr.setParametersCount(3);
      instr.setParameter(2, 'MyValue');

      let newInstr = instr.clone();
      expect(newInstr.getParametersCount()).toBe(3);
      expect(newInstr.getParameter(1).getPlainString()).toBe('');
      expect(newInstr.getParameter(2).getPlainString()).toBe('MyValue');

      newInstr.setParameter(2, 'MyChangedValue');
      expect(instr.getParameter(2).getPlainString()).toBe('MyValue');
      expect(newInstr.getParameter(2).getPlainString()).toBe('MyChangedValue');
      newInstr.delete();
      expect(instr.getParameter(2).getPlainString()).toBe('MyValue');

      instr.delete();
    });
  });

  describe('gd.InstructionsList', function () {
    let list = null;
    beforeAll(() => (list = new gd.InstructionsList()));

    it('can insert instructions', function () {
      expect(list.size()).toBe(0);
      list.insert(new gd.Instruction(), 0);
      expect(list.size()).toBe(1);
    });
    it('can modify its instructions', function () {
      expect(list.get(0).getType()).toBe('');

      let newInstr = new gd.Instruction();
      newInstr.setType('Type2');
      list.set(0, newInstr);

      expect(list.get(0).getType()).toBe('Type2');
      expect(list.size()).toBe(1);
    });
    it('can remove its instructions', function () {
      let newInstr = new gd.Instruction();
      newInstr.setType('Type3');
      let instruction = list.insert(newInstr, 1);
      expect(list.get(1).getType()).toBe('Type3');
      expect(list.size()).toBe(2);
      expect(list.contains(instruction)).toBe(true);

      list.remove(instruction);
      expect(list.size()).toBe(1);
      expect(list.get(0).getType()).toBe('Type2');
    });
    it('can clear its instructions', function () {
      list.clear();
      expect(list.size()).toBe(0);
    });
    it('can insert events from another list', function () {
      let list1 = new gd.InstructionsList();
      let list2 = new gd.InstructionsList();

      let newInstr = new gd.Instruction();
      newInstr.setType('Type1');
      list1.insert(newInstr, 0);
      let newInstr2 = new gd.Instruction();
      newInstr2.setType('Type2');
      list1.insert(newInstr2, 1);

      list2.insertInstructions(list1, 0, list1.size(), 0);
      expect(list2.size()).toBe(2);
      expect(list2.get(0).getType()).toBe('Type1');
      expect(list2.get(1).getType()).toBe('Type2');

      list2.insertInstructions(list1, 0, list1.size(), 1);
      expect(list2.size()).toBe(4);
      expect(list2.get(0).getType()).toBe('Type1');
      expect(list2.get(1).getType()).toBe('Type1');
      expect(list2.get(2).getType()).toBe('Type2');
      expect(list2.get(3).getType()).toBe('Type2');
      list1.delete();
      list2.delete();
    });
    it('can be un/serialized', function () {
      let newInstr = new gd.Instruction();
      newInstr.setType('Type1');
      newInstr.setParametersCount(2);
      newInstr.setParameter(0, 'Param1');
      newInstr.setParameter(1, 'Param2');
      let instruction = list.insert(newInstr, 1);

      let newInstr2 = new gd.Instruction();
      newInstr2.setType('Type2');
      newInstr2.setParametersCount(1);
      newInstr2.setParameter(0, 'Param3');
      let instruction2 = list.insert(newInstr2, 1);

      let project = gd.ProjectHelper.createNewGDJSProject();
      let serializerElement = new gd.SerializerElement();
      list.serializeTo(serializerElement);

      let list2 = new gd.InstructionsList();
      list2.unserializeFrom(project, serializerElement);

      expect(list2.size()).toBe(2);
      expect(list2.get(0).getType()).toBe('Type1');
      expect(list2.get(1).getType()).toBe('Type2');
      expect(list2.get(0).getParametersCount()).toBe(2);
      expect(list2.get(1).getParametersCount()).toBe(1);
      expect(list2.get(0).getParameter(0).getPlainString()).toBe('Param1');
      expect(list2.get(0).getParameter(1).getPlainString()).toBe('Param2');
      expect(list2.get(1).getParameter(0).getPlainString()).toBe('Param3');

      list2.delete();
      project.delete();
    });

    afterAll(function () {
      list.delete();
    });
  });

  describe('InstructionSentenceFormatter', function () {
    it('should translate instructions (plain text or into a vector of text with formatting)', function () {
      let action = new gd.Instruction(); //Create a simple instruction
      action.setType('Delete');
      action.setParametersCount(2);
      action.setParameter(0, 'MyCharacter');

      let formattedTexts = gd.InstructionSentenceFormatter.get().getAsFormattedText(
        action,
        gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), 'Delete')
      );

      expect(formattedTexts.size()).toBe(2);
      expect(formattedTexts.getString(0)).toBe('Delete ');
      expect(formattedTexts.getString(1)).toBe('MyCharacter');
      expect(formattedTexts.getTextFormatting(0).getUserData()).not.toBe(0);
      expect(formattedTexts.getTextFormatting(1).getUserData()).toBe(0);

      action.delete();
    });
  });

  describe('EventsRefactorer', function () {
    describe('SearchInEvents', function () {
      let eventList = null;
      let event1 = null;
      let event2 = null;

      beforeAll(() => {
        eventList = new gd.EventsList();

        /* Event 1 */
        {
          const event = new gd.StandardEvent();

          let eventActions1 = event.getActions();
          let action1 = new gd.Instruction();
          action1.setType('RotateTowardPosition'); // should generate the sentence `Rotate _PARAM0_ towards _PARAM1_;_PARAM2_ at speed _PARAM3_deg/second`
          action1.setParametersCount(4);
          action1.setParameter(0, 'Platform');
          action1.setParameter(1, '450');
          action1.setParameter(2, '200');
          action1.setParameter(3, '90');
          eventActions1.push_back(action1);

          let eventConditions1 = event.getConditions();
          let condition1 = new gd.Instruction();
          condition1.setType('PosX'); // should generate the sentence `the X position of _PARAM0_ _PARAM1_ _PARAM2_`
          condition1.setParametersCount(3);
          condition1.setParameter(0, 'MyCharacter');
          condition1.setParameter(1, '<');
          condition1.setParameter(2, '300');
          eventConditions1.push_back(condition1);

          event1 = eventList.insertEvent(event, 0);
          action1.delete();
          condition1.delete();
        }

        /* Event 2 */
        {
          const event = new gd.StandardEvent();

          let eventActions2 = event.getActions();
          let action2 = new gd.Instruction();
          action2.setType('Delete'); // should generate the sentence `Delete _PARAM0_`
          action2.setParametersCount(1);
          action2.setParameter(0, 'OtherCharacter');
          eventActions2.push_back(action2);

          let eventConditions2 = event.getConditions();
          let condition2 = new gd.Instruction();
          condition2.setType('Angle'); // should generate the sentence `the angle (in degrees) of _PARAM0_ _PARAM1_ _PARAM2_`
          condition2.setParametersCount(3);
          condition2.setParameter(0, 'OtherPlatform');
          condition2.setParameter(1, '>');
          condition2.setParameter(2, '55');
          eventConditions2.push_back(condition2);

          event2 = eventList.insertEvent(event, 0);
          action2.delete();
          condition2.delete();
        }
      });

      afterAll(() => {
        eventList.delete();
      });

      it('should search string in parameters only and respect case', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'mycharacter',
          true,
          true,
          true,
          false,
          false
        );
        expect(searchResultEvents1.size()).toBe(0);
        const searchResultEvents2 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'MyCharacter',
          true,
          true,
          true,
          false,
          false
        );
        expect(searchResultEvents2.size()).toBe(1);
        expect(searchResultEvents2.at(0).getEvent()).toBe(event1);
      });

      it('should search string in parameters only', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'mycharacter',
          false,
          true,
          true,
          false,
          false
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event1);

        const searchResultEvents2 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'position',
          false,
          true,
          true,
          false,
          false
        );
        expect(searchResultEvents2.size()).toBe(0);
      });

      it('should search string in sentences', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'In Degrees',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event2);
      });

      it('should search string in sentences with parameter placeholders replaced', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'position of MyCharacter',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event1);
      });

      it('should search string in sentences with parameter placeholders replaced and special characters removed', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'towards 450200',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event1);
      });

      it('should search string in sentences with parameter placeholders replaced and special characters removed in searched string', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'towards 450;200',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event1);
      });

      it('should search string in sentences with parameter placeholders replaced and consecutive special characters removed in searched string', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'towards 450();200',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event1);
      });

      it('should search string in sentences with multiple adjacent spaces reduced to one space', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'the    angle  (in  ',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event2);
      });
      it('should search string in sentences with leading and trailing white spaces', function () {
        const searchResultEvents1 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          '   the    angle  (in  ',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents1.size()).toBe(1);
        expect(searchResultEvents1.at(0).getEvent()).toBe(event2);

        const searchResultEvents2 = gd.EventsRefactorer.searchInEvents(
          gd.JsPlatform.get(),
          eventList,
          'Delete OtherCharacter    ',
          false,
          true,
          true,
          false,
          true
        );
        expect(searchResultEvents2.size()).toBe(1);
        expect(searchResultEvents2.at(0).getEvent()).toBe(event2);
      });
    });
  });

  describe('gd.EventsList', function () {
    it('can have events', function () {
      let list = new gd.EventsList();
      list.insertEvent(new gd.StandardEvent(), 0);
      let lastEvent = list.insertEvent(new gd.StandardEvent(), 1);
      list.insertEvent(new gd.StandardEvent(), 1);
      expect(list.getEventsCount()).toBe(3);
      expect(list.getEventAt(2).ptr).toBe(lastEvent.ptr);
      list.delete();
    });

    it('can create lots of new events', function () {
      let project = new gd.ProjectHelper.createNewGDJSProject();
      let list = new gd.EventsList();
      for (let i = 0; i < 500; ++i) {
        let evt = list.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        expect(evt.getType()).toBe('BuiltinCommonInstructions::Standard');
        expect(gd.asStandardEvent(list.getEventAt(0)).getType()).toBe(
          'BuiltinCommonInstructions::Standard'
        );
        expect(list.getEventAt(0).getType()).toBe(
          'BuiltinCommonInstructions::Standard'
        );
      }
      project.delete();
      list.delete();
    });

    it('can tell if it contains an event', function () {
      let list = new gd.EventsList();

      let parentEvent = list.insertEvent(new gd.StandardEvent(), 0);
      let subEvent = parentEvent
        .getSubEvents()
        .insertEvent(new gd.StandardEvent(), 0);

      expect(list.contains(parentEvent, false)).toBe(true);
      expect(list.contains(subEvent, false)).toBe(false);
      expect(list.contains(subEvent, true)).toBe(true);

      list.delete();
    });

    it('can move an event to another list without invalidating it/copying it in memory', function () {
      let list1 = new gd.EventsList();
      let list2 = new gd.EventsList();

      let list1ParentEvent = list1.insertEvent(new gd.StandardEvent(), 0);
      let list2ParentEvent = list2.insertEvent(new gd.StandardEvent(), 0);
      let originalSubEvent = list1ParentEvent
        .getSubEvents()
        .insertEvent(new gd.StandardEvent(), 0);
      let originalSubEventPtr = originalSubEvent.ptr;

      expect(
        list1ParentEvent
          .getSubEvents()
          .moveEventToAnotherEventsList(
            originalSubEvent,
            list2ParentEvent.getSubEvents(),
            0
          )
      ).toBe(true);
      expect(list2ParentEvent.getSubEvents().getEventsCount()).toBe(1);
      let movedSubEvent = list2ParentEvent.getSubEvents().getEventAt(0);
      expect(movedSubEvent.ptr).toBe(originalSubEventPtr);

      list1.delete();
      list2.delete();
    });
  });

  describe('gd.BaseEvent', function () {
    it('can have a type', function () {
      let event = new gd.BaseEvent();
      event.setType('Type1');
      let event2 = new gd.BaseEvent();
      event2.setType('Type2');

      expect(event.getType()).toBe('Type1');
      expect(event2.getType()).toBe('Type2');

      event.delete();
      event2.delete();
    });

    it('can be cloned', function () {
      let event = new gd.BaseEvent();
      event.setType('Type1');
      let event2 = event.clone();

      expect(event.getType()).toBe('Type1');
      expect(event2.getType()).toBe('Type1');

      event.delete();
      event2.delete();
    });

    it('can be de/serialized', function () {
      let event = new gd.BaseEvent();
      expect(typeof event.serializeTo).toBe('function');
      expect(typeof event.unserializeFrom).toBe('function');
      event.delete();
    });
  });

  describe('gd.ArbitraryEventsWorker', function () {
    describe('gd.EventsParametersLister', function () {
      it('can list parameters and their types', function () {
        let project = new gd.ProjectHelper.createNewGDJSProject();
        let list = new gd.EventsList();

        let evt = new gd.StandardEvent();
        let actions = evt.getActions();
        let act = new gd.Instruction();
        act.setType('Delete');
        act.setParametersCount(1);
        act.setParameter(0, 'MyObject');
        actions.push_back(act);
        evt = list.insertEvent(evt, 0);

        let subEvt = new gd.StandardEvent();
        let conditions = subEvt.getConditions();
        let cnd = new gd.Instruction();
        cnd.setType('PosX');
        cnd.setParametersCount(3);
        cnd.setParameter(0, 'MyObject');
        cnd.setParameter(1, '<');
        cnd.setParameter(2, '300');
        conditions.push_back(cnd);
        evt.getSubEvents().insertEvent(subEvt, 0);

        let parametersLister = new gd.EventsParametersLister(project);
        parametersLister.launch(list);

        expect(parametersLister.getParametersAndTypes().keys().size()).toBe(3);
        expect(parametersLister.getParametersAndTypes().get('MyObject')).toBe(
          'object'
        );
        // There are a lot of parameter definitions with 'expression' instead
        // of 'number'. They both means the same thing but 'expression' is
        // deprecated.
        expect(parametersLister.getParametersAndTypes().get('300')).toBe(
          'number'
        );

        project.delete();
        list.delete();
      });
    });

    describe('gd.EventsPositionFinder', function () {
      it('can find positions of a list of given events', function () {
        // evt0
        // ├── evt00 <------- 0
        // │   ├── evt000
        // │   ├── evt001
        // │   └── evt002 <-- 1
        // ├── evt01
        // │   └── evt010 <-- 2
        // └── evt02
        //     └── evt020
        // evt1 <------------ 3
        // └── evt10 <------- 4
        const events = new gd.EventsList();

        let evt0 = new gd.StandardEvent();
        evt0 = events.insertEvent(evt0, 0);
        let evt1 = new gd.StandardEvent();
        evt1 = events.insertEvent(evt1, 1);

        let evt00 = new gd.StandardEvent();
        evt00 = evt0.getSubEvents().insertEvent(evt00, 0);
        let evt000 = new gd.StandardEvent();
        let evt001 = new gd.StandardEvent();
        let evt002 = new gd.StandardEvent();
        evt000 = evt00.getSubEvents().insertEvent(evt000, 0);
        evt001 = evt00.getSubEvents().insertEvent(evt001, 1);
        evt002 = evt00.getSubEvents().insertEvent(evt002, 2);

        let evt01 = new gd.StandardEvent();
        evt01 = evt0.getSubEvents().insertEvent(evt01, 1);
        let evt010 = new gd.StandardEvent();
        evt010 = evt01.getSubEvents().insertEvent(evt010, 0);

        let evt02 = new gd.StandardEvent();
        evt02 = evt0.getSubEvents().insertEvent(evt02, 2);
        let evt020 = new gd.StandardEvent();
        evt020 = evt02.getSubEvents().insertEvent(evt020, 0);

        let evt10 = new gd.StandardEvent();
        evt10 = evt1.getSubEvents().insertEvent(evt10, 0);

        const missingEvent = new gd.StandardEvent();

        const positionFinder = new gd.EventsPositionFinder();
        positionFinder.addEventToSearch(evt00);
        positionFinder.addEventToSearch(evt10);
        positionFinder.addEventToSearch(evt1);
        positionFinder.addEventToSearch(evt002);
        positionFinder.addEventToSearch(evt010);
        positionFinder.addEventToSearch(missingEvent);
        positionFinder.launch(events);

        expect(positionFinder.getPositions().size()).toBe(6);
        expect(positionFinder.getPositions().toJSArray()).toEqual([
          1,
          10,
          9,
          4,
          6,
          -1,
        ]);

        events.delete();
      });
    });
  });

  describe('gd.GroupEvent', function () {
    it('handle basic properties', function () {
      const evt = new gd.GroupEvent();
      evt.setName('MyName');
      evt.setSource('http://source.url');
      evt.setCreationTimestamp(150);
      expect(evt.getName()).toBe('MyName');
      expect(evt.getSource()).toBe('http://source.url');
      expect(evt.getCreationTimestamp()).toBe(150);
    });
    it('can be folded', function () {
      const evt = new gd.GroupEvent();
      expect(evt.isFolded()).toBe(false);
      evt.setFolded(true);
      expect(evt.isFolded()).toBe(true);
    });
    it('can remember parameters used to create the group from a template event', function () {
      const evt = new gd.GroupEvent();
      let parameters = evt.getCreationParameters();
      parameters.push_back('Param1');
      parameters.push_back('Param2');

      expect(evt.getCreationParameters().size()).toBe(2);
      expect(evt.getCreationParameters().get(0)).toBe('Param1');
      expect(evt.getCreationParameters().get(1)).toBe('Param2');

      parameters.clear();
      expect(evt.getCreationParameters().size()).toBe(0);
      parameters.push_back('Param1');
      expect(evt.getCreationParameters().get(0)).toBe('Param1');
    });
  });

  describe('gd.StandardEvent', function () {
    it('initial values', function () {
      const evt = new gd.StandardEvent();
      expect(evt.canHaveSubEvents()).toBe(true);
      expect(evt.isExecutable()).toBe(true);
      evt.delete();
    });
    it('conditions and actions', function () {
      const evt = new gd.StandardEvent();
      let conditions = evt.getConditions();
      expect(evt.getConditions().size()).toBe(0);
      let cnd = new gd.Instruction();
      conditions.push_back(cnd);
      expect(evt.getConditions().size()).toBe(1);

      let actions = evt.getActions();
      expect(evt.getActions().size()).toBe(0);
      let act = new gd.Instruction();
      actions.push_back(act);
      expect(evt.getActions().size()).toBe(1);
      evt.delete();
    });
  });
  describe('gd.CommentEvent', function () {
    it('initial values', function () {
      const evt = new gd.CommentEvent();
      expect(evt.canHaveSubEvents()).toBe(false);
      expect(evt.isExecutable()).toBe(false);
    });
    it('can have a comment', function () {
      const evt = new gd.CommentEvent();
      evt.setComment('My nice comment about my events!');
      expect(evt.getComment()).toBe('My nice comment about my events!');
    });
    it('can have a comment with UTF8 characters', function () {
      const evt = new gd.CommentEvent();
      evt.setComment('Hello 官话 world!');
      expect(evt.getComment()).toBe('Hello 官话 world!');
    });
    it('can have a background color', function () {
      const evt = new gd.CommentEvent();
      evt.setBackgroundColor(100, 200, 255);
      expect(evt.getBackgroundColorRed()).toBe(100);
      expect(evt.getBackgroundColorGreen()).toBe(200);
      expect(evt.getBackgroundColorBlue()).toBe(255);
    });
    it('can have a text color', function () {
      const evt = new gd.CommentEvent();
      evt.setTextColor(101, 201, 254);
      expect(evt.getTextColorRed()).toBe(101);
      expect(evt.getTextColorGreen()).toBe(201);
      expect(evt.getTextColorBlue()).toBe(254);
    });
  });

  describe('gd.SpriteObject', function () {
    it('is a gd.Object', function () {
      const project = new gd.ProjectHelper.createNewGDJSProject();
      let object = project.insertNewObject(project, 'Sprite', 'MySpriteObject');

      expect(object instanceof gd.Object).toBe(true);
      expect(object.getVariables()).toBeTruthy();
      project.delete();
    });

    it('can have animations', function () {
      const obj = new gd.SpriteObject();
      const animations = obj.getAnimations();
      animations.addAnimation(new gd.Animation());
      animations.addAnimation(new gd.Animation());
      expect(animations.getAnimationsCount()).toBe(2);
      animations.removeAnimation(1);
      expect(animations.getAnimationsCount()).toBe(1);
    });

    it('can swap animations', function () {
      const obj = new gd.SpriteObject();
      const animations = obj.getAnimations();
      animations.removeAllAnimations();
      let anim1 = new gd.Animation();
      let anim2 = new gd.Animation();
      let sprite1 = new gd.Sprite();
      let sprite2 = new gd.Sprite();

      sprite1.setImageName('image1');
      sprite2.setImageName('image2');

      anim1.setDirectionsCount(1);
      anim2.setDirectionsCount(1);
      anim1.getDirection(0).addSprite(sprite1);
      anim2.getDirection(0).addSprite(sprite2);

      animations.addAnimation(anim1);
      animations.addAnimation(anim2);
      expect(
        animations.getAnimation(0).getDirection(0).getSprite(0).getImageName()
      ).toBe('image1');
      animations.swapAnimations(0, 1);
      expect(
        animations.getAnimation(0).getDirection(0).getSprite(0).getImageName()
      ).toBe('image2');
    });

    describe('gd.Direction', function () {
      it('can swap sprites', function () {
        const direction = new gd.Direction();
        const sprite1 = new gd.Sprite();
        const sprite2 = new gd.Sprite();
        sprite1.setImageName('image1');
        sprite2.setImageName('image2');
        direction.addSprite(sprite1);
        direction.addSprite(sprite2);

        expect(direction.getSprite(0).getImageName()).toBe('image1');
        direction.swapSprites(0, 1);
        expect(direction.getSprite(0).getImageName()).toBe('image2');
        direction.swapSprites(1, 0);
        expect(direction.getSprite(0).getImageName()).toBe('image1');
        direction.delete();
      });

      it('can move sprites', function () {
        const direction = new gd.Direction();
        const sprite1 = new gd.Sprite();
        const sprite2 = new gd.Sprite();
        const sprite3 = new gd.Sprite();
        sprite1.setImageName('image1');
        sprite2.setImageName('image2');
        sprite3.setImageName('image3');
        direction.addSprite(sprite1);
        direction.addSprite(sprite2);
        direction.addSprite(sprite3);

        expect(direction.getSprite(0).getImageName()).toBe('image1');
        direction.moveSprite(0, 2);
        expect(direction.getSprite(0).getImageName()).toBe('image2');
        expect(direction.getSprite(1).getImageName()).toBe('image3');
        expect(direction.getSprite(2).getImageName()).toBe('image1');
        direction.swapSprites(1, 1);
        expect(direction.getSprite(0).getImageName()).toBe('image2');
        expect(direction.getSprite(1).getImageName()).toBe('image3');
        expect(direction.getSprite(2).getImageName()).toBe('image1');
        direction.swapSprites(1, 0);
        expect(direction.getSprite(0).getImageName()).toBe('image3');
        expect(direction.getSprite(1).getImageName()).toBe('image2');
        expect(direction.getSprite(2).getImageName()).toBe('image1');
        direction.swapSprites(999, 998);
        expect(direction.getSprite(0).getImageName()).toBe('image3');
        expect(direction.getSprite(1).getImageName()).toBe('image2');
        expect(direction.getSprite(2).getImageName()).toBe('image1');
        direction.delete();
      });

      it('can have metadata', function () {
        const direction = new gd.Direction();
        expect(direction.getMetadata()).toBe('');
        direction.setMetadata('{test: 1}');
        expect(direction.getMetadata()).toBe('{test: 1}');
        direction.delete();
      });
    });

    describe('gd.Sprite', function () {
      it('can have default points', function () {
        let sprite1 = new gd.Sprite();
        sprite1.getCenter().setX(2);
        sprite1.getCenter().setY(3);
        sprite1.getOrigin().setX(4);
        sprite1.getOrigin().setY(5);
        expect(sprite1.getCenter().getX()).toBe(2);
        expect(sprite1.getCenter().getY()).toBe(3);
        expect(sprite1.getOrigin().getX()).toBe(4);
        expect(sprite1.getOrigin().getY()).toBe(5);
      });

      it('can have custom points', function () {
        let sprite1 = new gd.Sprite();
        let point = new gd.Point('test');
        sprite1.addPoint(point);
        point.delete();

        expect(sprite1.hasPoint('test')).toBe(true);
        sprite1.getPoint('test').setX(1);
        sprite1.getPoint('test').setY(2);
        expect(sprite1.getPoint('test').getX()).toBe(1);
        expect(sprite1.getPoint('test').getY()).toBe(2);
      });
    });
  });

  describe('gd.MetadataProvider', function () {
    it('can return metadata about expressions (even if they do not exist)', function () {
      expect(
        gd.MetadataProvider.getExpressionMetadata(
          gd.JsPlatform.get(),
          'NotExistingExpression'
        ).getFullName()
      ).toBe('');
    });

    describe('gd.ObjectMetadata', function () {
      it('can return standard information about Sprite object', function () {
        let objMetadata = gd.MetadataProvider.getObjectMetadata(
          gd.JsPlatform.get(),
          'Sprite'
        );

        expect(objMetadata.getName()).toBe('Sprite');
        expect(objMetadata.getFullName()).toBe('Sprite');
        expect(objMetadata.getDescription().length).not.toBe(0);
        expect(objMetadata.getIconFilename().length).not.toBe(0);
      });
      it('can have conditions and actions added at the same time for booleans', function () {
        const extension = new gd.PlatformExtension();
        extension.setExtensionInformation(
          'TestExtensionName',
          'Full name of test extension',
          'Description of test extension',
          'Author of test extension',
          'License of test extension'
        );
        const fakeObject = new gd.ObjectJsImplementation();
        const objectMetadata = extension.addObject(
          'FakeObject',
          'FakeObject',
          'This is FakeObject',
          '',
          fakeObject
        );

        objectMetadata
          .addExpressionAndConditionAndAction(
            'boolean',
            'Disabled',
            'Disabled',
            'the object is disabled',
            'disabled',
            '',
            'Disable.png'
          )
          .addParameter('object', 'My object', 'MyObject', false)
          .useStandardParameters(
            'boolean',
            gd.ParameterOptions.makeNewOptions()
          )
          .setFunctionName('setDisabled')
          .setGetter('isDisabled');

        expect(
          objectMetadata
            .getAllConditions()
            .has('TestExtensionName::FakeObject::Disabled')
        ).toBe(true);
        expect(
          objectMetadata
            .getAllActions()
            .has('TestExtensionName::FakeObject::SetDisabled')
        ).toBe(true);

        // Check sentences are properly set up.
        expect(
          objectMetadata
            .getAllConditions()
            .get('TestExtensionName::FakeObject::Disabled')
            .getSentence()
        ).toBe('_PARAM0_ is disabled');
        expect(
          objectMetadata
            .getAllActions()
            .get('TestExtensionName::FakeObject::SetDisabled')
            .getSentence()
        ).toBe('Set _PARAM0_ as disabled: _PARAM1_');
      });
    });
    describe('gd.BehaviorMetadata', function () {
      it('have standard methods to get information', function () {
        let autoMetadata = gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          'NotExistingBehavior'
        );

        expect(autoMetadata.getFullName).not.toBe(undefined);
        expect(autoMetadata.getDefaultName).not.toBe(undefined);
        expect(autoMetadata.getDescription).not.toBe(undefined);
        expect(autoMetadata.getGroup).not.toBe(undefined);
        expect(autoMetadata.getIconFilename).not.toBe(undefined);
        expect(autoMetadata.getObjectType).not.toBe(undefined);
      });
      it('can have conditions and actions added at the same time for booleans', function () {
        const extension = new gd.PlatformExtension();
        extension.setExtensionInformation(
          'TestExtensionName',
          'Full name of test extension',
          'Description of test extension',
          'Author of test extension',
          'License of test extension'
        );
        const dummyBehavior = new gd.BehaviorJsImplementation();
        dummyBehavior.initializeContent = function (behaviorContent) {};
        const behaviorMetadata = extension.addBehavior(
          'DummyBehavior',
          'Dummy behavior for testing',
          'DummyBehavior',
          'Do nothing.',
          '',
          '',
          'DummyBehavior',
          dummyBehavior,
          new gd.BehaviorsSharedData()
        );

        behaviorMetadata
          .addExpressionAndConditionAndAction(
            'boolean',
            'Disabled',
            'Disabled',
            'the object is disabled',
            'disabled',
            '',
            'Disable.png'
          )
          .addParameter('object', 'My object', '', false)
          .useStandardParameters(
            'boolean',
            gd.ParameterOptions.makeNewOptions()
          )
          .setFunctionName('setDisabled')
          .setGetter('isDisabled');

        expect(
          behaviorMetadata
            .getAllConditions()
            .has('TestExtensionName::DummyBehavior::Disabled')
        ).toBe(true);
        expect(
          behaviorMetadata
            .getAllActions()
            .has('TestExtensionName::DummyBehavior::SetDisabled')
        ).toBe(true);

        // Check sentences are properly set up.
        expect(
          behaviorMetadata
            .getAllConditions()
            .get('TestExtensionName::DummyBehavior::Disabled')
            .getSentence()
        ).toBe('_PARAM0_ is disabled');
        expect(
          behaviorMetadata
            .getAllActions()
            .get('TestExtensionName::DummyBehavior::SetDisabled')
            .getSentence()
        ).toBe('Set _PARAM0_ as disabled: _PARAM1_');
      });
    });
    describe('gd.EffectMetadata', function () {
      it('have standard methods to get information', function () {
        let autoMetadata = gd.MetadataProvider.getEffectMetadata(
          gd.JsPlatform.get(),
          'NotExistingEffect'
        );

        expect(autoMetadata.getType).not.toBe(undefined);
        expect(autoMetadata.getFullName).not.toBe(undefined);
        expect(autoMetadata.getDescription).not.toBe(undefined);
        expect(autoMetadata.getProperties).not.toBe(undefined);
      });
    });
  });

  describe('gd.ResourcesMergingHelper (and gd.AbstractFileSystemJS)', function () {
    it('should export files of the project', function () {
      // Create a project with a mix of resources
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('Scene', 0);
      const resource = new gd.ImageResource();
      const resource2 = new gd.ImageResource();
      const resource3 = new gd.ImageResource();
      const resource4 = new gd.ImageResource();
      const resource5 = new gd.ImageResource();
      resource.setName('MyResource');
      resource.setFile('MyResource.png');
      resource2.setName('MyAudioResource');
      resource2.setFile('MyResource.wav');
      resource3.setName('test/MyResource.png');
      resource3.setFile('test/MyResource.png');
      resource4.setName('test/MyResourceWithExtension');
      resource4.setFile('test/MyResourceWithExtension');
      resource5.setName('test/sub/folder/MyResourceWithExtension');
      resource5.setFile('test/sub/folder/MyResourceWithExtension');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);
      project.getResourcesManager().addResource(resource3);
      project.getResourcesManager().addResource(resource4);
      project.getResourcesManager().addResource(resource5);

      const fs = makeFakeAbstractFileSystem(gd, {});

      // Check that ResourcesMergingHelper can update the filenames
      const resourcesMergingHelper = new gd.ResourcesMergingHelper(project.getResourcesManager(), fs);
      resourcesMergingHelper.setBaseDirectory('/my/project/');
      gd.ResourceExposer.exposeWholeProjectResources(
        project,
        resourcesMergingHelper
      );

      const oldAndNewFilenames = resourcesMergingHelper.getAllResourcesOldAndNewFilename();
      expect(oldAndNewFilenames.get('/my/project/MyResource.png')).toBe(
        'MyResource.png'
      );
      expect(oldAndNewFilenames.get('/my/project/MyResource.wav')).toBe(
        'MyResource.wav'
      );
      expect(oldAndNewFilenames.get('/my/project/test/MyResource.png')).toBe(
        'MyResource2.png'
      );
      expect(
        oldAndNewFilenames.get('/my/project/test/MyResourceWithExtension')
      ).toBe('MyResourceWithExtension');
      expect(
        oldAndNewFilenames.get(
          '/my/project/test/sub/folder/MyResourceWithExtension'
        )
      ).toBe('MyResourceWithExtension2');

      resourcesMergingHelper.delete();
      project.delete();
    });
  });

  describe('gd.ProjectResourcesCopier (and gd.AbstractFileSystemJS)', function () {
    it('should export files of the project', function () {
      // Create a project with a mix of resources, stored in /my/project folder.
      const project = new gd.ProjectHelper.createNewGDJSProject();
      project.setProjectFile('/my/project/project.json');
      const layout = project.insertNewLayout('Scene', 0);
      const resource = new gd.ImageResource();
      const resource2 = new gd.ImageResource();
      const resource3 = new gd.ImageResource();
      const resource4 = new gd.ImageResource();
      const resource5 = new gd.ImageResource();
      resource.setName('MyResource');
      resource.setFile('MyResource.png');
      resource2.setName('MyAudioResource');
      resource2.setFile('MyResource.wav');
      resource3.setName('MyAbsoluteResource');
      resource3.setFile('/my/absolute/path/MyResource2.png');
      resource4.setName('test/MyResourceWithoutExtension');
      resource4.setFile('test/MyResourceWithoutExtension');
      resource5.setName('test/sub/folder/MyResourceWithoutExtension');
      resource5.setFile('test/sub/folder/MyResourceWithoutExtension'); // Same filename as resource4
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);
      project.getResourcesManager().addResource(resource3);
      project.getResourcesManager().addResource(resource4);
      project.getResourcesManager().addResource(resource5);

      const fs = makeFakeAbstractFileSystem(gd, {});

      // Check that resources can be copied to another folder:
      // * including absolute files.
      // * preserving relative file structures
      fs.copyFile.mockClear();
      gd.ProjectResourcesCopier.copyAllResourcesTo(
        project,
        fs,
        '/my/new/folder',
        false,
        false,
        true
      );
      expect(fs.copyFile).toHaveBeenCalledTimes(5); // All 5 resources are copied
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.png',
        '/my/new/folder/MyResource.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.wav',
        '/my/new/folder/MyResource.wav'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/absolute/path/MyResource2.png',
        '/my/new/folder/MyResource2.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/MyResourceWithoutExtension',
        '/my/new/folder/test/MyResourceWithoutExtension'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/sub/folder/MyResourceWithoutExtension',
        '/my/new/folder/test/sub/folder/MyResourceWithoutExtension'
      );

      // Check that resources can be copied to another folder:
      // * including absolute files.
      // * NOT preserving relative file structures
      // Check that filename collisions are avoided.
      fs.copyFile.mockClear();
      gd.ProjectResourcesCopier.copyAllResourcesTo(
        project,
        fs,
        '/my/new/folder',
        false,
        false,
        false
      );
      expect(fs.copyFile).toHaveBeenCalledTimes(5); // All 5 resources are copied
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.png',
        '/my/new/folder/MyResource.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.wav',
        '/my/new/folder/MyResource.wav'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/absolute/path/MyResource2.png',
        '/my/new/folder/MyResource2.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/MyResourceWithoutExtension',
        '/my/new/folder/MyResourceWithoutExtension'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/sub/folder/MyResourceWithoutExtension',
        '/my/new/folder/MyResourceWithoutExtension2'
      );

      // Check that resources can be copied to another folder:
      // * without touching absolute files.
      // * preserving relative file structures
      fs.copyFile.mockClear();
      gd.ProjectResourcesCopier.copyAllResourcesTo(
        project,
        fs,
        '/my/new/folder',
        false,
        true,
        true
      );
      expect(fs.copyFile).toHaveBeenCalledTimes(4); // Only the 4 relative resources are copied
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.png',
        '/my/new/folder/MyResource.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.wav',
        '/my/new/folder/MyResource.wav'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/MyResourceWithoutExtension',
        '/my/new/folder/test/MyResourceWithoutExtension'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/sub/folder/MyResourceWithoutExtension',
        '/my/new/folder/test/sub/folder/MyResourceWithoutExtension'
      );

      // Check that resources can be copied to another folder:
      // * without touching absolute files.
      // * NOT preserving relative file structures
      // Check that filename collisions are avoided.
      fs.copyFile.mockClear();
      gd.ProjectResourcesCopier.copyAllResourcesTo(
        project,
        fs,
        '/my/new/folder',
        false,
        true,
        false
      );
      expect(fs.copyFile).toHaveBeenCalledTimes(5); // All 5 resources are copied
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.png',
        '/my/new/folder/MyResource.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/MyResource.wav',
        '/my/new/folder/MyResource.wav'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/absolute/path/MyResource2.png',
        '/my/new/folder/MyResource2.png'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/MyResourceWithoutExtension',
        '/my/new/folder/MyResourceWithoutExtension'
      );
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/my/project/test/sub/folder/MyResourceWithoutExtension',
        '/my/new/folder/MyResourceWithoutExtension2'
      );

      project.delete();
    });
  });

  describe('gd.Exporter (and gd.AbstractFileSystemJS)', function () {
    it('should export a layout for preview', function (done) {
      let fs = new gd.AbstractFileSystemJS();
      let project = new gd.ProjectHelper.createNewGDJSProject();
      let layout = project.insertNewLayout('Scene', 0);

      fs.mkDir = fs.clearDir = function () {};
      fs.getTempDir = function (path) {
        return '/tmp/';
      };
      fs.fileNameFrom = function (fullpath) {
        return path.basename(fullpath);
      };
      fs.dirNameFrom = function (fullpath) {
        return path.dirname(fullpath);
      };
      fs.readDir = function () {
        return new gd.VectorString();
      };
      fs.writeToFile = function (path, content) {
        //Validate that some code have been generated:
        expect(content).toMatch('runtimeScene.getOnceTriggers().startNewFrame');
        done();
      };

      const exporter = new gd.Exporter(fs);
      const previewExportOptions = new gd.PreviewExportOptions(
        project,
        '/path/for/export/'
      );
      previewExportOptions.setLayoutName('Scene');
      exporter.exportProjectForPixiPreview(previewExportOptions);
      previewExportOptions.delete();
      exporter.delete();
    });
  });

  describe('gd.EventsRemover', function () {
    it('should remove events', function () {
      let list = new gd.EventsList();
      let event1 = list.insertEvent(new gd.StandardEvent(), 0);
      let event2 = list.insertEvent(new gd.StandardEvent(), 1);
      let event3 = list.insertEvent(new gd.StandardEvent(), 2);

      let remover = new gd.EventsRemover();
      remover.addEventToRemove(event1);
      remover.addEventToRemove(event3);
      remover.launch(list);

      expect(list.getEventsCount()).toBe(1);
      expect(list.getEventAt(0)).toBe(event2);
    });
  });

  describe('gd.WholeProjectRefactorer', function () {
    it('should rename and delete an object', function () {
      let project = new gd.ProjectHelper.createNewGDJSProject();
      let layout = project.insertNewLayout('Scene', 0);
      let instance1 = layout.getInitialInstances().insertNewInitialInstance();
      let instance2 = layout.getInitialInstances().insertNewInitialInstance();
      instance1.setObjectName('Object1');
      instance2.setObjectName('Object2');

      gd.WholeProjectRefactorer.objectOrGroupRenamedInLayout(
        project,
        layout,
        'Object1',
        'Object3',
        /* isObjectGroup=*/ false
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object1')).toBe(
        false
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object2')).toBe(
        true
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object3')).toBe(
        true
      );

      gd.WholeProjectRefactorer.objectOrGroupRemovedInLayout(
        project,
        layout,
        'Object3',
        /* isObjectGroup=*/ false,
        true
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object1')).toBe(
        false
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object2')).toBe(
        true
      );
      expect(layout.getInitialInstances().hasInstancesOfObject('Object3')).toBe(
        false
      );
    });
    // See other tests in WholeProjectRefactorer.cpp
  });

  describe('gd.ExpressionParser2 and gd.ExpressionValidator', function () {
    let project = null;
    let layout = null;
    beforeAll(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);
    });

    function testExpression(
      type,
      expression,
      expectedError,
      expectedErrorPosition,
      expectedError2,
      expectedErrorPosition2
    ) {
      const parser = new gd.ExpressionParser2();
      const expressionNode = parser.parseExpression(expression).get();

      const expressionValidator = new gd.ExpressionValidator(
        gd.JsPlatform.get(),
        gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
          project,
          layout
        ),
        type
      );
      expressionNode.visit(expressionValidator);
      if (expectedError2) {
        expect(expressionValidator.getAllErrors().size()).toBe(2);
        expect(expressionValidator.getAllErrors().at(0).getMessage()).toBe(
          expectedError
        );
        if (expectedErrorPosition)
          expect(
            expressionValidator.getAllErrors().at(0).getStartPosition()
          ).toBe(expectedErrorPosition);
        expect(expressionValidator.getAllErrors().at(1).getMessage()).toBe(
          expectedError2
        );
        if (expectedErrorPosition2)
          expect(
            expressionValidator.getAllErrors().at(1).getStartPosition()
          ).toBe(expectedErrorPosition2);
      } else if (expectedError) {
        expect(expressionValidator.getAllErrors().size()).toBe(1);
        expect(expressionValidator.getAllErrors().at(0).getMessage()).toBe(
          expectedError
        );
        if (expectedErrorPosition)
          expect(
            expressionValidator.getAllErrors().at(0).getStartPosition()
          ).toBe(expectedErrorPosition);
      } else {
        expect(expressionValidator.getAllErrors().size()).toBe(0);
      }

      expressionValidator.delete();
      parser.delete();
    }

    it('can parse valid expressions (number)', function () {
      testExpression('number', '1+1');
      testExpression('number', '2-3');
      testExpression('number', '4/5');
      testExpression('number', '6*7');
      testExpression('number', '8 + 9');
      testExpression('number', '10 +    11');
      testExpression('number', '12 +    13 - 14');
      testExpression('number', '  15 +    16 - 17   ');
      testExpression('number', '.14');
      testExpression('number', '3.');
    });

    it('can parse valid expressions (string)', function () {
      testExpression('string', '"Hello"');
      testExpression('string', '"Hello" + " " + "World"');
    });

    it('can parse valid expressions ("number|string" type)', function () {
      testExpression('number|string', '1+1');
      testExpression('number|string', '2-3');
      testExpression('number|string', '4/5');
      testExpression('number|string', '6*7');
      testExpression('number|string', '"Hello"');
      testExpression('number|string', '"Hello" + " " + "World"');
    });

    it('report errors in invalid expressions', function () {
      testExpression(
        'number',
        '1//2',
        'You must enter a number or a valid expression call.',
        2
      );
      testExpression('number', 'bad expression', 'You must enter a number.', 0);
      testExpression(
        'number',
        '1 + test()',
        "Cannot find an expression with this name: test\nDouble check that you've not made any typo in the name.",
        4
      );
      testExpression(
        'number',
        '3..14',
        'More than one term was found. Verify that your expression is properly written.',
        2,
        'No operator found. Did you forget to enter an operator (like +, -, * or /) between numbers or expressions?',
        2
      );
      testExpression(
        'string',
        '="Mynewscene"',
        'You must enter a text (between quotes) or a valid expression call.',
        0
      );
    });
    it('report errors in invalid expressions ("number|string" type)', function () {
      testExpression(
        'number|string',
        '123 + "World"',
        'You entered a text, but a number was expected.',
        6
      );
      testExpression(
        'number|string',
        '"World" + 123',
        'You entered a number, but a text was expected (in quotes).',
        10
      );
      testExpression(
        'number|string',
        '"World" + ToNumber("123")',
        'You tried to use an expression that returns a number, but a string is expected. Use `ToString` if you need to convert a number to a string.',
        10
      );
      testExpression(
        'number|string',
        '123 + ToString(456)',
        'You tried to use an expression that returns a string, but a number is expected. Use `ToNumber` if you need to convert a string to a number.',
        6
      );
    });

    it('can parse valid expressions with free functions', function () {
      testExpression('number', '1+sin(3.14)');
      testExpression('number', 'abs(-5)');
      testExpression('number', 'abs(-5) + cos(sin(3))');
      testExpression('number', 'atan2(-5, 3)');
      testExpression('number', 'MouseX("", 0) + 1');
    });

    it('can report errors when using too much arguments', function () {
      testExpression(
        'number',
        'abs(-5, 3)',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name. The number of parameters must be exactly 1"
      );
      testExpression(
        'number',
        'MouseX("", 0, 0) + 1',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name. The number of parameters must be: 0-2"
      );
    });

    it('can parse valid expressions with free functions having optional parameters', function () {
      testExpression('number', 'MouseX() + 1');
      testExpression('number', 'MouseX("") + 1');
    });

    it('can parse expressions with objects functions', function () {
      testExpression('number', 'MySpriteObject.X()');
      testExpression('number', 'MySpriteObject.X() + 1');
      testExpression('number', 'MySpriteObject.PointX("Point")');
    });

    it('can report errors when using too much arguments in object functions', function () {
      testExpression(
        'number',
        'MySpriteObject.PointX("Point", 2)',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name. The number of parameters must be exactly 1"
      );
    });

    it('can parse arguments being expressions', function () {
      testExpression('number', 'MouseX(VariableString(myVariable), 0) + 1');
    });
  });

  describe('gd.Vector2f', function () {
    describe('gd.VectorVector2f', function () {
      it('can be used to manipulate a vector of gd.Vector2f', function () {
        const vectorVector2f = new gd.VectorVector2f();
        const vector2f = new gd.Vector2f();

        vectorVector2f.push_back(vector2f);
        vectorVector2f.push_back(vector2f);
        vectorVector2f.push_back(vector2f);

        expect(vectorVector2f.size()).toBe(3);
        vectorVector2f.at(0).set_x(1);
        vectorVector2f.at(1).set_x(2);
        vectorVector2f.at(2).set_x(3);

        expect(vectorVector2f.at(0).get_x()).toBe(1);
        expect(vectorVector2f.at(1).get_x()).toBe(2);
        expect(vectorVector2f.at(2).get_x()).toBe(3);

        gd.moveVector2fInVector(vectorVector2f, 2, 0);
        expect(vectorVector2f.at(0).get_x()).toBe(3);
        expect(vectorVector2f.at(1).get_x()).toBe(1);
        expect(vectorVector2f.at(2).get_x()).toBe(2);

        gd.removeFromVectorVector2f(vectorVector2f, 1);
        expect(vectorVector2f.size()).toBe(2);
        expect(vectorVector2f.at(0).get_x()).toBe(3);
        expect(vectorVector2f.at(1).get_x()).toBe(2);

        vectorVector2f.clear();
        expect(vectorVector2f.size()).toBe(0);
      });
    });
  });

  describe('gd.PlatformExtension', function () {
    const makeTestExtension = () => {
      const extension = new gd.PlatformExtension();
      extension
        .setExtensionInformation(
          'TestExtensionName',
          'Full name of test extension',
          'Description of test extension',
          'Author of test extension',
          'License of test extension'
        )
        .setExtensionHelpPath('/path/to/extension/help');
      return extension;
    };

    it('can be created and have basic information filled', function () {
      const extension = makeTestExtension();

      expect(extension.getName()).toBe('TestExtensionName');
      expect(extension.getFullName()).toBe('Full name of test extension');
      expect(extension.getDescription()).toBe('Description of test extension');
      expect(extension.getAuthor()).toBe('Author of test extension');
      expect(extension.getLicense()).toBe('License of test extension');
      expect(extension.getHelpPath()).toBe('/path/to/extension/help');
      extension.delete();
    });

    it('can have actions and conditions added', function () {
      const extension = makeTestExtension();
      extension
        .addCondition(
          'BannerShowing',
          'Banner showing',
          'Check if there is a banner being displayed.',
          'Banner is showing',
          'AdMob',
          'JsPlatform/Extensions/admobicon24.png',
          'JsPlatform/Extensions/admobicon16.png'
        )
        .getCodeExtraInformation()
        .setIncludeFile('Extensions/AdMob/admobtools.js')
        .setFunctionName('gdjs.adMob.isBannerShowing');

      expect(
        extension.getAllConditions().has('TestExtensionName::BannerShowing')
      ).toBe(true);
      const condition = extension
        .getAllConditions()
        .get('TestExtensionName::BannerShowing');
      expect(condition.getFullName()).toBe('Banner showing');
      expect(condition.isHidden()).toBe(false);

      // Check also the API to duplicate a condition.
      extension
        .addDuplicatedCondition('AnotherCondition', 'BannerShowing')
        .setHidden();

      expect(
        extension.getAllConditions().has('TestExtensionName::AnotherCondition')
      ).toBe(true);
      const copiedCondition = extension
        .getAllConditions()
        .get('TestExtensionName::AnotherCondition');
      expect(copiedCondition.getFullName()).toBe('Banner showing');
      expect(copiedCondition.isHidden()).toBe(true);
      extension.delete();
    });
    it('can have expressions and conditions added at the same time', function () {
      const extension = makeTestExtension();
      extension
        .addExpressionAndCondition(
          'number',
          'PlayerHealth',
          'Health of the player',
          'The health of the player, from 0 to 100.',
          'the health of the player',
          'Health Management',
          'SomeHealthIcon.png'
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('string', 'Some stuff', '', false)
        .setParameterLongDescription('Blabla')
        .setFunctionName('some.method.to.getPlayerHealth')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions());

      expect(
        extension.getAllConditions().has('TestExtensionName::PlayerHealth')
      ).toBe(true);
      const declaredCondition = extension
        .getAllConditions()
        .get('TestExtensionName::PlayerHealth');
      expect(declaredCondition.getParametersCount()).toBe(4);

      expect(
        extension.getAllExpressions().has('TestExtensionName::PlayerHealth')
      ).toBe(true);
      const declaredExpression = extension
        .getAllExpressions()
        .get('TestExtensionName::PlayerHealth');
      expect(declaredExpression.getParametersCount()).toBe(2);
    });
    it('can have expressions, conditions and actions added at the same time', function () {
      const extension = makeTestExtension();
      extension
        .addExpressionAndConditionAndAction(
          'number',
          'PlayerHealth',
          'Health of the player',
          'The health of the player, from 0 to 100.',
          'the health of the player',
          'Health Management',
          'SomeHealthIcon.png'
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('string', 'Some stuff', '', false)
        .setParameterLongDescription('Blabla')
        .setFunctionName('some.method.to.getPlayerHealth')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions());

      expect(
        extension.getAllConditions().has('TestExtensionName::PlayerHealth')
      ).toBe(true);
      const declaredCondition = extension
        .getAllConditions()
        .get('TestExtensionName::PlayerHealth');
      expect(declaredCondition.getParametersCount()).toBe(4);

      expect(
        extension.getAllActions().has('TestExtensionName::SetPlayerHealth')
      ).toBe(true);
      const declaredAction = extension
        .getAllActions()
        .get('TestExtensionName::SetPlayerHealth');
      expect(declaredAction.getParametersCount()).toBe(4);

      expect(
        extension.getAllExpressions().has('TestExtensionName::PlayerHealth')
      ).toBe(true);
      const declaredExpression = extension
        .getAllExpressions()
        .get('TestExtensionName::PlayerHealth');
      expect(declaredExpression.getParametersCount()).toBe(2);
    });
    it('can have conditions and actions added at the same time for booleans', function () {
      const extension = makeTestExtension();
      extension
        .addExpressionAndConditionAndAction(
          'boolean',
          'Disabled',
          'Disabled',
          'the object is disabled',
          'disabled',
          '',
          'Disable.png'
        )
        .addParameter('object', 'My object', 'MyObject', false)
        .useStandardParameters('boolean', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setDisabled')
        .setGetter('isDisabled');

      expect(
        extension.getAllConditions().has('TestExtensionName::Disabled')
      ).toBe(true);
      const declaredCondition = extension
        .getAllConditions()
        .get('TestExtensionName::Disabled');

      expect(
        extension.getAllActions().has('TestExtensionName::SetDisabled')
      ).toBe(true);
      const declaredAction = extension
        .getAllActions()
        .get('TestExtensionName::SetDisabled');
      expect(declaredAction.getParametersCount()).toBe(2);
    });
  });

  describe('gd.Platform (using gd.JsPlatform)', function () {
    it('can have extension added and removed', function () {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'MyNewExtension',
        'Full name of test extension',
        'Description of test extension',
        'Author of test extension',
        'License of test extension'
      );

      gd.JsPlatform.get().addNewExtension(extension);
      expect(gd.JsPlatform.get().isExtensionLoaded('MyNewExtension')).toBe(
        true
      );
      gd.JsPlatform.get().removeExtension('MyNewExtension');
      expect(gd.JsPlatform.get().isExtensionLoaded('MyNewExtension')).toBe(
        false
      );
      gd.JsPlatform.get().addNewExtension(extension);
      gd.JsPlatform.get().addNewExtension(extension);
      expect(gd.JsPlatform.get().isExtensionLoaded('MyNewExtension')).toBe(
        true
      );
      gd.JsPlatform.get().removeExtension('MyNewExtension');
      expect(gd.JsPlatform.get().isExtensionLoaded('MyNewExtension')).toBe(
        false
      );
      extension.delete();
    });

    it('has a namespace separator', function () {
      expect(gd.PlatformExtension.getNamespaceSeparator()).toBe('::');
    });
  });

  describe('gd.ParameterMetadata', function () {
    it('can tell the type of a parameter', function () {
      expect(gd.ParameterMetadata.isObject('object')).toBe(true);
      expect(gd.ParameterMetadata.isObject('objectPtr')).toBe(true);
      expect(gd.ParameterMetadata.isObject('123')).toBe(false);
      expect(gd.ParameterMetadata.isBehavior('behavior')).toBe(true);
      expect(gd.ParameterMetadata.isBehavior('behavior34234')).toBe(false);
    });
    it('can have attributes and be serialized', function () {
      const parameter1 = new gd.ParameterMetadata();
      parameter1.setType('objectList');
      parameter1.setName('MyObjectWithoutType');
      parameter1.setDescription('The first object to be used');
      parameter1.setLongDescription('A long description');
      parameter1.setDefaultValue('Default value');
      parameter1.setOptional(true);

      const serializerElement = new gd.SerializerElement();
      parameter1.serializeTo(serializerElement);

      const parameter2 = new gd.ParameterMetadata();
      parameter2.unserializeFrom(serializerElement);

      expect(parameter1.getType()).toBe('objectList');
      expect(parameter1.getName()).toBe('MyObjectWithoutType');
      expect(parameter1.getDescription()).toBe('The first object to be used');
      expect(parameter1.getLongDescription()).toBe('A long description');
      expect(parameter1.getDefaultValue()).toBe('Default value');
      expect(parameter1.isOptional()).toBe(true);
    });
  });

  describe('gd.ParameterMetadataTools', function () {
    it('can create an object container from parameters', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();

      const parameters = new gd.VectorParameterMetadata();
      const parameter1 = new gd.ParameterMetadata();
      parameter1.setType('objectList');
      parameter1.setName('MyObjectWithoutType');
      parameter1.setDescription('The first object to be used');
      const parameter2 = new gd.ParameterMetadata();
      parameter2.setType('expression');
      parameter2.setName('MyNumber');
      parameter2.setDescription('Some number');
      const parameter3 = new gd.ParameterMetadata();
      parameter3.setType('objectList');
      // parameter3.setName(''); No name for this parameter
      parameter3.setDescription(
        'This parameter will be skipped, as it has no name'
      );
      parameter3.setExtraInfo('Sprite');
      const parameter4 = new gd.ParameterMetadata();
      parameter4.setType('string');
      parameter4.setName('MyString');
      parameter4.setDescription('Some string');
      const parameter5 = new gd.ParameterMetadata();
      parameter5.setType('objectList');
      parameter5.setName('MySpriteObject');
      parameter5.setDescription('The second object to be used, a sprite');
      parameter5.setExtraInfo('Sprite');

      parameters.push_back(parameter1);
      parameters.push_back(parameter2);
      parameters.push_back(parameter3);
      parameters.push_back(parameter4);
      parameters.push_back(parameter5);

      parameters.push_back(parameter5);
      expect(parameters.size()).toBe(6);
      gd.removeFromVectorParameterMetadata(parameters, 5);
      expect(parameters.size()).toBe(5);

      objectsContainer = new gd.ObjectsContainer();
      gd.ParameterMetadataTools.parametersToObjectsContainer(
        project,
        parameters,
        objectsContainer
      );

      expect(objectsContainer.getObjectsCount()).toBe(2);
      expect(objectsContainer.hasObjectNamed('MyObjectWithoutType')).toBe(true);
      expect(objectsContainer.getObject('MyObjectWithoutType').getType()).toBe(
        ''
      );
      expect(objectsContainer.hasObjectNamed('MySpriteObject')).toBe(true);
      expect(objectsContainer.getObject('MySpriteObject').getType()).toBe(
        'Sprite'
      );

      project.delete();
    });

    it('can give the previous object parameter', function () {
      const parameters = new gd.VectorParameterMetadata();
      const parameter1 = new gd.ParameterMetadata();
      parameter1.setType('objectList');
      const parameter2 = new gd.ParameterMetadata();
      parameter2.setType('behavior');
      const parameter3 = new gd.ParameterMetadata();
      parameter3.setType('objectList');
      const parameter4 = new gd.ParameterMetadata();
      parameter4.setType('string');
      const parameter5 = new gd.ParameterMetadata();
      parameter5.setType('objectvar');
      const parameter6 = new gd.ParameterMetadata();
      parameter6.setType('objectvar');

      parameters.push_back(parameter1);
      parameters.push_back(parameter2);
      parameters.push_back(parameter3);
      parameters.push_back(parameter4);
      parameters.push_back(parameter5);
      parameters.push_back(parameter6);

      objectsContainer = new gd.ObjectsContainer();
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 0)
      ).toBe(0);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 1)
      ).toBe(0);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 2)
      ).toBe(2);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 3)
      ).toBe(2);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 4)
      ).toBe(2);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 5)
      ).toBe(2);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 999)
      ).toBe(-1);
    });
  });

  describe('gd.EventsFunction', () => {
    it('can store events', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      const events = eventsFunction.getEvents();
      expect(events.getEventsCount()).toBe(0);
      let evt = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      expect(events.getEventsCount()).toBe(1);
      eventsFunction.delete();
      project.delete();
    });
    it('can have a name, fullname and description', function () {
      const eventsFunction = new gd.EventsFunction();
      eventsFunction.setName('My name');
      eventsFunction.setFullName('My descriptive name');
      eventsFunction.setDescription('My description');
      expect(eventsFunction.getName()).toBe('My name');
      expect(eventsFunction.getFullName()).toBe('My descriptive name');
      expect(eventsFunction.getDescription()).toBe('My description');
      eventsFunction.delete();
    });
  });

  describe('gd.EventsFunctionsExtension', () => {
    it('can have a namespace, version, name, fullname, description', function () {
      const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
      eventsFunctionsExtension.setNamespace('MyExt');
      eventsFunctionsExtension.setVersion('1.1');
      eventsFunctionsExtension.setName('My name');
      eventsFunctionsExtension.setFullName('My descriptive name');
      eventsFunctionsExtension.setDescription('My description');
      eventsFunctionsExtension.setIconUrl('data:image/png;base64,iVBetcetc');
      eventsFunctionsExtension.setPreviewIconUrl(
        'http://resources.gdevelop-app.com/test'
      );
      expect(eventsFunctionsExtension.getNamespace()).toBe('MyExt');
      expect(eventsFunctionsExtension.getVersion()).toBe('1.1');
      expect(eventsFunctionsExtension.getName()).toBe('My name');
      expect(eventsFunctionsExtension.getFullName()).toBe(
        'My descriptive name'
      );
      expect(eventsFunctionsExtension.getDescription()).toBe('My description');
      expect(eventsFunctionsExtension.getPreviewIconUrl()).toBe(
        'http://resources.gdevelop-app.com/test'
      );

      const eventsFunction = eventsFunctionsExtension.insertNewEventsFunction(
        'MyFunction',
        0
      );
      expect(
        eventsFunctionsExtension.hasEventsFunctionNamed('MyFunction')
      ).toBe(true);
      expect(
        eventsFunctionsExtension.hasEventsFunctionNamed('MyNotExistingFunction')
      ).toBe(false);
      expect(eventsFunctionsExtension.getEventsFunctionsCount()).toBe(1);
      expect(eventsFunctionsExtension.getEventsFunctionAt(0).getName()).toBe(
        'MyFunction'
      );
      expect(
        eventsFunctionsExtension.getEventsFunction('MyFunction').getName()
      ).toBe('MyFunction');

      eventsFunctionsExtension.delete();
    });
    it('can have events based behaviors', function () {
      const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().getCount()
      ).toBe(0);

      eventsFunctionsExtension
        .getEventsBasedBehaviors()
        .insertNew('MyBehavior1', 0);
      eventsFunctionsExtension
        .getEventsBasedBehaviors()
        .insertNew('MyBehavior2', 1);
      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().getCount()
      ).toBe(2);

      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().has('MyBehavior1')
      ).toBe(true);
      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().has('MyBehavior2')
      ).toBe(true);
      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().has('MyBehavior3')
      ).toBe(false);
      expect(
        eventsFunctionsExtension.getEventsBasedBehaviors().getAt(1).getName()
      ).toBe('MyBehavior2');
      expect(
        eventsFunctionsExtension
          .getEventsBasedBehaviors()
          .get('MyBehavior1')
          .getName()
      ).toBe('MyBehavior1');
    });
    it('can be unserialized, with tags as a (deprecated) string', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const eventsFunctionsExtension = new gd.EventsFunctionsExtension();

      // Check that we can unserialize tags from the old format, where they were
      // written as a string.
      const element = gd.Serializer.fromJSObject({
        version: '1.0.0',
        extensionNamespace: '',
        shortDescription: '',
        description: '',
        name: 'ExtensionName',
        fullName: '',
        tags: ' 12,34, 56  , 789',
        author: '',
        previewIconUrl: '',
        iconUrl: '',
        helpPath: '',
        eventsFunctions: [],
        eventsBasedBehaviors: [],
      });

      eventsFunctionsExtension.unserializeFrom(project, element);
      element.delete();

      expect(eventsFunctionsExtension.getVersion()).toBe('1.0.0');
      expect(eventsFunctionsExtension.getName()).toBe('ExtensionName');

      // Verify that tags were properly converted to an array
      expect(eventsFunctionsExtension.getTags().toJSArray()).toEqual([
        '12',
        '34',
        '56',
        '789',
      ]);

      project.delete();
    });
  });
  describe('gd.EventsBasedBehavior', () => {
    it('can have a name, fullname, description', function () {
      const eventsBasedBehavior = new gd.EventsBasedBehavior();
      eventsBasedBehavior.setName('My name');
      eventsBasedBehavior.setFullName('My descriptive name');
      eventsBasedBehavior.setDescription('My description');
      expect(eventsBasedBehavior.getName()).toBe('My name');
      expect(eventsBasedBehavior.getFullName()).toBe('My descriptive name');
      expect(eventsBasedBehavior.getDescription()).toBe('My description');
    });
  });

  describe('gd.InstructionMetadata', () => {
    it('can have parameters', () => {
      const instructionMetadata = new gd.InstructionMetadata();

      expect(instructionMetadata.getParametersCount()).toBe(0);
      instructionMetadata.addParameter(
        'type',
        'label',
        'AdditionalStuffThatWillBeReplaced',
        false
      );
      instructionMetadata.setParameterLongDescription('Blabla');
      instructionMetadata.setParameterExtraInfo(
        'AdditionalStuffLikeTypicallyAnObjectOrBehaviorType'
      );
      expect(instructionMetadata.getParametersCount()).toBe(1);
      expect(instructionMetadata.getParameter(0).getType()).toBe('type');
      expect(instructionMetadata.getParameter(0).getDescription()).toBe(
        'label'
      );
      expect(instructionMetadata.getParameter(0).getExtraInfo()).toBe(
        'AdditionalStuffLikeTypicallyAnObjectOrBehaviorType'
      );
      expect(instructionMetadata.getParameter(0).getLongDescription()).toBe(
        'Blabla'
      );
    });
  });

  describe('gd.ExpressionMetadata', () => {
    it('can have parameters', () => {
      const expressionMetadata = new gd.ExpressionMetadata(
        'number',
        'extensionNamespace',
        'name',
        'fullname',
        'description',
        'group',
        'smallicon'
      );

      expect(expressionMetadata.getReturnType()).toBe('number');
      expect(expressionMetadata.getFullName()).toBe('fullname');
      expect(expressionMetadata.getDescription()).toBe('description');
      expect(expressionMetadata.getGroup()).toBe('group');
      expect(expressionMetadata.getSmallIconFilename()).toBe('smallicon');
      expect(expressionMetadata.isShown()).toBe(true);

      expect(expressionMetadata.getParametersCount()).toBe(0);
      expressionMetadata.addParameter('type', 'label', '', false);
      expressionMetadata.setParameterLongDescription('Blabla');
      expect(expressionMetadata.getParametersCount()).toBe(1);
      expect(expressionMetadata.getParameter(0).getType()).toBe('type');
      expect(expressionMetadata.getParameter(0).getDescription()).toBe('label');
      expect(expressionMetadata.getParameter(0).getLongDescription()).toBe(
        'Blabla'
      );
    });
  });

  describe('gd.EditorSettings', () => {
    it('can store anything', () => {
      const element = gd.Serializer.fromJSObject({
        test: 1,
        anything: {
          canBeStored: true,
        },
      });

      const editorSettings = new gd.EditorSettings();
      editorSettings.unserializeFrom(element);

      const element2 = new gd.SerializerElement();
      editorSettings.serializeTo(element2);

      expect(element2.getChild('test').getIntValue()).toBe(1);
      expect(
        element2.getChild('anything').getChild('canBeStored').getBoolValue()
      ).toBe(true);
    });
  });

  describe('gd.ObjectFolderOrObject (using gd.ObjectsContainer)', () => {
    let project = null;
    let layout = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
    });

    afterEach(() => {
      project.removeLayout('Scene');
    });

    beforeEach(() => {
      layout = project.insertNewLayout('Scene', 0);
    });

    test('objects container has a root ObjectFolderOrObject', () => {
      const rootFolder = layout.getRootFolder();
      expect(rootFolder.isFolder()).toBe(true);
      expect(rootFolder.isRootFolder()).toBe(true);
      expect(rootFolder.getParent().isFolder()).toBe(true);
      expect(rootFolder.getParent().getFolderName()).toEqual('__NULL');
      expect(rootFolder.getChildrenCount()).toEqual(0);
    });

    test('an object added to the object container is added to the root ObjectFolderOrObject', () => {
      let object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const rootFolder = layout.getRootFolder();
      expect(rootFolder.hasObjectNamed('MyObject')).toBe(true);
      expect(rootFolder.isRootFolder()).toBe(true);
      expect(rootFolder.getChildrenCount()).toEqual(1);
      layout.removeObject('MyObject');
      expect(rootFolder.hasObjectNamed('MyObject')).toBe(false);
      expect(rootFolder.getChildrenCount()).toEqual(0);
    });

    test('a folder can be added to the root folder', () => {
      const rootFolder = layout.getRootFolder();
      const subFolder = rootFolder.insertNewFolder('Enemies', 1);
      expect(subFolder.getFolderName()).toEqual('Enemies');
      expect(subFolder.isRootFolder()).toBe(false);
      subFolder.setFolderName('Players');
      expect(subFolder.getFolderName()).toEqual('Players');
      expect(subFolder.getParent()).toBe(rootFolder);
      expect(rootFolder.getChildrenCount()).toEqual(1);
    });

    test('an object can be added to a specific folder', () => {
      const rootFolder = layout.getRootFolder();
      const subFolder = rootFolder.insertNewFolder('Enemies', 0);
      const subSubFolder = subFolder.insertNewFolder('Turtles', 0);
      layout.insertNewObjectInFolder(
        project,
        'Sprite',
        'RedTurtle',
        subSubFolder,
        0
      );
      expect(layout.hasObjectNamed('RedTurtle')).toBe(true);
      expect(subSubFolder.hasObjectNamed('RedTurtle')).toBe(true);
    });

    test('an ObjectFolderOrObject can be serialized and unserialized', () => {
      const rootFolder = layout.getRootFolder();
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const subFolder = rootFolder.insertNewFolder('Enemies', 1);
      const object2 = layout.insertNewObject(
        project,
        'Sprite',
        'OtherObject',
        1
      );
      const object3 = layout.insertNewObject(project, 'Sprite', 'SubObject', 2);
      rootFolder.moveObjectFolderOrObjectToAnotherFolder(
        rootFolder.getObjectChild('SubObject'),
        subFolder,
        0
      );
      expect(rootFolder.hasObjectNamed('MyObject')).toBe(true);
      expect(rootFolder.hasObjectNamed('OtherObject')).toBe(true);
      expect(rootFolder.getChildrenCount()).toEqual(3);
      expect(
        rootFolder.getChildPosition(rootFolder.getObjectChild('MyObject'))
      ).toEqual(0);
      expect(rootFolder.getChildPosition(subFolder)).toEqual(1);
      expect(
        rootFolder.getChildPosition(rootFolder.getObjectChild('OtherObject'))
      ).toEqual(2);
      expect(rootFolder.hasObjectNamed('SubObject')).toBe(true);
      expect(subFolder.hasObjectNamed('SubObject')).toBe(true);

      const element = new gd.SerializerElement();
      layout.serializeTo(element);

      project.removeLayout('Scene');

      const layout2 = project.insertNewLayout('Scene2', 0);
      layout2.unserializeFrom(project, element);

      expect(layout2.hasObjectNamed('MyObject')).toBe(true);
      expect(layout2.hasObjectNamed('OtherObject')).toBe(true);
      const rootFolder2 = layout.getRootFolder();
      expect(rootFolder2.hasObjectNamed('MyObject')).toBe(true);
      expect(rootFolder2.hasObjectNamed('OtherObject')).toBe(true);
      expect(rootFolder2.getChildrenCount()).toEqual(3);
      const parentEqualities = mapFor(
        0,
        rootFolder2.getChildrenCount(),
        (i) => {
          const childObjectFolderOrObject = rootFolder2.getChildAt(i);
          return childObjectFolderOrObject.getParent() === rootFolder2;
        }
      );
      expect(parentEqualities.every((equality) => equality)).toBe(true);
      const subFolder2 = rootFolder2.getChildAt(1);
      expect(subFolder2.isFolder()).toBe(true);
      const subObject = subFolder2.getObjectChild('SubObject');
      expect(subObject.getParent()).toBe(subFolder2);
    });

    test('an ObjectFolderOrObject can be serialized and unserialized and missing object folders or objects are added', () => {
      const rootFolder = layout.getRootFolder();
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const subFolder = rootFolder.insertNewFolder('Enemies', 1);
      const object2 = layout.insertNewObject(
        project,
        'Sprite',
        'OtherObject',
        1
      );
      const object3 = layout.insertNewObject(project, 'Sprite', 'SubObject', 2);
      rootFolder.moveObjectFolderOrObjectToAnotherFolder(
        rootFolder.getObjectChild('SubObject'),
        subFolder,
        0
      );
      expect(rootFolder.hasObjectNamed('MyObject')).toBe(true);
      expect(rootFolder.hasObjectNamed('OtherObject')).toBe(true);
      expect(rootFolder.getChildrenCount()).toEqual(3);
      expect(rootFolder.hasObjectNamed('SubObject')).toBe(true);
      expect(subFolder.hasObjectNamed('SubObject')).toBe(true);

      const element = new gd.SerializerElement();
      layout.serializeTo(element);

      const layoutObject = JSON.parse(gd.Serializer.toJSON(element));
      delete layoutObject.objectsFolderStructure;

      project.removeLayout('Scene');

      const layout2 = project.insertNewLayout('Scene2', 0);
      layout2.unserializeFrom(
        project,
        gd.Serializer.fromJSObject(layoutObject)
      );

      expect(layout2.hasObjectNamed('MyObject')).toBe(true);
      expect(layout2.hasObjectNamed('OtherObject')).toBe(true);
      const rootFolder2 = layout.getRootFolder();
      expect(rootFolder2.hasObjectNamed('MyObject')).toBe(true);
      expect(rootFolder2.hasObjectNamed('OtherObject')).toBe(true);
      expect(rootFolder2.getChildrenCount()).toEqual(3);
      const parentEqualities = mapFor(
        0,
        rootFolder2.getChildrenCount(),
        (i) => {
          const childObjectFolderOrObject = rootFolder2.getChildAt(i);
          return childObjectFolderOrObject.getParent() === rootFolder2;
        }
      );
      expect(parentEqualities.every((equality) => equality)).toBe(true);
    });

    test('a folder can be removed from its parent if empty', () => {
      const rootFolder = layout.getRootFolder();
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      let subFolder = rootFolder.insertNewFolder('Enemies', 1);
      const object2 = layout.insertNewObject(
        project,
        'Sprite',
        'OtherObject',
        2
      );
      rootFolder.moveObjectFolderOrObjectToAnotherFolder(
        rootFolder.getObjectChild('OtherObject'),
        subFolder,
        0
      );
      rootFolder.removeFolderChild(subFolder);

      // Check subfolder is still here since it was not empty.
      expect(rootFolder.getChildrenCount()).toEqual(2);
      subFolder = rootFolder.getChildAt(1);
      expect(subFolder.isFolder()).toBe(true);
      expect(subFolder.getChildrenCount()).toEqual(1);
      expect(subFolder.hasObjectNamed('OtherObject')).toBe(true);

      // Empty subfolder and remove it.
      subFolder.moveObjectFolderOrObjectToAnotherFolder(
        subFolder.getObjectChild('OtherObject'),
        rootFolder,
        0
      );
      rootFolder.removeFolderChild(subFolder);

      expect(rootFolder.getChildrenCount()).toEqual(2);
      const objectFolderOrObject = rootFolder.getChildAt(1);
      const otherObjectFolderOrObject = rootFolder.getChildAt(0);
      expect(otherObjectFolderOrObject.isFolder()).toBe(false);
      expect(otherObjectFolderOrObject.isRootFolder()).toBe(false);
      expect(otherObjectFolderOrObject.getObject().getName()).toBe(
        'OtherObject'
      );
      expect(objectFolderOrObject.isFolder()).toBe(false);
      expect(objectFolderOrObject.isRootFolder()).toBe(false);
      expect(objectFolderOrObject.getObject().getName()).toBe('MyObject');
    });

    test("an ObjectFolderOrObject can test if it's a descendant of another one", () => {
      const rootFolder = layout.getRootFolder();
      const subFolder = rootFolder.insertNewFolder('Depth1', 0);
      const subSubFolder = subFolder.insertNewFolder('Depth2', 0);
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      rootFolder.moveObjectFolderOrObjectToAnotherFolder(
        rootFolder.getObjectChild('MyObject'),
        subSubFolder,
        0
      );
      const objectFolderOrObject = subSubFolder.getChildAt(0);
      expect(objectFolderOrObject.isFolder()).toBe(false);
      expect(objectFolderOrObject.getObject().getName()).toEqual('MyObject');

      expect(objectFolderOrObject.isADescendantOf(subSubFolder)).toBe(true);
      expect(objectFolderOrObject.isADescendantOf(subFolder)).toBe(true);
      expect(objectFolderOrObject.isADescendantOf(rootFolder)).toBe(true);

      expect(subSubFolder.isADescendantOf(subFolder)).toBe(true);
      expect(subSubFolder.isADescendantOf(rootFolder)).toBe(true);

      expect(subFolder.isADescendantOf(rootFolder)).toBe(true);

      expect(rootFolder.isADescendantOf(objectFolderOrObject)).toBe(false);
      expect(rootFolder.isADescendantOf(subSubFolder)).toBe(false);
      expect(rootFolder.isADescendantOf(subFolder)).toBe(false);
      expect(rootFolder.isADescendantOf(rootFolder)).toBe(false);

      expect(subFolder.isADescendantOf(objectFolderOrObject)).toBe(false);
      expect(subFolder.isADescendantOf(subSubFolder)).toBe(false);
      expect(subFolder.isADescendantOf(subFolder)).toBe(false);

      expect(subSubFolder.isADescendantOf(objectFolderOrObject)).toBe(false);
      expect(subSubFolder.isADescendantOf(subSubFolder)).toBe(false);

      expect(objectFolderOrObject.isADescendantOf(objectFolderOrObject)).toBe(
        false
      );
    });
    test('an ObjectFolderOrObject representing an object can be retrieved using the object name only', () => {
      const rootFolder = layout.getRootFolder();
      const subFolder = rootFolder.insertNewFolder('Depth1', 0);
      const subSubFolder = subFolder.insertNewFolder('Depth2', 0);
      const object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      rootFolder.moveObjectFolderOrObjectToAnotherFolder(
        rootFolder.getObjectChild('MyObject'),
        subSubFolder,
        0
      );
      const objectFolderOrObject = subSubFolder.getChildAt(0);
      expect(objectFolderOrObject.isRootFolder()).toBe(false);
      const objectFolderOrObjectFoundByName = rootFolder.getObjectNamed(
        'MyObject'
      );
      expect(objectFolderOrObjectFoundByName.isRootFolder()).toBe(false);
      expect(objectFolderOrObjectFoundByName).toBe(objectFolderOrObject);
    });
  });
});

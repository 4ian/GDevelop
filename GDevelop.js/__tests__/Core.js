const initGDevelopJS = require('../../Binaries/Output/libGD.js/Release/libGD.js');
const path = require('path');
const extend = require('extend');

describe('libGD.js', function() {
  let gd = null;
  beforeAll(() => (gd = initGDevelopJS()));

  describe('gd.VersionWrapper', function() {
    it('can return the version number of the library', function() {
      expect(typeof gd.VersionWrapper.major()).toBe('number');
      expect(typeof gd.VersionWrapper.minor()).toBe('number');
      expect(typeof gd.VersionWrapper.build()).toBe('number');
      expect(typeof gd.VersionWrapper.revision()).toBe('number');
      expect(typeof gd.VersionWrapper.fullString()).toBe('string');
    });
  });

  describe('gd.Project', function() {
    let project = null;
    beforeAll(() => (project = gd.ProjectHelper.createNewGDJSProject()));

    it('has properties that can be read and changed', function() {
      project.setName('My super project');
      expect(project.getName()).toBe('My super project');
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
    });

    it('can store loading screen setup', function() {
      project.getLoadingScreen().showGDevelopSplash(true);
      expect(project.getLoadingScreen().isGDevelopSplashShown()).toBe(true);
      project.getLoadingScreen().showGDevelopSplash(false);
      expect(project.getLoadingScreen().isGDevelopSplashShown()).toBe(false);
    });

    it('handles layouts', function() {
      expect(project.hasLayoutNamed('Scene')).toBe(false);

      project.insertNewLayout('Scene', 0);
      expect(project.hasLayoutNamed('Scene')).toBe(true);
      expect(project.getLayout('Scene').getName()).toBe('Scene');

      project.removeLayout('Scene');
      expect(project.hasLayoutNamed('Scene')).toBe(false);
    });

    it('handles external events', function() {
      expect(project.hasExternalEventsNamed('My events')).toBe(false);

      project.insertNewExternalEvents('My events', 0);
      expect(project.hasExternalEventsNamed('My events')).toBe(true);
      expect(project.getExternalEvents('My events').getName()).toBe(
        'My events'
      );

      project.removeExternalEvents('My events');
      expect(project.hasExternalEventsNamed('My events')).toBe(false);
    });

    it('handles external layouts', function() {
      expect(project.hasExternalLayoutNamed('My layout')).toBe(false);

      project.insertNewExternalLayout('My layout', 0);
      expect(project.hasExternalLayoutNamed('My layout')).toBe(true);
      expect(project.getExternalLayout('My layout').getName()).toBe(
        'My layout'
      );

      project.removeExternalLayout('My layout');
      expect(project.hasExternalLayoutNamed('My layout')).toBe(false);
    });

    it('should validate object names', function() {
      expect(gd.Project.validateObjectName('ThisNameIs_Ok_123')).toBe(true);
      expect(gd.Project.validateObjectName('ThisName IsNot_Ok_123')).toBe(
        false
      );
      expect(gd.Project.validateObjectName('ThisNameIsNot_Ok!')).toBe(false);
    });

    it('should have a list of extensions', function() {
      expect(typeof project.getUsedExtensions().size()).toBe('number');
      project.getUsedExtensions().clear();
      expect(project.getUsedExtensions().size()).toBe(0);
    });

    it('handles events functions extensions', function() {
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(false);

      project.insertNewEventsFunctionsExtension('Ext', 0);
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(true);
      expect(project.getEventsFunctionsExtension('Ext').getName()).toBe('Ext');

      project.removeEventsFunctionsExtension('Ext');
      expect(project.hasEventsFunctionsExtensionNamed('Ext')).toBe(false);
    });

    afterAll(function() {
      project.delete();
    });
  });

  describe('gd.Layout', function() {
    let project = null;
    let layout = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
    });

    it('can have a new name', function() {
      expect(layout.getName()).toBe('Scene');
      layout.setName('My super layout');
      expect(layout.getName()).toBe('My super layout');
    });
    it('can have a name with UTF8 characters', function() {
      layout.setName('Scene with a 官话 name');
      expect(layout.getName()).toBe('Scene with a 官话 name');
    });
    it('can store events', function() {
      var evts = layout.getEvents();
      expect(evts.getEventsCount()).toBe(0);
      var evt = evts.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      expect(evts.getEventsCount()).toBe(1);
      evt
        .getSubEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      expect(
        evts
          .getEventAt(0)
          .getSubEvents()
          .getEventsCount()
      ).toBe(1);
    });
    it('can have objects', function() {
      var object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      var object2 = layout.insertNewObject(
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

    afterAll(function() {
      project.delete();
    });
  });

  describe('gd.ObjectsContainer (using gd.Layout)', function() {
    let project = null;
    beforeAll(() => (project = gd.ProjectHelper.createNewGDJSProject()));

    it('can move objects', function() {
      var layout = project.insertNewLayout('Scene', 0);
      var object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      var object2 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject2',
        1
      );
      var object3 = layout.insertNewObject(
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

    it('can find position of objects', function() {
      var layout = project.insertNewLayout('Scene2', 0);
      var object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      var object2 = layout.insertNewObject(
        project,
        'TextObject::Text',
        'MyObject2',
        1
      );
      var object3 = layout.insertNewObject(
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

    afterAll(function() {
      project.delete();
    });
  });

  describe('gd.InitialInstancesContainer', function() {
    let container = null;
    let containerCopy = null;
    beforeAll(() => {
      container = new gd.InitialInstancesContainer();
    });

    it('initial state', function() {
      expect(container.getInstancesCount()).toBe(0);
    });
    it('adding instances', function() {
      var instance = container.insertNewInitialInstance();
      instance.setObjectName('MyObject1');
      instance.setZOrder(10);

      var instance2 = new gd.InitialInstance();
      instance2.setObjectName('MyObject2');
      instance2 = container.insertInitialInstance(instance2);

      var instance3 = container.insertNewInitialInstance();
      instance3.setObjectName('MyObject3');
      instance3.setZOrder(-1);
      instance3.setLayer('OtherLayer');

      expect(container.getInstancesCount()).toBe(3);
    });
    it('iterating', function() {
      var i = 0;
      var functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function(instance) {
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
    it('can rename instances', function() {
      container.renameInstancesOfObject('MyObject1', 'MyObject');

      var i = 0;
      var functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function(instance) {
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
    it('iterating with z ordering', function() {
      var i = 0;
      var functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function(instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(
          (i === 0 && instance.getObjectName() === 'MyObject2') ||
            (i === 1 && instance.getObjectName() === 'MyObject')
        ).toBe(true);
        i++;
      };
      container.iterateOverInstancesWithZOrdering(functor, '');
    });
    it('moving from layers to another', function() {
      container.moveInstancesToLayer('OtherLayer', 'YetAnotherLayer');

      var functor = new gd.InitialInstanceJSFunctor();
      functor.invoke = function(instance) {
        instance = gd.wrapPointer(instance, gd.InitialInstance);
        expect(instance.getObjectName()).toBe('MyObject3');
      };
      container.iterateOverInstancesWithZOrdering(functor, 'YetAnotherLayer');
    });
    it('can be cloned', function() {
      containerCopy = container.clone();
      expect(containerCopy.getInstancesCount()).toBe(3);

      var instance = containerCopy.insertNewInitialInstance();
      instance.setObjectName('MyObject4');
      expect(containerCopy.getInstancesCount()).toBe(4);
      expect(container.getInstancesCount()).toBe(3);

      containerCopy.delete();
      containerCopy = null;
    });
    it('removing instances', function() {
      container.removeInitialInstancesOfObject('MyObject');
      expect(container.getInstancesCount()).toBe(2);
    });
    it('removing instances on a layer', function() {
      container.removeAllInstancesOnLayer('YetAnotherLayer');
      expect(container.getInstancesCount()).toBe(1);
    });
    it('can be serialized', function() {
      expect(container.serializeTo).not.toBe(undefined);
      expect(container.unserializeFrom).not.toBe(undefined);
    });

    afterAll(function() {
      container.delete();
    });
  });

  describe('gd.InitialInstance', function() {
    let project = null;
    let layout = null;
    let initialInstance = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);

      initialInstance = layout.getInitialInstances().insertNewInitialInstance();
    });

    it('properties', function() {
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
    });
    it('Sprite object custom properties', function() {
      initialInstance.updateCustomProperty('Animation', '2', project, layout);
      expect(
        initialInstance
          .getCustomProperties(project, layout)
          .get('Animation')
          .getValue()
      ).toBe('2');
      expect(initialInstance.getRawFloatProperty('animation')).toBe(2);
    });
    it('can be serialized', function() {
      expect(initialInstance.serializeTo).not.toBe(undefined);
      expect(initialInstance.unserializeFrom).not.toBe(undefined);

      var element = new gd.SerializerElement();
      initialInstance.serializeTo(element);

      var initialInstance2 = layout
        .getInitialInstances()
        .insertNewInitialInstance();
      initialInstance2.unserializeFrom(element);
      expect(initialInstance2.getObjectName()).toBe('MySpriteObject');
      expect(initialInstance2.getX()).toBe(150);
      expect(initialInstance2.getY()).toBe(140);
      expect(initialInstance2.getAngle()).toBe(45);
      expect(initialInstance2.getZOrder()).toBe(12);
      expect(initialInstance2.getLayer()).toBe('MyLayer');
      expect(initialInstance2.isLocked()).toBe(true);
      expect(initialInstance2.hasCustomSize()).toBe(true);
      expect(initialInstance2.getCustomWidth()).toBe(34);
      expect(initialInstance2.getCustomHeight()).toBe(30);
    });

    afterAll(function() {
      project.delete();
    });
  });

  describe('gd.VariablesContainer', function() {
    it('container is empty after being created', function() {
      var container = new gd.VariablesContainer();

      expect(container.has('Variable')).toBe(false);
      expect(container.count()).toBe(0);
      container.delete();
    });
    it('can insert variables', function() {
      var container = new gd.VariablesContainer();

      container.insertNew('Variable', 0);
      expect(container.has('Variable')).toBe(true);
      expect(container.count()).toBe(1);

      container.insertNew('SecondVariable', 0);
      expect(container.has('SecondVariable')).toBe(true);
      expect(container.count()).toBe(2);
      container.delete();
    });
    it('can rename variables', function() {
      var container = new gd.VariablesContainer();

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
    it('can swap variables', function() {
      var container = new gd.VariablesContainer();

      container.insertNew('Variable', 0).setValue(4);
      container
        .insertNew('SecondVariable', 1)
        .setString('String of SecondVariable');
      container
        .insertNew('ThirdVariable', 2)
        .getChild('Child1')
        .setValue(7);

      expect(container.getNameAt(0)).toBe('Variable');
      expect(container.getNameAt(2)).toBe('ThirdVariable');

      container.swap(0, 2);
      expect(container.getNameAt(0)).toBe('ThirdVariable');
      expect(container.getNameAt(2)).toBe('Variable');
      expect(container.getAt(2).getValue()).toBe(4);

      container.delete();
    });
    it('can move variables', function() {
      var container = new gd.VariablesContainer();

      container.insertNew('Variable', 0).setValue(4);
      container
        .insertNew('SecondVariable', 1)
        .setString('String of SecondVariable');
      container
        .insertNew('ThirdVariable', 2)
        .getChild('Child1')
        .setValue(7);

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

  describe('gd.Variable', function() {
    let variable = null;
    beforeAll(() => (variable = new gd.Variable()));

    it('should have initial value', function() {
      expect(variable.getValue()).toBe(0);
      expect(variable.isNumber()).toBe(true);
    });
    it('can have a value', function() {
      variable.setValue(5);
      expect(variable.getValue()).toBe(5);
      expect(variable.isNumber()).toBe(true);
    });
    it('can have a string', function() {
      variable.setString('Hello');
      expect(variable.getString()).toBe('Hello');
      expect(variable.isNumber()).toBe(false);
    });
    it('can be a structure', function() {
      variable.getChild('FirstChild').setValue(1);
      variable.getChild('SecondChild').setString('two');
      expect(variable.hasChild('FirstChild')).toBe(true);
      expect(variable.hasChild('SecondChild')).toBe(true);
      expect(variable.hasChild('NotExisting')).toBe(false);
      expect(variable.getChild('SecondChild').getString()).toBe('two');
      variable.removeChild('FirstChild');
      expect(variable.hasChild('FirstChild')).toBe(false);
    });
    it('can expose its children', function() {
      variable.getChild('FirstChild').setValue(1);

      var childrenNames = variable.getAllChildrenNames();
      expect(childrenNames.size()).toBe(2);

      variable.getChild(childrenNames.get(0)).setString('one');
      variable.getChild(childrenNames.get(1)).setValue(2);

      expect(variable.getChild('FirstChild').getString()).toBe('one');
      expect(variable.getChild('SecondChild').getValue()).toBe(2);

      expect(childrenNames.size()).toBe(2);
    });
    it('can search inside children and remove them recursively', function() {
      var parentVariable = new gd.Variable();

      var child1 = parentVariable.getChild('Child1');
      var child2 = parentVariable.getChild('Child2');
      var grandChild = parentVariable.getChild('Child1').getChild('GrandChild');
      expect(parentVariable.contains(grandChild, true)).toBe(true);
      expect(parentVariable.contains(grandChild, false)).toBe(false);
      expect(parentVariable.contains(child1, true)).toBe(true);
      expect(parentVariable.contains(child2, true)).toBe(true);
      expect(parentVariable.contains(child1, false)).toBe(true);
      expect(parentVariable.contains(child2, false)).toBe(true);
      expect(child1.contains(grandChild, true)).toBe(true);
      expect(child1.contains(grandChild, false)).toBe(true);
      expect(child2.contains(grandChild, true)).toBe(false);
      expect(child2.contains(grandChild, false)).toBe(false);
      expect(grandChild.contains(grandChild, true)).toBe(false);
      expect(grandChild.contains(grandChild, false)).toBe(false);
      expect(grandChild.contains(child1, true)).toBe(false);
      expect(grandChild.contains(child2, true)).toBe(false);
      expect(grandChild.contains(parentVariable, true)).toBe(false);
      expect(grandChild.contains(child1, false)).toBe(false);
      expect(grandChild.contains(child2, false)).toBe(false);
      expect(grandChild.contains(parentVariable, false)).toBe(false);

      parentVariable.removeRecursively(grandChild);
      expect(child1.hasChild('GrandChild')).toBe(false);
      expect(child1.getChildrenCount()).toBe(0);
      expect(parentVariable.getChildrenCount()).toBe(2);

      parentVariable.removeRecursively(child2);
      expect(parentVariable.getChildrenCount()).toBe(1);
      expect(parentVariable.hasChild('Child1')).toBe(true);
      expect(parentVariable.hasChild('Child2')).toBe(false);

      parentVariable.delete();
    });

    afterAll(function() {
      variable.delete();
    });
  });

  describe('gd.ImageResource', function() {
    it('should have name and file', function() {
      const resource = new gd.ImageResource();
      resource.setName('MyResource');
      resource.setFile('MyFile');
      expect(resource.getName()).toBe('MyResource');
      expect(resource.getFile()).toBe('MyFile');
      resource.delete();
    });
    it('can have metadata', function() {
      const resource = new gd.ImageResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });

    it('has smooth and alreadyLoaded custom properties', function() {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const resource = new gd.ImageResource();

      const properties = resource.getProperties();
      expect(properties.get('Smooth the image').getValue()).toBe('true');
      expect(properties.get('Always loaded in memory').getValue()).toBe(
        'false'
      );

      // Note: updateProperty expect the booleans in an usual "0" or "1" format.
      resource.updateProperty('Smooth the image', '0', project);
      resource.updateProperty('Always loaded in memory', '1', project);

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

  describe('gd.AudioResource', function() {
    it('should have name and file', function() {
      const resource = new gd.AudioResource();
      resource.setName('MyAudioResource');
      resource.setFile('MyAudioFile');
      expect(resource.getName()).toBe('MyAudioResource');
      expect(resource.getFile()).toBe('MyAudioFile');
      resource.delete();
    });
    it('can have metadata', function() {
      const resource = new gd.AudioResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.FontResource', function() {
    it('should have name and file', function() {
      const resource = new gd.FontResource();
      resource.setName('MyFontResource');
      resource.setFile('MyFontFile');
      expect(resource.getName()).toBe('MyFontResource');
      expect(resource.getFile()).toBe('MyFontFile');
      resource.delete();
    });
    it('can have metadata', function() {
      const resource = new gd.FontResource();
      expect(resource.getMetadata()).toBe('');
      resource.setMetadata(JSON.stringify({ hello: 'world' }));
      expect(resource.getMetadata()).toBe('{"hello":"world"}');
      resource.delete();
    });
  });

  describe('gd.ResourcesManager', function() {
    it('should support adding resources', function() {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var resource = new gd.Resource();
      var resource2 = new gd.Resource();
      resource.setName('MyResource');
      resource2.setName('MyResource2');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().addResource(resource2);
      var allResources = project.getResourcesManager().getAllResourceNames();

      expect(allResources.size()).toBe(2);
      project.delete();
    });

    it('should support finding resources', function() {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var resource = new gd.Resource();
      var resource2 = new gd.Resource();
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

    it('should support removing resources', function() {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var resource = new gd.Resource();
      resource.setName('MyResource');
      project.getResourcesManager().addResource(resource);
      project.getResourcesManager().removeResource('MyResource');

      var allResources = project.getResourcesManager().getAllResourceNames();
      expect(allResources.size()).toBe(0);
      project.delete();
    });
  });

  describe('gd.ProjectResourcesAdder', function() {
    it('should support removing useless resources', function() {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var resource1 = new gd.ImageResource();
      resource1.setName('Useless');
      var resource2 = new gd.ImageResource();
      resource2.setName('Used');
      project.getResourcesManager().addResource(resource1);
      project.getResourcesManager().addResource(resource2);

      //Create an object using a resource
      var obj = project.insertNewObject(project, 'Sprite', 'MyObject', 0);
      var sprite1 = new gd.Sprite();
      sprite1.setImageName('Used');

      var anim1 = new gd.Animation();
      anim1.setDirectionsCount(1);
      anim1.getDirection(0).addSprite(sprite1);

      gd.castObject(obj, gd.SpriteObject).addAnimation(anim1);

      var allResources = project.getResourcesManager().getAllResourceNames();
      expect(allResources.size()).toBe(2);

      gd.ProjectResourcesAdder.removeAllUseless(project, 'image');

      var allResources = project.getResourcesManager().getAllResourceNames();
      expect(allResources.size()).toBe(1);
      expect(allResources.get(0)).toBe('Used');
      project.delete();
    });
  });

  describe('gd.ArbitraryResourceWorker', function() {
    it('should be called with resources of the project', function(done) {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var obj = project.insertNewObject(project, 'Sprite', 'MyObject', 0);
      const spriteObject = gd.asSpriteObject(obj);
      var sprite1 = new gd.Sprite();
      sprite1.setImageName('Used');
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      animation.getDirection(0).addSprite(sprite1);
      spriteObject.addAnimation(animation);

      var worker = extend(new gd.ArbitraryResourceWorkerJS(), {
        exposeImage: function(image) {
          expect(image).toBe('Used');
          done();

          return image;
        },
      });

      project.exposeResources(worker);
      project.delete();
    });
  });

  describe('gd.ResourcesInUseHelper', function() {
    it('should find the images used by objects', function() {
      var sprite1 = new gd.Sprite();
      sprite1.setImageName('Image1');
      var sprite2 = new gd.Sprite();
      sprite2.setImageName('Image2');
      var sprite3 = new gd.Sprite();
      sprite3.setImageName('Image3');

      const spriteObject = new gd.SpriteObject('My sprite object');
      const animation = new gd.Animation();
      animation.setDirectionsCount(1);
      animation.getDirection(0).addSprite(sprite1);
      animation.getDirection(0).addSprite(sprite2);
      animation.getDirection(0).addSprite(sprite1);
      spriteObject.addAnimation(animation);

      const spriteObject2 = new gd.SpriteObject('My sprite object');
      const animation2 = new gd.Animation();
      animation2.setDirectionsCount(1);
      animation2.getDirection(0).addSprite(sprite1);
      animation2.getDirection(0).addSprite(sprite3);
      animation2.getDirection(0).addSprite(sprite1);
      spriteObject2.addAnimation(animation2);

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

  describe('gd.Behavior', function() {
    var project = null;
    var behavior = null;
    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      behavior = new gd.Behavior();
    });

    it('properties and initial values', function() {
      behavior.setName('MyBehavior');
      expect(behavior.getName()).toBe('MyBehavior');
      expect(behavior.getTypeName()).toBe('');
    });
    it('update a not existing property', function() {
      expect(
        behavior.updateProperty('PropertyThatDoesNotExist', 'MyValue', project)
      ).toBe(false);
    });

    afterAll(function() {
      behavior.delete();
      project.delete();
    });
  });

  describe('gd.BehaviorsSharedData', function() {
    it('can be created by gd.Layout.updateBehaviorsSharedData', function() {
      var project = gd.ProjectHelper.createNewGDJSProject();
      var layout = project.insertNewLayout('Scene', 0);
      var object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);

      layout.updateBehaviorsSharedData(project);
      expect(layout.hasBehaviorSharedData('Physics')).toBe(false);
      var behavior = object.addNewBehavior(
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

  describe('gd.BehaviorSharedDataJsImplementation', function() {
    it('can declare a gd.BehaviorSharedDataJsImplementation and pass sanity checks', function() {
      var mySharedData = new gd.BehaviorSharedDataJsImplementation();
      mySharedData.updateProperty = function(content, propertyName, newValue) {
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
      mySharedData.getProperties = function(content) {
        var properties = new gd.MapStringPropertyDescriptor();

        properties.set(
          'My first property',
          new gd.PropertyDescriptor(content.property1)
        );
        properties.set(
          'My other property',
          new gd.PropertyDescriptor(content.property2 ? '1' : '0').setType(
            'Boolean'
          )
        );

        return properties;
      };
      mySharedData.setRawJSONContent(
        JSON.stringify({
          property1: 'Initial value 1',
          property2: true,
        })
      );

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

  describe('gd.MapStringPropertyDescriptor', function() {
    it('can be used to manipulate properties', function() {
      var properties = new gd.MapStringPropertyDescriptor();
      expect(properties.has('Property0')).toBe(false);

      properties.set('Property1', new gd.PropertyDescriptor('Hello Property1'));
      expect(properties.get('Property1').getValue()).toBe('Hello Property1');
      expect(properties.get('Property1').getType()).toBe('string');
      properties.get('Property1').setValue('Hello modified Property1');
      expect(properties.get('Property1').getValue()).toBe(
        'Hello modified Property1'
      );
      expect(properties.keys().toJSArray()).not.toContain('Property0');
      expect(properties.keys().toJSArray()).toContain('Property1');

      properties.set(
        'Property0',
        new gd.PropertyDescriptor('Hello Property0')
          .setType('another type')
          .addExtraInfo('Info1')
          .addExtraInfo('Info3')
      );
      expect(properties.get('Property0').getValue()).toBe('Hello Property0');
      expect(properties.get('Property0').getType()).toBe('another type');
      expect(
        properties
          .get('Property0')
          .getExtraInfo()
          .toJSArray()
      ).toContain('Info1');
      expect(
        properties
          .get('Property0')
          .getExtraInfo()
          .toJSArray()
      ).not.toContain('Info2');
      expect(
        properties
          .get('Property0')
          .getExtraInfo()
          .toJSArray()
      ).toContain('Info3');
      expect(properties.has('Property0')).toBe(true);
      expect(properties.has('Property1')).toBe(true);
      expect(properties.keys().toJSArray()).toContain('Property0');
      expect(properties.keys().toJSArray()).toContain('Property1');
    });
  });

  describe('gd.BehaviorJsImplementation', function() {
    it('can declare a gd.BehaviorJsImplementation and pass sanity checks', function() {
      var myBehavior = new gd.BehaviorJsImplementation();
      myBehavior.updateProperty = function(content, propertyName, newValue) {
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
      myBehavior.getProperties = function(content) {
        var properties = new gd.MapStringPropertyDescriptor();

        properties.set(
          'My first property',
          new gd.PropertyDescriptor(content.property1)
        );
        properties.set(
          'My other property',
          new gd.PropertyDescriptor(content.property2 ? '1' : '0').setType(
            'Boolean'
          )
        );

        return properties;
      };
      myBehavior.setRawJSONContent(
        JSON.stringify({
          property1: 'Initial value 1',
          property2: true,
        })
      );

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

  describe('gd.Object', function() {
    var project = null;
    var layout = null;
    var object = null;
    var object2 = null;

    beforeAll(() => {
      project = gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      object = layout.insertNewObject(project, 'Sprite', 'MyObject', 0);
      object2 = layout.insertNewObject(project, 'Sprite', 'MyObject2', 1);
    });

    it('has properties and initial values', function() {
      object.setName('TheObject');
      expect(object.getName()).toBe('TheObject');
      expect(object.hasBehaviorNamed('DoNotExists')).toBe(false);
    });

    it('can have its type retrieved with gd.getTypeOfObject', function() {
      expect(gd.getTypeOfObject(project, layout, 'TheObject', true)).toBe(
        'Sprite'
      );
    });

    it('can have behaviors', function() {
      var behavior = object.addNewBehavior(
        project,
        'DraggableBehavior::Draggable',
        'Draggable'
      );
      expect(object.hasBehaviorNamed('Draggable')).toBe(true);
      expect(object.getBehavior('Draggable')).toBe(behavior);
    });

    it('can have its behaviors retrieved with gd.getBehaviorsOfObject', function() {
      var behaviors = gd.getBehaviorsOfObject(
        project,
        layout,
        'TheObject',
        true
      );
      expect(behaviors.size()).toBe(1);
      expect(behaviors.get(0)).toBe('Draggable');
    });

    it('can be un/serialized', function() {
      var serializerElement = new gd.SerializerElement();
      object.serializeTo(serializerElement);
      object2.unserializeFrom(project, serializerElement);
      object2.unserializeFrom(project, serializerElement); // Also check that multiple
      object2.unserializeFrom(project, serializerElement); // unserialization is idempotent
      serializerElement.delete();

      //Check that behaviors were persisted and restored
      var behaviors = object2.getAllBehaviorNames();
      expect(behaviors.size()).toBe(1);
      expect(behaviors.at(0)).toBe('Draggable');
    });

    afterAll(function() {
      project.delete();
    });
  });

  describe('gd.ObjectJsImplementation', function() {
    const createSampleObjectJsImplementation = () => {
      var myObject = new gd.ObjectJsImplementation();
      myObject.updateProperty = function(content, propertyName, newValue) {
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
      myObject.getProperties = function(content) {
        var properties = new gd.MapStringPropertyDescriptor();

        properties.set(
          'My first property',
          new gd.PropertyDescriptor(content.property1)
        );
        properties.set(
          'My other property',
          new gd.PropertyDescriptor(content.property2 ? '1' : '0').setType(
            'Boolean'
          )
        );

        return properties;
      };
      myObject.setRawJSONContent(
        JSON.stringify({
          property1: 'Initial value 1',
          property2: true,
        })
      );

      myObject.updateInitialInstanceProperty = function(
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
          instance.setRawFloatProperty('instanceprop2', parseFloat(newValue));
          return true;
        }

        return false;
      };
      myObject.getInitialInstanceProperties = function(
        content,
        instance,
        project,
        layout
      ) {
        var properties = new gd.MapStringPropertyDescriptor();

        properties.set(
          'My instance property',
          new gd.PropertyDescriptor(
            instance.getRawStringProperty('instanceprop1')
          )
        );
        properties.set(
          'My other instance property',
          new gd.PropertyDescriptor(
            instance.getRawFloatProperty('instanceprop2').toString() //TODO: How to avoid people forgetting toString?
          ).setType('number')
        );

        return properties;
      };

      return myObject;
    };

    it('can create a gd.ObjectJsImplementation and pass sanity checks', function() {
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

    it('can clone a gd.ObjectJsImplementation', function() {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const object1 = createSampleObjectJsImplementation();
      object1.updateProperty('My first property', 'test1', project);
      const object2 = object1.clone().release();
      const object3 = object1.clone().release();

      {
        const propertiesObject1 = object1.getProperties(project);
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() == 'test1'
        );
        const propertiesObject2 = object2.getProperties(project);
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() == 'test1'
        );
      }

      {
        object1.updateProperty('My first property', 'updated value', project);
        const propertiesObject1 = object1.getProperties(project);
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() ==
            'updated value'
        );
        const propertiesObject2 = object2.getProperties(project);
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() == 'test1'
        );
      }

      {
        object2.updateProperty(
          'My first property',
          'updated value object 2',
          project
        );
        const propertiesObject1 = object1.getProperties(project);
        expect(propertiesObject1.has('My first property'));
        expect(
          propertiesObject1.get('My first property').getValue() ==
            'updated value'
        );
        const propertiesObject2 = object2.getProperties(project);
        expect(propertiesObject2.has('My first property'));
        expect(
          propertiesObject2.get('My first property').getValue() ==
            'updated value object 2'
        );
        const propertiesObject3 = object3.getProperties(project);
        expect(propertiesObject3.has('My first property'));
        expect(
          propertiesObject3.get('My first property').getValue() == 'test1'
        );
      }

      project.delete();
    });
  });

  describe('gd.ObjectGroupsContainer', function() {
    var container = null;
    var group1 = null;
    var group2 = null;
    var group3 = null;

    beforeAll(() => (container = new gd.ObjectGroupsContainer()));

    it('can have groups inserted', function() {
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

    it('can move groups', function() {
      container.move(0, 1);
      expect(container.getAt(0).getName()).toBe('Group2');
      expect(container.getAt(1).getName()).toBe('Group1');
      expect(container.getAt(2).getName()).toBe('Group3');
    });

    it('can rename groups', function() {
      container.rename('Inexisting', 'Whatever');
      container.rename('Group1', 'Group1Renamed');

      expect(container.has('Group1')).toBe(false);
      expect(container.has('Group1Renamed')).toBe(true);
    });

    it('can remove groups', function() {
      container.remove('Group2');
      expect(container.has('Group2')).toBe(false);
      expect(container.has('Group3')).toBe(true);
      expect(container.count()).toBe(2);
    });
  });

  describe('gd.Instruction', function() {
    it('initial values', function() {
      var instr = new gd.Instruction();
      expect(instr.getParametersCount()).toBe(0);
      expect(instr.getSubInstructions().size()).toBe(0);
      instr.delete();
    });
    it('setting parameters', function() {
      var instr = new gd.Instruction();
      instr.setParametersCount(3);
      expect(instr.getParametersCount()).toBe(3);
      expect(instr.getParameter(1)).toBe('');
      instr.setParameter(2, 'MyValue');
      expect(instr.getParameter(2)).toBe('MyValue');
      instr.delete();
    });
    it('can be cloned', function() {
      var instr = new gd.Instruction();
      instr.setParametersCount(3);
      instr.setParameter(2, 'MyValue');

      var newInstr = instr.clone();
      expect(newInstr.getParametersCount()).toBe(3);
      expect(newInstr.getParameter(1)).toBe('');
      expect(newInstr.getParameter(2)).toBe('MyValue');

      newInstr.setParameter(2, 'MyChangedValue');
      expect(instr.getParameter(2)).toBe('MyValue');
      expect(newInstr.getParameter(2)).toBe('MyChangedValue');
      newInstr.delete();
      expect(instr.getParameter(2)).toBe('MyValue');

      instr.delete();
    });
  });

  describe('gd.InstructionsList', function() {
    var list = null;
    beforeAll(() => (list = new gd.InstructionsList()));

    it('can insert instructions', function() {
      expect(list.size()).toBe(0);
      list.insert(new gd.Instruction(), 0);
      expect(list.size()).toBe(1);
    });
    it('can modify its instructions', function() {
      expect(list.get(0).getType()).toBe('');

      var newInstr = new gd.Instruction();
      newInstr.setType('Type2');
      list.set(0, newInstr);

      expect(list.get(0).getType()).toBe('Type2');
      expect(list.size()).toBe(1);
    });
    it('can remove its instructions', function() {
      var newInstr = new gd.Instruction();
      newInstr.setType('Type3');
      var instruction = list.insert(newInstr, 1);
      expect(list.get(1).getType()).toBe('Type3');
      expect(list.size()).toBe(2);
      expect(list.contains(instruction)).toBe(true);

      list.remove(instruction);
      expect(list.size()).toBe(1);
      expect(list.get(0).getType()).toBe('Type2');
    });
    it('can clear its instructions', function() {
      list.clear();
      expect(list.size()).toBe(0);
    });
    it('can insert events from another list', function() {
      var list1 = new gd.InstructionsList();
      var list2 = new gd.InstructionsList();

      var newInstr = new gd.Instruction();
      newInstr.setType('Type1');
      list1.insert(newInstr, 0);
      var newInstr2 = new gd.Instruction();
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
    it('can be un/serialized', function() {
      var newInstr = new gd.Instruction();
      newInstr.setType('Type1');
      newInstr.setParametersCount(2);
      newInstr.setParameter(0, 'Param1');
      newInstr.setParameter(1, 'Param2');
      var instruction = list.insert(newInstr, 1);

      var newInstr2 = new gd.Instruction();
      newInstr2.setType('Type2');
      newInstr2.setParametersCount(1);
      newInstr2.setParameter(0, 'Param3');
      var instruction2 = list.insert(newInstr2, 1);

      var project = gd.ProjectHelper.createNewGDJSProject();
      var serializerElement = new gd.SerializerElement();
      list.serializeTo(serializerElement);

      var list2 = new gd.InstructionsList();
      list2.unserializeFrom(project, serializerElement);

      expect(list2.size()).toBe(2);
      expect(list2.get(0).getType()).toBe('Type1');
      expect(list2.get(1).getType()).toBe('Type2');
      expect(list2.get(0).getParametersCount()).toBe(2);
      expect(list2.get(1).getParametersCount()).toBe(1);
      expect(list2.get(0).getParameter(0)).toBe('Param1');
      expect(list2.get(0).getParameter(1)).toBe('Param2');
      expect(list2.get(1).getParameter(0)).toBe('Param3');

      list2.delete();
      project.delete();
    });

    afterAll(function() {
      list.delete();
    });
  });

  describe('InstructionSentenceFormatter', function() {
    it('should translate instructions (plain text or into a vector of text with formatting)', function() {
      var instrFormatter = gd.InstructionSentenceFormatter.get();
      instrFormatter.loadTypesFormattingFromConfig();
      var action = new gd.Instruction(); //Create a simple instruction
      action.setType('Delete');
      action.setParametersCount(2);
      action.setParameter(0, 'MyCharacter');

      var actionSentenceInEnglish = gd.InstructionSentenceFormatter.get().translate(
        action,
        gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), 'Delete')
      );
      expect(actionSentenceInEnglish).toBe('Delete object MyCharacter');

      var formattedTexts = gd.InstructionSentenceFormatter.get().getAsFormattedText(
        action,
        gd.MetadataProvider.getActionMetadata(gd.JsPlatform.get(), 'Delete')
      );

      expect(formattedTexts.size()).toBe(2);
      expect(formattedTexts.getString(0)).toBe('Delete object ');
      expect(formattedTexts.getString(1)).toBe('MyCharacter');
      expect(formattedTexts.getTextFormatting(0).isBold()).toBe(false);
      expect(formattedTexts.getTextFormatting(1).isBold()).toBe(true);
      expect(formattedTexts.getTextFormatting(0).getUserData()).not.toBe(0);
      expect(formattedTexts.getTextFormatting(1).getUserData()).toBe(0);

      instrFormatter.delete();
      action.delete();
    });
  });

  describe('gd.EventsList', function() {
    it('can have events', function() {
      var list = new gd.EventsList();
      list.insertEvent(new gd.StandardEvent(), 0);
      var lastEvent = list.insertEvent(new gd.StandardEvent(), 1);
      list.insertEvent(new gd.StandardEvent(), 1);
      expect(list.getEventsCount()).toBe(3);
      expect(list.getEventAt(2).ptr).toBe(lastEvent.ptr);
      list.delete();
    });

    it('can create lots of new events', function() {
      var project = new gd.ProjectHelper.createNewGDJSProject();
      var list = new gd.EventsList();
      for (var i = 0; i < 500; ++i) {
        var evt = list.insertNewEvent(
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

    it('can tell if it contains an event', function() {
      var list = new gd.EventsList();

      var parentEvent = list.insertEvent(new gd.StandardEvent(), 0);
      var subEvent = parentEvent
        .getSubEvents()
        .insertEvent(new gd.StandardEvent(), 0);

      expect(list.contains(parentEvent, false)).toBe(true);
      expect(list.contains(subEvent, false)).toBe(false);
      expect(list.contains(subEvent, true)).toBe(true);

      list.delete();
    });
  });

  describe('gd.BaseEvent', function() {
    it('can have a type', function() {
      var event = new gd.BaseEvent();
      event.setType('Type1');
      var event2 = new gd.BaseEvent();
      event2.setType('Type2');

      expect(event.getType()).toBe('Type1');
      expect(event2.getType()).toBe('Type2');

      event.delete();
      event2.delete();
    });

    it('can be cloned', function() {
      var event = new gd.BaseEvent();
      event.setType('Type1');
      var event2 = event.clone();

      expect(event.getType()).toBe('Type1');
      expect(event2.getType()).toBe('Type1');

      event.delete();
      event2.delete();
    });

    it('can be de/serialized', function() {
      var event = new gd.BaseEvent();
      expect(typeof event.serializeTo).toBe('function');
      expect(typeof event.unserializeFrom).toBe('function');
      event.delete();
    });
  });

  describe('gd.ArbitraryEventsWorker', function() {
    describe('gd.EventsParametersLister', function() {
      it('can list parameters and their types', function() {
        var project = new gd.ProjectHelper.createNewGDJSProject();
        var list = new gd.EventsList();

        var evt = new gd.StandardEvent();
        var actions = evt.getActions();
        var act = new gd.Instruction();
        act.setType('Delete');
        act.setParametersCount(1);
        act.setParameter(0, 'MyObject');
        actions.push_back(act);
        evt = list.insertEvent(evt, 0);

        var subEvt = new gd.StandardEvent();
        var conditions = subEvt.getConditions();
        var cnd = new gd.Instruction();
        cnd.setType('PosX');
        cnd.setParametersCount(3);
        cnd.setParameter(0, 'MyObject');
        cnd.setParameter(1, '<');
        cnd.setParameter(2, '300');
        conditions.push_back(cnd);
        evt.getSubEvents().insertEvent(subEvt, 0);

        var parametersLister = new gd.EventsParametersLister(project);
        parametersLister.launch(list);

        expect(
          parametersLister
            .getParametersAndTypes()
            .keys()
            .size()
        ).toBe(3);
        expect(parametersLister.getParametersAndTypes().get('MyObject')).toBe(
          'object'
        );
        expect(parametersLister.getParametersAndTypes().get('300')).toBe(
          'expression'
        );

        project.delete();
        list.delete();
      });
    });
  });

  describe('gd.GroupEvent', function() {
    it('handle basic properties', function() {
      const evt = new gd.GroupEvent();
      evt.setName('MyName');
      evt.setSource('http://source.url');
      evt.setCreationTimestamp(150);
      expect(evt.getName()).toBe('MyName');
      expect(evt.getSource()).toBe('http://source.url');
      expect(evt.getCreationTimestamp()).toBe(150);
    });
    it('can be folded', function() {
      const evt = new gd.GroupEvent();
      expect(evt.isFolded()).toBe(false);
      evt.setFolded(true);
      expect(evt.isFolded()).toBe(true);
    });
    it('can remember parameters used to create the group from a template event', function() {
      const evt = new gd.GroupEvent();
      var parameters = evt.getCreationParameters();
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

  describe('gd.StandardEvent', function() {
    it('initial values', function() {
      const evt = new gd.StandardEvent();
      expect(evt.canHaveSubEvents()).toBe(true);
      expect(evt.isExecutable()).toBe(true);
    });
    it('conditions and actions', function() {
      const evt = new gd.StandardEvent();
      var conditions = evt.getConditions();
      expect(evt.getConditions().size()).toBe(0);
      var cnd = new gd.Instruction();
      conditions.push_back(cnd);
      expect(evt.getConditions().size()).toBe(1);

      var actions = evt.getActions();
      expect(evt.getActions().size()).toBe(0);
      var act = new gd.Instruction();
      actions.push_back(act);
      expect(evt.getActions().size()).toBe(1);
    });

    afterAll(function() {
      evt.delete();
    });
  });
  describe('gd.CommentEvent', function() {
    it('initial values', function() {
      const evt = new gd.CommentEvent();
      expect(evt.canHaveSubEvents()).toBe(false);
      expect(evt.isExecutable()).toBe(false);
    });
    it('can have a comment', function() {
      const evt = new gd.CommentEvent();
      evt.setComment('My nice comment about my events!');
      expect(evt.getComment()).toBe('My nice comment about my events!');
    });
    it('can have a comment with UTF8 characters', function() {
      const evt = new gd.CommentEvent();
      evt.setComment('Hello 官话 world!');
      expect(evt.getComment()).toBe('Hello 官话 world!');
    });
    it('can have a background color', function() {
      const evt = new gd.CommentEvent();
      evt.setBackgroundColor(100, 200, 255);
      expect(evt.getBackgroundColorRed()).toBe(100);
      expect(evt.getBackgroundColorGreen()).toBe(200);
      expect(evt.getBackgroundColorBlue()).toBe(255);
    });
    it('can have a text color', function() {
      const evt = new gd.CommentEvent();
      evt.setTextColor(101, 201, 254);
      expect(evt.getTextColorRed()).toBe(101);
      expect(evt.getTextColorGreen()).toBe(201);
      expect(evt.getTextColorBlue()).toBe(254);
    });
  });

  describe('gd.SpriteObject', function() {
    it('can have animations', function() {
      var obj = new gd.SpriteObject('MySpriteObject');
      obj.addAnimation(new gd.Animation());
      obj.addAnimation(new gd.Animation());
      expect(obj.getAnimationsCount()).toBe(2);
      obj.removeAnimation(1);
      expect(obj.getAnimationsCount()).toBe(1);
    });

    it('can swap animations', function() {
      var obj = new gd.SpriteObject('MySpriteObject');
      obj.removeAllAnimations();
      var anim1 = new gd.Animation();
      var anim2 = new gd.Animation();
      var sprite1 = new gd.Sprite();
      var sprite2 = new gd.Sprite();

      sprite1.setImageName('image1');
      sprite2.setImageName('image2');

      anim1.setDirectionsCount(1);
      anim2.setDirectionsCount(1);
      anim1.getDirection(0).addSprite(sprite1);
      anim2.getDirection(0).addSprite(sprite2);

      obj.addAnimation(anim1);
      obj.addAnimation(anim2);
      expect(
        obj
          .getAnimation(0)
          .getDirection(0)
          .getSprite(0)
          .getImageName()
      ).toBe('image1');
      obj.swapAnimations(0, 1);
      expect(
        obj
          .getAnimation(0)
          .getDirection(0)
          .getSprite(0)
          .getImageName()
      ).toBe('image2');
    });

    describe('gd.Direction', function() {
      it('can swap sprites', function() {
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

      it('can move sprites', function() {
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

      it('can have metadata', function() {
        const direction = new gd.Direction();
        expect(direction.getMetadata()).toBe('');
        direction.setMetadata('{test: 1}');
        expect(direction.getMetadata()).toBe('{test: 1}');
        direction.delete();
      });
    });

    describe('gd.Sprite', function() {
      it('can have default points', function() {
        var sprite1 = new gd.Sprite();
        sprite1.getCenter().setX(2);
        sprite1.getCenter().setY(3);
        sprite1.getOrigin().setX(4);
        sprite1.getOrigin().setY(5);
        expect(sprite1.getCenter().getX()).toBe(2);
        expect(sprite1.getCenter().getY()).toBe(3);
        expect(sprite1.getOrigin().getX()).toBe(4);
        expect(sprite1.getOrigin().getY()).toBe(5);
      });

      it('can have custom points', function() {
        var sprite1 = new gd.Sprite();
        var point = new gd.Point('test');
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

  describe('gd.MetadataProvider', function() {
    it('can return metadata about expressions (even if they do not exist)', function() {
      expect(
        gd.MetadataProvider.hasExpression(
          gd.JsPlatform.get(),
          'NotExistingExpression'
        )
      ).toBe(false);
      expect(
        gd.MetadataProvider.getExpressionMetadata(
          gd.JsPlatform.get(),
          'NotExistingExpression'
        ).getFullName()
      ).toBe('');
    });

    describe('gd.ObjectMetadata', function() {
      it('can return standard information about Sprite object', function() {
        var objMetadata = gd.MetadataProvider.getObjectMetadata(
          gd.JsPlatform.get(),
          'Sprite'
        );

        expect(objMetadata.getName()).toBe('Sprite');
        expect(objMetadata.getFullName()).toBe('Sprite');
        expect(objMetadata.getDescription().length).not.toBe(0);
        expect(objMetadata.getIconFilename().length).not.toBe(0);
      });
    });
    describe('gd.BehaviorMetadata', function() {
      it('have standard methods to get information', function() {
        var autoMetadata = gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          'NotExistingBehavior'
        );

        expect(autoMetadata.getFullName).not.toBe(undefined);
        expect(autoMetadata.getDefaultName).not.toBe(undefined);
        expect(autoMetadata.getDescription).not.toBe(undefined);
        expect(autoMetadata.getGroup).not.toBe(undefined);
        expect(autoMetadata.getIconFilename).not.toBe(undefined);
      });
    });
  });

  describe('gd.ResourcesMergingHelper (and gd.AbstractFileSystemJS)', function() {
    it('should export files of the project', function() {
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

      const fs = new gd.AbstractFileSystemJS();
      fs.mkDir = fs.clearDir = function() {};
      fs.getTempDir = function(path) {
        return '/tmp/';
      };
      fs.fileNameFrom = function(fullpath) {
        return path.basename(fullpath);
      };
      fs.dirNameFrom = function(fullpath) {
        return path.dirname(fullpath);
      };
      fs.makeAbsolute = function(relativePath, baseDirectory) {
        return path.resolve(baseDirectory, relativePath);
      };
      fs.makeRelative = function(absolutePath, baseDirectory) {
        return path.relative(baseDirectory, absolutePath);
      };

      const resourcesMergingHelper = new gd.ResourcesMergingHelper(fs);
      resourcesMergingHelper.setBaseDirectory('/my/project/');
      project.exposeResources(resourcesMergingHelper);

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

  describe('gd.Exporter (and gd.AbstractFileSystemJS)', function() {
    it('should export a layout for preview', function(done) {
      var fs = new gd.AbstractFileSystemJS();
      var project = new gd.ProjectHelper.createNewGDJSProject();
      var layout = project.insertNewLayout('Scene', 0);

      fs.mkDir = fs.clearDir = function() {};
      fs.getTempDir = function(path) {
        return '/tmp/';
      };
      fs.fileNameFrom = function(fullpath) {
        return path.basename(fullpath);
      };
      fs.dirNameFrom = function(fullpath) {
        return path.dirname(fullpath);
      };
      fs.writeToFile = function(path, content) {
        //Validate that some code have been generated:
        expect(content).toMatch('runtimeScene.getOnceTriggers().startNewFrame');
        done();
      };

      var exporter = new gd.Exporter(fs);
      exporter.exportLayoutForPixiPreview(project, layout, '/path/for/export/');
      exporter.delete();
    });
  });

  describe('gd.EventsRemover', function() {
    it('should remove events', function() {
      var list = new gd.EventsList();
      var event1 = list.insertEvent(new gd.StandardEvent(), 0);
      var event2 = list.insertEvent(new gd.StandardEvent(), 1);
      var event3 = list.insertEvent(new gd.StandardEvent(), 2);

      var remover = new gd.EventsRemover();
      remover.addEventToRemove(event1);
      remover.addEventToRemove(event3);
      remover.launch(list);

      expect(list.getEventsCount()).toBe(1);
      expect(list.getEventAt(0)).toBe(event2);
    });
  });

  describe('gd.WholeProjectRefactorer', function() {
    it('should rename and delete an object', function() {
      var project = new gd.ProjectHelper.createNewGDJSProject();
      var layout = project.insertNewLayout('Scene', 0);
      var instance1 = layout.getInitialInstances().insertNewInitialInstance();
      var instance2 = layout.getInitialInstances().insertNewInitialInstance();
      instance1.setObjectName('Object1');
      instance2.setObjectName('Object2');

      gd.WholeProjectRefactorer.objectRenamedInLayout(
        project,
        layout,
        'Object1',
        'Object3'
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

      gd.WholeProjectRefactorer.objectRemovedInLayout(
        project,
        layout,
        'Object3',
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
  });

  describe('gd.ExpressionParser and gd.CallbacksForExpressionCorrectnessTesting', function() {
    let project = null;
    let layout = null;
    beforeAll(() => {
      project = new gd.ProjectHelper.createNewGDJSProject();
      layout = project.insertNewLayout('Scene', 0);
      layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);
    });

    function testMathExpression(
      expression,
      expectedError,
      expectedErrorPosition
    ) {
      var callbacks, parser;

      callbacks = new gd.CallbacksForExpressionCorrectnessTesting(
        project,
        layout
      );
      parser = new gd.ExpressionParser(expression);
      expect(
        parser.parseMathExpression(
          project.getCurrentPlatform(),
          project,
          layout,
          callbacks
        )
      ).toBe(!expectedError);
      if (expectedError) expect(parser.getFirstError()).toBe(expectedError);
      if (expectedErrorPosition)
        expect(parser.getFirstErrorPosition()).toBe(expectedErrorPosition);
      parser.delete();
      callbacks.delete();
    }

    it('can parse valid expressions', function() {
      testMathExpression('1+1');
      testMathExpression('2-3');
      testMathExpression('4/5');
      testMathExpression('6*7');
      testMathExpression('8 + 9');
      testMathExpression('10 +    11');
      testMathExpression('12 +    13 - 14');
      testMathExpression('  15 +    16 - 17   ');
    });

    it('report errors in invalid expressions', function() {
      testMathExpression('1//2', 'Operators without any number between them');
      testMathExpression('bad expression', 'Syntax error');
      testMathExpression('1 + test()', 'Syntax error');
    });

    it('can parse valid expressions with free functions', function() {
      testMathExpression('1+sin(3.14)');
      testMathExpression('abs(-5)');
      testMathExpression('abs(-5) + cos(sin(3))');
      testMathExpression('atan2(-5, 3)');
      testMathExpression('MouseX("", 0) + 1');
    });

    it('can report errors when using too much arguments', function() {
      testMathExpression(
        'abs(-5, 3)',
        'Incorrect number of parameters Expected (maximum) :1'
      );
      testMathExpression(
        'MouseX("", 0, 0) + 1',
        'Incorrect number of parameters Expected (maximum) :2'
      );
    });

    it('can parse valid expressions with free functions having optional parameters', function() {
      testMathExpression('MouseX() + 1');
      testMathExpression('MouseX("") + 1');
    });

    it('can parse expressions with objects functions', function() {
      testMathExpression('MySpriteObject.X()');
      testMathExpression('MySpriteObject.X() + 1');
      testMathExpression('MySpriteObject.PointX("Point")');
    });

    it('can report errors when using too much arguments in object functions', function() {
      testMathExpression(
        'MySpriteObject.PointX("Point", 2)',
        'Incorrect number of parameters Expected (maximum) :2'
      );
    });

    it('can parse arguments being expressions', function() {
      testMathExpression('MouseX(VariableString(myVariable), 0) + 1');
    });
  });

  describe('gd.ExpressionParser2 and gd.ExpressionValidator', function() {
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
      expectedErrorPosition
    ) {
      const parser = new gd.ExpressionParser2(
        gd.JsPlatform.get(),
        project,
        layout
      );
      const expressionNode = parser.parseExpression(type, expression).get();

      const expressionValidator = new gd.ExpressionValidator();
      expressionNode.visit(expressionValidator);
      if (expectedError) {
        expect(expressionValidator.getErrors().size()).toBe(1);
        expect(
          expressionValidator
            .getErrors()
            .at(0)
            .getMessage()
        ).toBe(expectedError);
        if (expectedErrorPosition)
          expect(
            expressionValidator
              .getErrors()
              .at(0)
              .getStartPosition()
          ).toBe(expectedErrorPosition);
      } else {
        expect(expressionValidator.getErrors().size()).toBe(0);
      }

      expressionValidator.delete();
      parser.delete();
    }

    it('can parse valid expressions', function() {
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

    it('report errors in invalid expressions', function() {
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

    it('can parse valid expressions with free functions', function() {
      testExpression('number', '1+sin(3.14)');
      testExpression('number', 'abs(-5)');
      testExpression('number', 'abs(-5) + cos(sin(3))');
      testExpression('number', 'atan2(-5, 3)');
      testExpression('number', 'MouseX("", 0) + 1');
    });

    it('can report errors when using too much arguments', function() {
      testExpression(
        'number',
        'abs(-5, 3)',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name."
      );
      testExpression(
        'number',
        'MouseX("", 0, 0) + 1',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name."
      );
    });

    it('can parse valid expressions with free functions having optional parameters', function() {
      testExpression('number', 'MouseX() + 1');
      testExpression('number', 'MouseX("") + 1');
    });

    it('can parse expressions with objects functions', function() {
      testExpression('number', 'MySpriteObject.X()');
      testExpression('number', 'MySpriteObject.X() + 1');
      testExpression('number', 'MySpriteObject.PointX("Point")');
    });

    it('can report errors when using too much arguments in object functions', function() {
      testExpression(
        'number',
        'MySpriteObject.PointX("Point", 2)',
        "This parameter was not expected by this expression. Remove it or verify that you've entered the proper expression name."
      );
    });

    it('can parse arguments being expressions', function() {
      testExpression('number', 'MouseX(VariableString(myVariable), 0) + 1');
    });
  });

  describe('gd.Vector2f', function() {
    describe('gd.VectorVector2f', function() {
      it('can be used to manipulate a vector of gd.Vector2f', function() {
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

        gd.removeFromVectorVector2f(vectorVector2f, 1);
        expect(vectorVector2f.size()).toBe(2);
        expect(vectorVector2f.at(0).get_x()).toBe(1);
        expect(vectorVector2f.at(1).get_x()).toBe(3);

        vectorVector2f.clear();
        expect(vectorVector2f.size()).toBe(0);
      });
    });
  });

  describe('gd.PlatformExtension', function() {
    it('can be created and have basic information filled', function() {
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

      expect(extension.getName()).toBe('TestExtensionName');
      expect(extension.getFullName()).toBe('Full name of test extension');
      expect(extension.getDescription()).toBe('Description of test extension');
      expect(extension.getAuthor()).toBe('Author of test extension');
      expect(extension.getLicense()).toBe('License of test extension');
      expect(extension.getHelpPath()).toBe('/path/to/extension/help');
      extension.delete();
    });
  });

  describe('gd.Platform (using gd.JsPlatform)', function() {
    it('can have extension added and removed', function() {
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

    it('has a namespace separator', function() {
      expect(gd.PlatformExtension.getNamespaceSeparator()).toBe('::');
    });
  });

  describe('gd.ParameterMetadataTools', function() {
    it('can tell the type of a parameter', function() {
      expect(gd.ParameterMetadata.isObject('object')).toBe(true);
      expect(gd.ParameterMetadata.isObject('objectPtr')).toBe(true);
      expect(gd.ParameterMetadata.isObject('123')).toBe(false);
      expect(gd.ParameterMetadata.isBehavior('behavior')).toBe(true);
      expect(gd.ParameterMetadata.isBehavior('behavior34234')).toBe(false);
    });

    it('can create an object container from parameters', function() {
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

    it('can give the previous object parameter', function() {
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
      ).toBe(-1);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 1)
      ).toBe(0);
      expect(
        gd.ParameterMetadataTools.getObjectParameterIndexFor(parameters, 2)
      ).toBe(0);
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
    it('can store events', function() {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const eventsFunction = new gd.EventsFunction();
      const events = eventsFunction.getEvents();
      expect(events.getEventsCount()).toBe(0);
      var evt = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      expect(events.getEventsCount()).toBe(1);
      eventsFunction.delete();
      project.delete();
    });
    it('can have a name, fullname and description', function() {
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
    it('can have a namespace, version, name, fullname, description', function() {
      const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
      eventsFunctionsExtension.setNamespace('MyExt');
      eventsFunctionsExtension.setVersion('1.1');
      eventsFunctionsExtension.setName('My name');
      eventsFunctionsExtension.setFullName('My descriptive name');
      eventsFunctionsExtension.setDescription('My description');
      expect(eventsFunctionsExtension.getNamespace()).toBe('MyExt');
      expect(eventsFunctionsExtension.getVersion()).toBe('1.1');
      expect(eventsFunctionsExtension.getName()).toBe('My name');
      expect(eventsFunctionsExtension.getFullName()).toBe(
        'My descriptive name'
      );
      expect(eventsFunctionsExtension.getDescription()).toBe('My description');

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
  });
});

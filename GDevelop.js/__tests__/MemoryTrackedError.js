const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('MemoryTrackedError', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('MemoryTrackedRegistry', function () {
    it('is exposed on the module', function () {
      expect(gd.MemoryTrackedRegistry).toBeDefined();
      expect(typeof gd.MemoryTrackedRegistry.isDead).toBe('function');
      expect(typeof gd.MemoryTrackedRegistry.aliveCount).toBe('function');
      expect(typeof gd.MemoryTrackedRegistry.deadCount).toBe('function');
      expect(typeof gd.MemoryTrackedRegistry.pruneDead).toBe('function');
    });
  });

  describe('Layout - C++ side deletion', function () {
    it('throws MemoryTrackedError when calling setName on a removed layout', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('TestScene', 0);
      const layout = project.getLayout('TestScene');

      // Verify layout is alive
      expect(layout.getName()).toBe('TestScene');

      // Remove layout from C++ side
      project.removeLayout('TestScene');

      // Now calling setName should throw MemoryTrackedError
      expect(() => layout.setName('NewName')).toThrow(gd.MemoryTrackedError);

      // Also verify getName throws
      expect(() => layout.getName()).toThrow(gd.MemoryTrackedError);

      project.delete();
    });
  });

  describe('Object - C++ side deletion', function () {
    it('throws MemoryTrackedError when calling methods on a removed object', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('TestScene', 0);
      layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MyObject', 0);
      const obj = layout.getObjects().getObject('MyObject');

      // Verify object is alive
      expect(obj.getName()).toBe('MyObject');

      // Remove object from C++ side
      layout.getObjects().removeObject('MyObject');

      // Now calling setName should throw MemoryTrackedError
      expect(() => obj.setName('NewName')).toThrow(gd.MemoryTrackedError);

      // Also verify getName throws
      expect(() => obj.getName()).toThrow(gd.MemoryTrackedError);

      project.delete();
    });
  });

  describe('Behavior - C++ side deletion', function () {
    it('throws MemoryTrackedError when calling methods on a removed behavior', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('TestScene', 0);
      const obj = layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MyObject', 0);

      const behavior = obj.addNewBehavior(
        project,
        'DraggableBehavior::Draggable',
        'Draggable'
      );

      // Verify behavior is alive
      expect(behavior.getName()).toBe('Draggable');

      // Remove behavior from C++ side
      obj.removeBehavior('Draggable');

      // Now calling getName should throw MemoryTrackedError
      expect(() => behavior.getName()).toThrow(gd.MemoryTrackedError);

      project.delete();
    });
  });

  describe('Explicit .delete() calls', function () {
    it('throws MemoryTrackedError on a Project after .delete()', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      expect(project.getName()).toBeDefined();

      project.delete();

      expect(() => project.setName('Test')).toThrow(gd.MemoryTrackedError);
      expect(() => project.getName()).toThrow(gd.MemoryTrackedError);
    });

    it('throws MemoryTrackedError on a Layout after parent project .delete()', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('TestScene', 0);
      expect(layout.getName()).toBe('TestScene');

      project.delete();

      expect(() => layout.setName('NewName')).toThrow(gd.MemoryTrackedError);
    });

    it('throws MemoryTrackedError on an Object after parent project .delete()', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('TestScene', 0);
      const obj = layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MyObject', 0);
      expect(obj.getName()).toBe('MyObject');

      project.delete();

      expect(() => obj.setName('NewName')).toThrow(gd.MemoryTrackedError);
    });
  });
});

const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('Use-after-free detection (MemoryTracked)', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('Untracked class (VectorString)', function () {
    it('works normally when alive', function () {
      const vec = new gd.VectorString();
      vec.push_back('hello');
      expect(vec.size()).toBe(1);
      expect(vec.at(0)).toBe('hello');
      vec.delete();
    });

    it('throws MemoryTrackedError after delete()', function () {
      const vec = new gd.VectorString();
      vec.push_back('hello');
      vec.delete();

      expect(() => vec.size()).toThrow(gd.MemoryTrackedError);
    });
  });

  describe('Tracked class (Layout) - JS deletion', function () {
    it('works normally when alive', function () {
      const layout = new gd.Layout();
      layout.setName('TestScene');
      expect(layout.getName()).toBe('TestScene');
      layout.delete();
    });

    it('throws MemoryTrackedError after delete()', function () {
      const layout = new gd.Layout();
      layout.setName('TestScene');
      layout.delete();

      expect(() => layout.getName()).toThrow(gd.MemoryTrackedError);
    });
  });

  describe('Tracked class (Layout) - C++ deletion', function () {
    it('throws MemoryTrackedError when C++ deletes the underlying object', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('MyScene', 0);

      // Get a reference to the layout.
      const layout = project.getLayout('MyScene');
      expect(layout.getName()).toBe('MyScene');

      // C++ deletes the layout when we remove it from the project.
      project.removeLayout('MyScene');

      // The JS wrapper still has a non-zero ptr, but the object is dead.
      expect(() => layout.getName()).toThrow(gd.MemoryTrackedError);

      project.delete();
    });
  });

  describe('MemoryTrackedRegistry API', function () {
    it('reports dead objects correctly', function () {
      // deadCount should be accessible.
      const count = gd.MemoryTrackedRegistry.deadCount();
      expect(typeof count).toBe('number');
    });

    it('pruneDead clears dead set when over limit', function () {
      const countBefore = gd.MemoryTrackedRegistry.deadCount();
      // Pruning with a high limit should not clear.
      gd.MemoryTrackedRegistry.pruneDead(countBefore + 1000);
      expect(gd.MemoryTrackedRegistry.deadCount()).toBe(countBefore);

      // Pruning with 0 should clear everything.
      gd.MemoryTrackedRegistry.pruneDead(0);
      expect(gd.MemoryTrackedRegistry.deadCount()).toBe(0);
    });
  });

  describe('Tracked class (Project)', function () {
    it('throws MemoryTrackedError after delete()', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setName('Test');
      expect(project.getName()).toBe('Test');
      project.delete();

      expect(() => project.getName()).toThrow(gd.MemoryTrackedError);
    });
  });
});

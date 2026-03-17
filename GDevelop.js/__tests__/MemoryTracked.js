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

    it('throws UseAfterFreeError after delete()', function () {
      const vec = new gd.VectorString();
      vec.push_back('hello');
      vec.delete();

      expect(() => vec.size()).toThrow(gd.UseAfterFreeError);
    });

    it('includes destruction context in the error after delete()', function () {
      const vec = new gd.VectorString();
      vec.push_back('hello');
      vec.delete();

      try {
        vec.size();
        fail('Expected UseAfterFreeError');
      } catch (e) {
        expect(e).toBeInstanceOf(gd.UseAfterFreeError);
        expect(e.message).toContain('Destruction stack:');
        expect(e.message).toContain('ms ago');
      }
    });
  });

  describe('Tracked class (Layout) - JS deletion', function () {
    it('works normally when alive', function () {
      const layout = new gd.Layout();
      layout.setName('TestScene');
      expect(layout.getName()).toBe('TestScene');
      layout.delete();
    });

    it('throws UseAfterFreeError after delete()', function () {
      const layout = new gd.Layout();
      layout.setName('TestScene');
      layout.delete();

      expect(() => layout.getName()).toThrow(gd.UseAfterFreeError);
    });

    it('includes destruction stack and timing in the error for JS deletion', function () {
      const layout = new gd.Layout();
      layout.setName('TestScene');
      layout.delete();

      try {
        layout.getName();
        fail('Expected UseAfterFreeError');
      } catch (e) {
        expect(e).toBeInstanceOf(gd.UseAfterFreeError);
        expect(e.message).toContain('destroyed from JavaScript');
        expect(e.message).toContain('Destroyed');
        expect(e.message).toContain('ms ago');
        expect(e.message).toContain('Destruction stack:');
        expect(e.message).toContain('Object destroyed here');
      }
    });
  });

  describe('Tracked class (Layout) - C++ deletion', function () {
    it('throws UseAfterFreeError when C++ deletes the underlying object', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('MyScene', 0);

      // Get a reference to the layout.
      const layout = project.getLayout('MyScene');
      expect(layout.getName()).toBe('MyScene');

      // C++ deletes the layout when we remove it from the project.
      project.removeLayout('MyScene');

      // The JS wrapper still has a non-zero ptr, but the object is dead.
      expect(() => layout.getName()).toThrow(gd.UseAfterFreeError);

      project.delete();
    });

    it('includes last successful call in the error for C++ deletion', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('MyScene', 0);

      const layout = project.getLayout('MyScene');
      // Call a method so _lastSuccessfulCall is set.
      layout.setName('RenamedScene');
      expect(layout.getName()).toBe('RenamedScene');

      // C++ deletes the layout.
      project.removeLayout('RenamedScene');

      try {
        layout.getName();
        fail('Expected UseAfterFreeError');
      } catch (e) {
        expect(e).toBeInstanceOf(gd.UseAfterFreeError);
        expect(e.message).toContain('destroyed on C++ side');
        expect(e.message).toContain('Last successful method call on this wrapper');
        // The last successful call was getName (from the expect above).
        expect(e.message).toContain('Layout.getName');
      }

      project.delete();
    });
  });

  describe('MemoryTrackedRegistry API', function () {
    it('reports dead objects correctly', function () {
      const count = gd.MemoryTrackedRegistry.getDeadCount();
      expect(typeof count).toBe('number');
    });

    it('pruneDead clears dead set when over limit', function () {
      const countBefore = gd.MemoryTrackedRegistry.getDeadCount();
      // Pruning with a high limit should not clear.
      gd.MemoryTrackedRegistry.pruneDead(countBefore + 1000);
      expect(gd.MemoryTrackedRegistry.getDeadCount()).toBe(countBefore);

      // Pruning with 0 should clear everything.
      gd.MemoryTrackedRegistry.pruneDead(0);
      expect(gd.MemoryTrackedRegistry.getDeadCount()).toBe(0);
    });
  });

  describe('Per-class stats', function () {
    it('reports per-class alive and dead counts', function () {
      const aliveBefore = gd.MemoryTrackedRegistry.getAliveCountForClass('Layout');
      const layout1 = new gd.Layout();
      const layout2 = new gd.Layout();
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('Layout')).toBe(
        aliveBefore + 2
      );

      layout1.delete();
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('Layout')).toBe(
        aliveBefore + 1
      );
      expect(
        gd.MemoryTrackedRegistry.getDeadCountForClass('Layout')
      ).toBeGreaterThan(0);

      layout2.delete();
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('Layout')).toBe(aliveBefore);
    });

    it('returns 0 for unknown classes', function () {
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('NonExistent')).toBe(0);
      expect(gd.MemoryTrackedRegistry.getDeadCountForClass('NonExistent')).toBe(0);
    });

    it('returns totals when given empty string', function () {
      const totalAlive = gd.MemoryTrackedRegistry.getAliveCount();
      expect(totalAlive).toBeGreaterThan(0);
      const totalDead = gd.MemoryTrackedRegistry.getDeadCount();
      expect(typeof totalDead).toBe('number');
    });

    it('tracks different classes independently', function () {
      const layoutAliveBefore = gd.MemoryTrackedRegistry.getAliveCountForClass('Layout');
      const projectAliveBefore = gd.MemoryTrackedRegistry.getAliveCountForClass('Project');

      const layout = new gd.Layout();
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('Layout')).toBe(
        layoutAliveBefore + 1
      );
      expect(gd.MemoryTrackedRegistry.getAliveCountForClass('Project')).toBe(
        projectAliveBefore
      );

      layout.delete();
    });
  });

  describe('Tracked class (Project)', function () {
    it('throws UseAfterFreeError after delete()', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.setName('Test');
      expect(project.getName()).toBe('Test');
      project.delete();

      expect(() => project.getName()).toThrow(gd.UseAfterFreeError);
    });
  });

  describe('Multiple instances with mixed lifetimes', function () {
    it('independently tracks alive and dead layouts', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();

      project.insertNewLayout('SceneA', 0);
      project.insertNewLayout('SceneB', 1);
      project.insertNewLayout('SceneC', 2);

      const layoutA = project.getLayout('SceneA');
      const layoutB = project.getLayout('SceneB');
      const layoutC = project.getLayout('SceneC');

      // All alive.
      expect(layoutA.getName()).toBe('SceneA');
      expect(layoutB.getName()).toBe('SceneB');
      expect(layoutC.getName()).toBe('SceneC');

      // Kill only B via C++ deletion.
      project.removeLayout('SceneB');

      // A and C still alive, B is dead.
      expect(layoutA.getName()).toBe('SceneA');
      expect(() => layoutB.getName()).toThrow(gd.UseAfterFreeError);
      expect(layoutC.getName()).toBe('SceneC');

      // Now kill A too.
      project.removeLayout('SceneA');
      expect(() => layoutA.getName()).toThrow(gd.UseAfterFreeError);
      expect(layoutC.getName()).toBe('SceneC');

      // C survives until project deletion.
      project.delete();
      expect(() => layoutC.getName()).toThrow(gd.UseAfterFreeError);
    });

    it('handles interleaved JS and C++ deletions', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();

      // Create a standalone layout (JS-owned) and a project layout (C++-owned).
      const standaloneLayout = new gd.Layout();
      standaloneLayout.setName('Standalone');

      project.insertNewLayout('Owned', 0);
      const ownedLayout = project.getLayout('Owned');

      // Both alive.
      expect(standaloneLayout.getName()).toBe('Standalone');
      expect(ownedLayout.getName()).toBe('Owned');

      // Delete standalone via JS.
      standaloneLayout.delete();
      expect(() => standaloneLayout.getName()).toThrow(gd.UseAfterFreeError);
      expect(ownedLayout.getName()).toBe('Owned');

      // Delete owned via C++.
      project.removeLayout('Owned');
      expect(() => ownedLayout.getName()).toThrow(gd.UseAfterFreeError);

      project.delete();
    });

    it('handles multiple projects with their own layouts', function () {
      const project1 = gd.ProjectHelper.createNewGDJSProject();
      const project2 = gd.ProjectHelper.createNewGDJSProject();

      project1.insertNewLayout('Scene1', 0);
      project2.insertNewLayout('Scene2', 0);

      const layout1 = project1.getLayout('Scene1');
      const layout2 = project2.getLayout('Scene2');

      expect(layout1.getName()).toBe('Scene1');
      expect(layout2.getName()).toBe('Scene2');

      // Delete project1 entirely - layout1 dies, layout2 survives.
      project1.delete();
      expect(() => layout1.getName()).toThrow(gd.UseAfterFreeError);
      expect(layout2.getName()).toBe('Scene2');

      project2.delete();
      expect(() => layout2.getName()).toThrow(gd.UseAfterFreeError);
    });

    it('re-adding a layout after removal gives a working fresh reference', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();

      project.insertNewLayout('MyScene', 0);
      const oldRef = project.getLayout('MyScene');
      expect(oldRef.getName()).toBe('MyScene');

      // Remove and re-add with the same name.
      project.removeLayout('MyScene');

      project.insertNewLayout('MyScene', 0);
      const newRef = project.getLayout('MyScene');
      // The new reference works fine, even though the name is the same.
      expect(newRef.getName()).toBe('MyScene');

      // Note: oldRef may or may not throw depending on whether the allocator
      // reused the same address. If it did, add() cleared the dead entry and
      // the old wrapper happens to point at a valid object (no false positive).
      // This is a known limitation: we guarantee no false positives, not
      // detection of every stale reference when addresses are reused.

      project.delete();
    });

    it('tracks objects inside layouts independently', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      project.insertNewLayout('Scene', 0);
      const layout = project.getLayout('Scene');

      layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Player', 0);
      layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Enemy', 1);

      const player = layout.getObjects().getObject('Player');
      const enemy = layout.getObjects().getObject('Enemy');

      expect(player.getName()).toBe('Player');
      expect(enemy.getName()).toBe('Enemy');

      // Remove only Player.
      layout.getObjects().removeObject('Player');
      expect(() => player.getName()).toThrow(gd.UseAfterFreeError);
      expect(enemy.getName()).toBe('Enemy');

      // Removing the layout kills the enemy too.
      project.removeLayout('Scene');
      expect(() => enemy.getName()).toThrow(gd.UseAfterFreeError);

      project.delete();
    });
  });

  describe('Pointer reuse (dead then alive at same address)', function () {
    it('does not false-positive when a new object reuses a dead address', function () {
      // We can't control the allocator, but we can create/destroy many
      // objects to maximize the chance of address reuse, and verify
      // that no false positive occurs.
      const project = gd.ProjectHelper.createNewGDJSProject();

      for (let round = 0; round < 20; round++) {
        project.insertNewLayout('TempScene', 0);
        const layout = project.getLayout('TempScene');
        layout.setName('TempScene');
        expect(layout.getName()).toBe('TempScene');

        project.removeLayout('TempScene');
        // Old reference is dead.
        expect(() => layout.getName()).toThrow(gd.UseAfterFreeError);
      }

      // Project itself should still be alive after all that.
      expect(project.getLayoutsCount()).toBe(0);
      project.delete();
    });

    it('handles rapid create/destroy of standalone tracked objects', function () {
      const deadRefs = [];
      for (let i = 0; i < 50; i++) {
        const layout = new gd.Layout();
        layout.setName('Layout_' + i);
        expect(layout.getName()).toBe('Layout_' + i);
        layout.delete();
        deadRefs.push(layout);
      }

      // All should be detected as dead.
      for (const ref of deadRefs) {
        expect(() => ref.getName()).toThrow(gd.UseAfterFreeError);
      }

      // New objects created after should work fine.
      const alive = new gd.Layout();
      alive.setName('StillAlive');
      expect(alive.getName()).toBe('StillAlive');
      alive.delete();
    });
  });

  describe('Stress test', function () {
    it('handles many layouts created and destroyed in order', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const COUNT = 100;

      // Create many layouts.
      for (let i = 0; i < COUNT; i++) {
        project.insertNewLayout('Scene_' + i, i);
      }
      expect(project.getLayoutsCount()).toBe(COUNT);

      // Grab references to all.
      const refs = [];
      for (let i = 0; i < COUNT; i++) {
        refs.push(project.getLayout('Scene_' + i));
      }

      // Verify all alive.
      for (let i = 0; i < COUNT; i++) {
        expect(refs[i].getName()).toBe('Scene_' + i);
      }

      // Remove them in forward order.
      for (let i = 0; i < COUNT; i++) {
        project.removeLayout('Scene_' + i);
      }

      // All references should be dead.
      for (let i = 0; i < COUNT; i++) {
        expect(() => refs[i].getName()).toThrow(gd.UseAfterFreeError);
      }

      project.delete();
    });

    it('handles many layouts created and destroyed in reverse order', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const COUNT = 100;

      for (let i = 0; i < COUNT; i++) {
        project.insertNewLayout('Scene_' + i, i);
      }

      const refs = [];
      for (let i = 0; i < COUNT; i++) {
        refs.push(project.getLayout('Scene_' + i));
      }

      // Remove in reverse order.
      for (let i = COUNT - 1; i >= 0; i--) {
        // Verify still alive before removal.
        expect(refs[i].getName()).toBe('Scene_' + i);
        project.removeLayout('Scene_' + i);
        expect(() => refs[i].getName()).toThrow(gd.UseAfterFreeError);
      }

      project.delete();
    });

    it('handles interleaved create/destroy cycles', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const CYCLES = 50;
      const allDeadRefs = [];

      for (let cycle = 0; cycle < CYCLES; cycle++) {
        const name = 'Cycle_' + cycle;
        project.insertNewLayout(name, 0);
        const layout = project.getLayout(name);
        expect(layout.getName()).toBe(name);

        // Every other cycle, also add and remove an object.
        if (cycle % 2 === 0) {
          layout
            .getObjects()
            .insertNewObject(project, 'Sprite', 'Obj_' + cycle, 0);
          const obj = layout.getObjects().getObject('Obj_' + cycle);
          expect(obj.getName()).toBe('Obj_' + cycle);
        }

        project.removeLayout(name);
        allDeadRefs.push(layout);
        expect(() => layout.getName()).toThrow(gd.UseAfterFreeError);
      }

      // Verify all accumulated dead refs are still detected.
      for (const ref of allDeadRefs) {
        expect(() => ref.getName()).toThrow(gd.UseAfterFreeError);
      }

      project.delete();
    });

    it('handles many standalone objects created and destroyed', function () {
      const COUNT = 200;
      const alive = [];
      const dead = [];

      // Create many, keep half alive.
      for (let i = 0; i < COUNT; i++) {
        const layout = new gd.Layout();
        layout.setName('L' + i);

        if (i % 2 === 0) {
          layout.delete();
          dead.push(layout);
        } else {
          alive.push(layout);
        }
      }

      // Verify alive ones work.
      for (const ref of alive) {
        expect(typeof ref.getName()).toBe('string');
      }

      // Verify dead ones throw.
      for (const ref of dead) {
        expect(() => ref.getName()).toThrow(gd.UseAfterFreeError);
      }

      // Clean up alive ones.
      for (const ref of alive) {
        ref.delete();
      }

      // Now they're dead too.
      for (const ref of alive) {
        expect(() => ref.getName()).toThrow(gd.UseAfterFreeError);
      }
    });

    it('survives rapid create/destroy of projects with layouts', function () {
      const PROJECTS = 20;
      const LAYOUTS_PER = 10;

      for (let p = 0; p < PROJECTS; p++) {
        const project = gd.ProjectHelper.createNewGDJSProject();

        const layoutRefs = [];
        for (let l = 0; l < LAYOUTS_PER; l++) {
          const name = 'P' + p + '_L' + l;
          project.insertNewLayout(name, l);
          layoutRefs.push(project.getLayout(name));
        }

        // All alive.
        for (let l = 0; l < LAYOUTS_PER; l++) {
          expect(layoutRefs[l].getName()).toBe('P' + p + '_L' + l);
        }

        // Delete project (kills all layouts).
        project.delete();

        // All layout refs dead.
        for (const ref of layoutRefs) {
          expect(() => ref.getName()).toThrow(gd.UseAfterFreeError);
        }

        // Project itself is dead.
        expect(() => project.getName()).toThrow(gd.UseAfterFreeError);
      }
    });

    it('pruneDead does not cause false positives', function () {
      const project = gd.ProjectHelper.createNewGDJSProject();

      // Create and destroy some layouts to populate the dead set.
      for (let i = 0; i < 10; i++) {
        project.insertNewLayout('Prunable_' + i, 0);
        project.removeLayout('Prunable_' + i);
      }
      expect(gd.MemoryTrackedRegistry.getDeadCount()).toBeGreaterThan(0);

      // Prune the dead set.
      gd.MemoryTrackedRegistry.pruneDead(0);
      expect(gd.MemoryTrackedRegistry.getDeadCount()).toBe(0);

      // Living objects must still work — no false positives.
      project.insertNewLayout('Alive', 0);
      const alive = project.getLayout('Alive');
      expect(alive.getName()).toBe('Alive');

      project.delete();
    });
  });
});

// @flow
import {
  loadProjectEventsFunctionsExtensions,
  unloadProjectEventsFunctionsExtensions,
} from '../EventsFunctionsExtensionsLoader';
import {
  makeFakeEventsFunctionCodeWriter,
  makeFakeI18n,
} from '../EditorFunctions/TestHelpers';

const gd: libGDevelop = global.gd;

// Reproduction for https://github.com/4ian/GDevelop/issues/8917
//
// The metadata of a custom behavior holds a `gd::CustomBehavior` which keeps a
// reference to the project. If the project is deleted while the metadata is
// still registered in the platform, any later call to
// `getRequiredBehaviorTypes` (done for every behavior when the "Add a
// behavior" dialog opens) reads freed memory: a crash in WebAssembly
// ("null function or function signature mismatch", "memory access out of
// bounds"...), depending on what reused the memory.
//
// This happens when the extensions loading (asynchronous) finishes *after*
// the project was unloaded and deleted: the extensions are re-added to the
// platform, referencing the deleted project. Before the editor waited for
// `ensureLoadFinished` when closing a project, this happened when closing or
// switching project while its extensions were still being loaded (slow
// devices, like the mobile app in the report).
describe('Custom behavior metadata outliving its project (issue 8917)', () => {
  const makeProjectWithCustomBehavior = () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension(
      'Issue8917Extension',
      0
    );
    extension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0)
      .getPropertyDescriptors()
      .insertNew('Required', 0)
      .setType('Behavior')
      .addExtraInfo('Physics2::Physics2Behavior');
    return project;
  };

  it('leaves metadata referencing a deleted project if the load finishes after the project is closed', async () => {
    const platform = gd.JsPlatform.get();
    const project = makeProjectWithCustomBehavior();

    // The load starts (when the project is opened)...
    const loadPromise = loadProjectEventsFunctionsExtensions(
      project,
      makeFakeEventsFunctionCodeWriter(),
      makeFakeI18n()
    );

    // ...but the project is closed before the load is finished (without
    // waiting for it, like the editor did before `ensureLoadFinished`).
    unloadProjectEventsFunctionsExtensions(project);
    await loadPromise;
    project.delete();

    // The extension is still registered, with a behavior referencing the
    // deleted project: any call to `getRequiredBehaviorTypes` on it is a
    // use-after-free (it may or may not crash, depending on the memory).
    const metadata = gd.MetadataProvider.getBehaviorMetadata(
      platform,
      'Issue8917Extension::MyBehavior'
    );
    expect(gd.MetadataProvider.isBadBehaviorMetadata(metadata)).toBe(false);

    platform.removeExtension('Issue8917Extension');
  });

  it('does not leave any metadata if the close waits for the load to finish', async () => {
    const platform = gd.JsPlatform.get();
    const project = makeProjectWithCustomBehavior();

    const loadPromise = loadProjectEventsFunctionsExtensions(
      project,
      makeFakeEventsFunctionCodeWriter(),
      makeFakeI18n()
    );

    // What the editor does now when closing a project (see `closeProject`).
    await loadPromise;
    unloadProjectEventsFunctionsExtensions(project);
    project.delete();

    const metadata = gd.MetadataProvider.getBehaviorMetadata(
      platform,
      'Issue8917Extension::MyBehavior'
    );
    expect(gd.MetadataProvider.isBadBehaviorMetadata(metadata)).toBe(true);
  });
});

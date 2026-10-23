// @flow
import {
  serializeProjectToJSObject,
  serializeProjectToJSON,
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
  unserializeProjectFromJSObject,
} from './Serializer';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('Serializer', () => {
  describe('Projects serialized one part at a time', () => {
    const makeProjectWithAllParts = (): gdProject => {
      const { project } = makeTestProject(gd);
      const externalLayout = project.insertNewExternalLayout(
        'MyExternalLayout',
        0
      );
      externalLayout.setAssociatedLayout('TestLayout');
      externalLayout
        .getInitialInstances()
        .insertNewInitialInstance()
        .setObjectName('MySpriteObject');
      return project;
    };

    it('serializes a project like serializing the whole project', () => {
      const project = makeProjectWithAllParts();

      [undefined, { canonicalEventSerialization: true }].forEach(options => {
        // Compared as JSON, to also check the order of the keys.
        expect(
          JSON.stringify(serializeProjectToJSObject(project, options))
        ).toBe(
          JSON.stringify(serializeToJSObject(project, 'serializeTo', options))
        );
        expect(serializeProjectToJSON(project, options)).toBe(
          serializeToJSON(project, 'serializeTo', options)
        );
      });

      project.delete();
    });

    it('unserializes a project like unserializing the whole project', () => {
      const project = makeProjectWithAllParts();
      const projectObject = serializeToJSObject(project);
      project.delete();

      const projectLoadedByParts = gd.ProjectHelper.createNewGDJSProject();
      unserializeProjectFromJSObject(projectLoadedByParts, projectObject);
      const projectLoadedAtOnce = gd.ProjectHelper.createNewGDJSProject();
      unserializeFromJSObject(projectLoadedAtOnce, projectObject);

      expect(projectLoadedByParts.getLayoutsCount()).toBe(
        projectObject.layouts.length
      );
      expect(projectLoadedByParts.getExternalEventsCount()).toBe(
        projectObject.externalEvents.length
      );
      expect(projectLoadedByParts.getExternalLayoutsCount()).toBe(1);
      expect(serializeToJSON(projectLoadedByParts)).toBe(
        serializeToJSON(projectLoadedAtOnce)
      );

      projectLoadedByParts.delete();
      projectLoadedAtOnce.delete();
    });
  });
});

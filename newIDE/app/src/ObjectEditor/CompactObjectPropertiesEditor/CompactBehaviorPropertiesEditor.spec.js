// @flow
import * as React from 'react';
import TestRenderer from 'react-test-renderer';

import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';

jest.mock('../../UI/Layout', () => ({
  ColumnStackLayout: ({ children }) => children,
}));
jest.mock(
  '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility',
  () => ({ CompactPropertiesEditorByVisibility: () => null })
);
jest.mock('../../PropertiesEditor/PropertiesMapToSchema', () => () => []);

const gd: libGDevelop = global.gd;

describe('CompactBehaviorPropertiesEditor', () => {
  it('reacquires behavior metadata when the platform metadata is refreshed', () => {
    const metadataProvider: any = gd.MetadataProvider;
    const originalGetBehaviorMetadata = metadataProvider.getBehaviorMetadata;
    let firstMetadataCalls = 0;
    let refreshedMetadataCalls = 0;
    const firstMetadata = {
      getOpenFullEditorLabel: () => '',
      getProperties: () => {
        firstMetadataCalls++;
        return {};
      },
    };
    const refreshedMetadata = {
      getOpenFullEditorLabel: () => '',
      getProperties: () => {
        refreshedMetadataCalls++;
        return {};
      },
    };
    let currentMetadata = firstMetadata;
    metadataProvider.getBehaviorMetadata = () => currentMetadata;

    const behavior: any = {
      getTypeName: () => 'TestExtension::TestBehavior',
    };
    const props: any = {
      project: {},
      behaviorTypeName: 'TestExtension::TestBehavior',
      behaviors: [behavior],
      object: null,
      layersContainer: {},
      onBehaviorUpdated: () => {},
      resourceManagementProps: {},
    };

    try {
      const renderer = TestRenderer.create(
        <CompactBehaviorPropertiesEditor {...props} />
      );
      expect(firstMetadataCalls).toBe(1);

      currentMetadata = refreshedMetadata;
      renderer.update(<CompactBehaviorPropertiesEditor {...props} />);

      expect(firstMetadataCalls).toBe(1);
      expect(refreshedMetadataCalls).toBe(1);
    } finally {
      metadataProvider.getBehaviorMetadata = originalGetBehaviorMetadata;
    }
  });
});

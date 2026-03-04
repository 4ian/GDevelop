// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import CompactAnchorBehaviorEditor from '../../../ObjectEditor/CompactObjectPropertiesEditor/CompactAnchorBehaviorEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

const gd: libGDevelop = global.gd;

export default {
  title: 'ObjectEditor/CompactAnchorBehaviorEditor',
  component: CompactAnchorBehaviorEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
  const spriteObjectWithBehaviors = testProject.spriteObjectWithBehaviors;
  const anchorBehavior = spriteObjectWithBehaviors.getBehavior('Anchor');
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    'AnchorBehavior::AnchorBehavior'
  );

  return (
    <SerializedObjectDisplay object={spriteObjectWithBehaviors}>
      <CompactAnchorBehaviorEditor
        project={testProject.project}
        behavior={anchorBehavior}
        object={spriteObjectWithBehaviors}
        behaviorMetadata={behaviorMetadata}
        behaviorOverriding={null}
        initialInstance={null}
        onOpenFullEditor={action('onOpenFullEditor')}
        onBehaviorUpdated={action('onBehaviorUpdated')}
        resourceManagementProps={fakeResourceManagementProps}
      />
    </SerializedObjectDisplay>
  );
};

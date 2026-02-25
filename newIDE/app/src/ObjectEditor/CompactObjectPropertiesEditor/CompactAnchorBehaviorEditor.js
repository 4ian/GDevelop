// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type CompactBehaviorPropertiesEditorProps } from './CompactBehaviorPropertiesEditorProps.flow';
import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  HorizontalAnchorButtonGroup,
  VerticalAnchorButtonGroup,
  getBasicHorizontalAnchor,
  getBasicVerticalAnchor,
} from '../../BehaviorsEditor/Editors/AnchorBehaviorEditor';

const CompactAnchorBehaviorEditor = ({
  project,
  behavior,
  object,
  behaviorMetadata,
  behaviorOverriding,
  initialInstance,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const forceUpdate = useForceUpdate();

  const properties = behavior.getProperties();
  const horizontalBasicAnchor = getBasicHorizontalAnchor(properties);
  const verticalBasicAnchor = getBasicVerticalAnchor(properties);

  const _onBehaviorUpdated = React.useCallback(
    () => {
      forceUpdate();
      onBehaviorUpdated();
    },
    [forceUpdate, onBehaviorUpdated]
  );

  return (
    <ColumnStackLayout expand>
      <HorizontalAnchorButtonGroup
        behavior={behavior}
        basicAnchor={horizontalBasicAnchor}
        size="small"
        forceUpdate={forceUpdate}
      />
      <VerticalAnchorButtonGroup
        behavior={behavior}
        basicAnchor={verticalBasicAnchor}
        size="small"
        forceUpdate={forceUpdate}
      />
      <CompactBehaviorPropertiesEditor
        project={project}
        object={object}
        behavior={behavior}
        behaviorMetadata={behaviorMetadata}
        behaviorOverriding={behaviorOverriding}
        initialInstance={initialInstance}
        onOpenFullEditor={onOpenFullEditor}
        onBehaviorUpdated={_onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        isAdvancedSectionInitiallyUncollapsed={
          horizontalBasicAnchor === 'Advanced' ||
          verticalBasicAnchor === 'Advanced' ||
          properties.get('relativeToOriginalWindowSize').getValue() === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default CompactAnchorBehaviorEditor;

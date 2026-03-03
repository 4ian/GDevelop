// @flow
import * as React from 'react';
import { type CompactBehaviorPropertiesEditorProps } from './CompactBehaviorPropertiesEditorProps.flow';
import {
  CompactBehaviorPropertiesEditor,
  getPropertyValue,
  updateProperty,
} from './CompactBehaviorPropertiesEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { ColumnStackLayout } from '../../UI/Layout';
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
  const _getPropertyValue = (propertyName: string) =>
    getPropertyValue(behavior, propertyName, initialInstance);
  const _updateProperty = (propertyName: string, value: string) => {
    updateProperty(project, behavior, propertyName, value, initialInstance);
    forceUpdate();
    onBehaviorUpdated();
  };
  const _onBehaviorUpdated = React.useCallback(
    () => {
      forceUpdate();
      onBehaviorUpdated();
    },
    [forceUpdate, onBehaviorUpdated]
  );

  const horizontalBasicAnchor = getBasicHorizontalAnchor(_getPropertyValue);
  const verticalBasicAnchor = getBasicVerticalAnchor(_getPropertyValue);

  return (
    <ColumnStackLayout expand>
      <HorizontalAnchorButtonGroup
        basicAnchor={horizontalBasicAnchor}
        expand
        onUpdateProperty={_updateProperty}
      />
      <VerticalAnchorButtonGroup
        basicAnchor={verticalBasicAnchor}
        expand
        onUpdateProperty={_updateProperty}
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
          _getPropertyValue('relativeToOriginalWindowSize') === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default CompactAnchorBehaviorEditor;

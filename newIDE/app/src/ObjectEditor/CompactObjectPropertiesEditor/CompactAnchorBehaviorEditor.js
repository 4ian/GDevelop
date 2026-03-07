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
import AnchorGrid from '../../BehaviorsEditor/Editors/AnchorGrid';
import {
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

  const isAdvanced =
    getBasicHorizontalAnchor(_getPropertyValue) === 'Advanced' ||
    getBasicVerticalAnchor(_getPropertyValue) === 'Advanced';

  return (
    <ColumnStackLayout expand>
      <AnchorGrid
        getPropertyValue={_getPropertyValue}
        onUpdateProperty={_updateProperty}
        initialInstance={initialInstance}
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
          isAdvanced ||
          _getPropertyValue('relativeToOriginalWindowSize') === 'false'
        }
      />
    </ColumnStackLayout>
  );
};

export default CompactAnchorBehaviorEditor;

// @flow
import * as React from 'react';
import { type CompactInstanceBehaviorPropertiesEditorProps } from './CompactInstanceBehaviorPropertiesEditorProps.flow';
import {
  CompactInstanceBehaviorPropertiesEditor,
  getPropertyValue,
  updateProperty,
} from './CompactInstanceBehaviorPropertiesEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { ColumnStackLayout } from '../../UI/Layout';
import {
  HorizontalAnchorButtonGroup,
  VerticalAnchorButtonGroup,
  getBasicHorizontalAnchor,
  getBasicVerticalAnchor,
} from '../../BehaviorsEditor/Editors/AnchorBehaviorEditor';

const CompactInstanceAnchorBehaviorEditor = ({
  project,
  behavior,
  object,
  layersContainer,
  behaviorMetadata,
  behaviorOverriding,
  initialInstances,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: CompactInstanceBehaviorPropertiesEditorProps): React.Node => {
  const forceUpdate = useForceUpdate();
  const _getPropertyValue = (propertyName: string) => {
    let commonValue = null;
    for (const initialInstance of initialInstances) {
      const value = getPropertyValue(behavior, propertyName, initialInstance);
      if (commonValue === null) {
        commonValue = value;
      }
      if (value !== commonValue) {
        return null;
      }
    }
    return commonValue;
  };
  const _updateProperty = (propertyName: string, value: string) => {
    for (const initialInstance of initialInstances) {
      updateProperty(project, behavior, propertyName, value, initialInstance);
    }
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
      <CompactInstanceBehaviorPropertiesEditor
        project={project}
        object={object}
        layersContainer={layersContainer}
        behavior={behavior}
        behaviorMetadata={behaviorMetadata}
        behaviorOverriding={behaviorOverriding}
        initialInstances={initialInstances}
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

export default CompactInstanceAnchorBehaviorEditor;

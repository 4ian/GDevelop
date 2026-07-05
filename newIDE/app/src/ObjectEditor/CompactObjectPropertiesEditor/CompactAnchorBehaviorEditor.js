// @flow
import * as React from 'react';
import { type CompactBehaviorPropertiesEditorProps } from './CompactBehaviorPropertiesEditorProps.flow';
import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';
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
  behaviors,
  object,
  layersContainer,
  behaviorMetadata,
  onOpenFullEditor,
  onBehaviorUpdated,
  resourceManagementProps,
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const forceUpdate = useForceUpdate();
  const _getPropertyValue = (propertyName: string) => {
    let commonValue = null;
    for (const behavior of behaviors) {
      const value = behavior
        .getProperties()
        .get(propertyName)
        .getValue();
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
    for (const behavior of behaviors) {
      behavior.updateProperty(propertyName, value);
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
      <CompactBehaviorPropertiesEditor
        project={project}
        object={object}
        layersContainer={layersContainer}
        behaviors={behaviors}
        behaviorMetadata={behaviorMetadata}
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

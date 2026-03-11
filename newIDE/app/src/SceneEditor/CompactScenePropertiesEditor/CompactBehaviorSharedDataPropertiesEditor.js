// @flow
import * as React from 'react';
import { ColumnStackLayout } from '../../UI/Layout';
import { Trans } from '@lingui/macro';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { useForceRecompute } from '../../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';

type CompactBehaviorPropertiesEditorProps = {|
  project: gdProject,
  behaviorMetadata: gdBehaviorMetadata,
  behaviorSharedData: gdBehaviorsSharedData,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};

export const CompactBehaviorSharedDataPropertiesEditor = ({
  project,
  behaviorMetadata,
  behaviorSharedData,
  onBehaviorUpdated,
  resourceManagementProps,
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      const behaviorMetadataSharedProperties = behaviorMetadata.getSharedProperties();
      return propertiesMapToSchema({
        properties: behaviorMetadataSharedProperties,
        defaultValueProperties: behaviorMetadataSharedProperties,
        getPropertyValue: (instance, name) =>
          instance
            .getProperties()
            .get(name)
            .getValue(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object: null,
        visibility: 'All',
      });
    },
    [schemaRecomputeTrigger, behaviorMetadata]
  );

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        object={null}
        schema={propertiesSchema}
        instances={[behaviorSharedData]}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        placeholder={<Trans>Nothing to configure for this behavior.</Trans>}
        // $FlowFixMe[incompatible-type]
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};

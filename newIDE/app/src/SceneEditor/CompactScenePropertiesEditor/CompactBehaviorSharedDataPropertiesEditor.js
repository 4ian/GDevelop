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
  resourceManagementProps: ResourceManagementProps,
  isAdvancedSectionInitiallyUncollapsed?: boolean,
|};

export const CompactBehaviorSharedDataPropertiesEditor = ({
  project,
  behaviorMetadata,
  behaviorSharedData,
  resourceManagementProps,
}: CompactBehaviorPropertiesEditorProps): React.Node => {
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return propertiesMapToSchema({
        // Use the shared data properties (and not the metadata ones) so that
        // properties adapting themselves to the current values (labels,
        // visibility...) are properly displayed.
        properties: behaviorSharedData.getProperties(),
        defaultValueProperties: behaviorMetadata.getSharedProperties(),
        getPropertyValue: (instance, name) =>
          instance
            .getProperties()
            .get(name)
            .getValue(),
        onUpdateProperty: (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object: null,
        layersContainer: null,
        visibility: 'All',
        shouldDisabledFieldsWithMixedValues: false,
      });
    },
    // The shared data is identified by its pointer, as a new wrapper object is
    // given at each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schemaRecomputeTrigger, behaviorSharedData.ptr, behaviorMetadata]
  );

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        object={null}
        schema={propertiesSchema}
        instances={[behaviorSharedData]}
        resourceManagementProps={resourceManagementProps}
        placeholder={<Trans>Nothing to configure for this behavior.</Trans>}
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};

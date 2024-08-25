// @flow
import * as React from 'react';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout } from '../../UI/Layout';
import { Trans } from '@lingui/macro';
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';

export const CompactBehaviorPropertiesEditor = ({
  project,
  behavior,
  object,
  onBehaviorUpdated,
  resourceManagementProps,
}: {|
  project: gdProject,
  behavior: gdBehavior,
  object: gdObject,
  onBehaviorUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);

  const basicPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Basic'
      ),
    [behavior, object]
  );

  const advancedPropertiesSchema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behavior => behavior.getProperties(),
        (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        'Advanced'
      ),
    [behavior, object]
  );
  const hasAdvancedProperties = advancedPropertiesSchema.length > 0;
  const hasSomeProperties =
    basicPropertiesSchema.length > 0 || hasAdvancedProperties;

  return (
    <ColumnStackLayout expand noMargin noOverflowParent>
      {!hasSomeProperties && (
        <Line justifyContent="center" expand>
          <Text size="body2" color="secondary" align="center" noMargin>
            <Trans>Nothing to configure for this behavior.</Trans>
          </Text>
        </Line>
      )}
      {hasSomeProperties && (
        <CompactPropertiesEditor
          project={project}
          schema={basicPropertiesSchema}
          instances={[behavior]}
          onInstancesModified={onBehaviorUpdated}
          resourceManagementProps={resourceManagementProps}
        />
      )}
      {!showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowRight />}
          label={<Trans>Show more</Trans>}
          onClick={() => {
            setShowAdvancedOptions(true);
          }}
        />
      )}
      {showAdvancedOptions && hasAdvancedProperties && (
        <CompactPropertiesEditor
          project={project}
          schema={advancedPropertiesSchema}
          instances={[behavior]}
          onInstancesModified={onBehaviorUpdated}
          resourceManagementProps={resourceManagementProps}
        />
      )}
      {showAdvancedOptions && hasAdvancedProperties && (
        <FlatButton
          fullWidth
          primary
          leftIcon={<ChevronArrowTop />}
          label={<Trans>Show less</Trans>}
          onClick={() => {
            setShowAdvancedOptions(false);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};

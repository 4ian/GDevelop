// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';
import AlertMessage from '../../UI/AlertMessage';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

/**
 * Custom editor for Light3D object with organized sections
 */
const Light3DEditor = (props: Props): React.Node => {
  const {
    objectConfiguration,
    project,
    resourceManagementProps,
    projectScopedContainersAccessor,
    unsavedChanges,
    renderObjectNameField,
  } = props;

  // Cast to base ObjectConfiguration to ensure C++ methods are called
  const objectConfigurationAsGd = gd.castObject(
    // $FlowFixMe[incompatible-exact]
    objectConfiguration,
    gd.ObjectConfiguration
  );
  const properties = objectConfigurationAsGd.getProperties();

  // Get the full schema with groups
  const fullSchema = propertiesMapToSchema({
    properties,
    defaultValueProperties: null,
    getPropertyValue: (object, name) =>
      object
        .getProperties()
        .get(name)
        .getValue(),
    onUpdateProperty: (object, name, value) =>
      object.updateProperty(name, value),
  });

  // Find groups in the schema
  const groups = fullSchema.filter(
    field => field.type === 'column' && field.children
  );

  // Find each group by name
  const findGroup = (groupName: string) =>
    groups.find(group => group.name === groupName);

  const generalGroup = findGroup('General');
  const positionGroup = findGroup('Position');
  const lightSettingsGroup = findGroup('Light Settings');
  const shadowsGroup = findGroup('Shadows');
  const effectsGroup = findGroup('Effects');

  // Get fields from each group
  const generalFields = generalGroup ? generalGroup.children || [] : [];
  const positionFields = positionGroup ? positionGroup.children || [] : [];
  const lightSettingsFields = lightSettingsGroup
    ? lightSettingsGroup.children || []
    : [];
  const shadowsFields = shadowsGroup ? shadowsGroup.children || [] : [];
  const effectsFields = effectsGroup ? effectsGroup.children || [] : [];

  // Get current light type to conditionally show/hide fields
  const getLightType = () => {
    const lightTypeProperty = properties.get('lightType');
    return lightTypeProperty ? lightTypeProperty.getValue() : 'Point';
  };

  const lightType = getLightType();
  const isSpotLight = lightType === 'Spot';

  // Filter Light Settings fields based on light type
  // Angle and Penumbra are only relevant for Spot Light
  const filteredLightSettingsFields = lightSettingsFields.filter(field => {
    if (field.name === 'angle' || field.name === 'penumbra') {
      return isSpotLight;
    }
    return true;
  });

  // Filter Shadows fields - Shadow Focus is only for Spot Light
  const filteredShadowsFields = shadowsFields.filter(field => {
    if (field.name === 'shadowFocus') {
      return isSpotLight;
    }
    return true;
  });

  return (
    <ColumnStackLayout noMargin>
      {renderObjectNameField && renderObjectNameField()}

      {!fullSchema.length ? (
        <EmptyMessage>
          <Trans>
            There is nothing to configure for this object. You can still use
            events to interact with the object.
          </Trans>
        </EmptyMessage>
      ) : (
        <React.Fragment>
          {/* Information Alert */}
          <AlertMessage kind="info">
            <Trans>
              Light3D objects illuminate your 3D scene. Choose between Point
              Light (illuminates in all directions) or Spot Light (directed
              beam).
            </Trans>
          </AlertMessage>

          {/* General Section */}
          {generalFields.length > 0 && (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>General</Trans>
                </Text>
              </LineStackLayout>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={generalFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          )}

          {/* Position Section */}
          {positionFields.length > 0 && (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Position</Trans>
                </Text>
              </LineStackLayout>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={positionFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          )}

          {/* Light Settings Section */}
          {filteredLightSettingsFields.length > 0 && (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Light Settings</Trans>
                </Text>
              </LineStackLayout>
              {isSpotLight ? (
                <AlertMessage kind="info">
                  <Trans>
                    Angle controls the spotlight cone width. Penumbra controls
                    the soft edge of the light beam.
                  </Trans>
                </AlertMessage>
              ) : (
                <AlertMessage kind="info">
                  <Trans>
                    Distance controls how far the light reaches. Decay controls
                    how quickly the light fades with distance.
                  </Trans>
                </AlertMessage>
              )}
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={filteredLightSettingsFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          )}

          {/* Shadows Section */}
          {filteredShadowsFields.length > 0 && (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Shadows</Trans>
                </Text>
              </LineStackLayout>
              <AlertMessage kind="warning">
                <Trans>
                  Enabling shadows can impact performance. Use only when
                  necessary and adjust Shadow Map Size for balance between
                  quality and performance.
                </Trans>
              </AlertMessage>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={filteredShadowsFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          )}

          {/* Effects Section */}
          {effectsFields.length > 0 && (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Effects</Trans>
                </Text>
              </LineStackLayout>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={effectsFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </ColumnStackLayout>
  );
};

export default Light3DEditor;

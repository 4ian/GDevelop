// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

const createRow = (name, fields) => ({
  name,
  type: 'row',
  children: fields,
});

const replaceFieldsWithRow = (
  fields,
  rowName,
  firstFieldName,
  secondFieldName
) => {
  const firstIndex = fields.findIndex(f => f.name === firstFieldName);
  const secondIndex = fields.findIndex(f => f.name === secondFieldName);
  if (firstIndex === -1 || secondIndex === -1) return fields;
  if (firstIndex === secondIndex) return fields;

  const firstField = fields[firstIndex];
  const secondField = fields[secondIndex];

  const minIndex = Math.min(firstIndex, secondIndex);
  const maxIndex = Math.max(firstIndex, secondIndex);

  const nextFields = fields.slice();
  nextFields.splice(maxIndex, 1);
  nextFields.splice(minIndex, 1, createRow(rowName, [firstField, secondField]));
  return nextFields;
};

const MapEditor = (props: Props): React.Node => {
  const {
    objectConfiguration,
    project,
    resourceManagementProps,
    projectScopedContainersAccessor,
    unsavedChanges,
    renderObjectNameField,
  } = props;

  const objectConfigurationAsGd = gd.castObject(
    // $FlowFixMe[incompatible-exact]
    objectConfiguration,
    gd.ObjectConfiguration
  );
  const properties = objectConfigurationAsGd.getProperties();

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

  const groups = fullSchema.filter(
    field => field.type === 'column' && field.children
  );
  const defaultGroup = groups.find(group => group.name === '');
  const otherGroups = groups.filter(group => group.name !== '');

  let defaultFields = defaultGroup ? defaultGroup.children || [] : fullSchema;
  const findGroupContainingField = (fieldName: string) =>
    otherGroups.find(group =>
      (group.children || []).some(child => child.name === fieldName)
    );

  const visualGroup = findGroupContainingField('backgroundImage');
  const obstaclesGroup = findGroupContainingField('showObstacles');

  const visualFields = visualGroup ? visualGroup.children || [] : [];
  const obstaclesFields = obstaclesGroup ? obstaclesGroup.children || [] : [];

  const visualFieldsWithBorderRow = replaceFieldsWithRow(
    visualFields,
    'borderColor-borderWidth',
    'borderColor',
    'borderWidth'
  );

  // Merge Stay on screen and Auto-detect bounds into single row
  defaultFields = replaceFieldsWithRow(
    defaultFields,
    'stayOnScreen-autoDetectBounds',
    'stayOnScreen',
    'autoDetectBounds'
  );

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
          <PropertiesEditor
            unsavedChanges={unsavedChanges}
            schema={defaultFields}
            instances={[objectConfigurationAsGd]}
            project={project}
            resourceManagementProps={resourceManagementProps}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
          />
          {visualFieldsWithBorderRow.length ? (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Visual</Trans>
                </Text>
              </LineStackLayout>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={visualFieldsWithBorderRow}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          ) : null}
          {obstaclesFields.length ? (
            <React.Fragment>
              <LineStackLayout noMargin alignItems="center" expand>
                <Text size="block-title">
                  <Trans>Obstacles</Trans>
                </Text>
              </LineStackLayout>
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={obstaclesFields}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
              />
            </React.Fragment>
          ) : null}
        </React.Fragment>
      )}
    </ColumnStackLayout>
  );
};

export default MapEditor;

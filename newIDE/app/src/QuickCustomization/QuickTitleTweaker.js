// @flow
import * as React from 'react';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import CompactPropertiesEditor from '../CompactPropertiesEditor';
import propertiesMapToSchema from '../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { useForceRecompute } from '../Utils/UseForceUpdate';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';

const gd: libGDevelop = global.gd;

export const findTitleObject = (
  objectFolderOrObject: gdObjectFolderOrObject
): ?gdObject => {
  for (let i = 0; i < objectFolderOrObject.getChildrenCount(); i++) {
    const child = objectFolderOrObject.getChildAt(i);

    if (child.isFolder()) {
      const foundTitleObject = findTitleObject(child);
      if (foundTitleObject) {
        return foundTitleObject;
      }
    } else {
      const object = child.getObject();
      if (object.getName() === 'Title') {
        return object;
      }
    }
  }

  return null;
};

const QuickObjectPropertiesEditor = ({
  project,
  object,
  objectConfiguration,
  onObjectUpdated,
  resourceManagementProps,
}: {|
  project: gdProject,
  object: gdObject,
  objectConfiguration: gdObjectConfiguration,
  onObjectUpdated: () => void,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  // Properties:
  const basicPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      const properties = objectConfiguration.getProperties();
      const schema = propertiesMapToSchema({
        properties,
        getProperties: object => object.getProperties(),
        onUpdateProperty: (object, name, value) =>
          object.updateProperty(name, value),
        object,
        visibility: 'Basic-Quick',
      });

      return schema;
    },
    [objectConfiguration, schemaRecomputeTrigger, object]
  );

  return (
    <ColumnStackLayout>
      <Column noMargin>
        <CompactPropertiesEditor
          project={project}
          schema={basicPropertiesSchema}
          instances={[objectConfiguration]}
          onInstancesModified={onObjectUpdated}
          resourceManagementProps={resourceManagementProps}
          onRefreshAllFields={forceRecomputeSchema}
        />
      </Column>
    </ColumnStackLayout>
  );
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
|};

export const QuickTitleTweaker = ({
  project,
  resourceManagementProps,
}: Props) => {
  const titleObject = React.useMemo(
    () => {
      for (let i = 0; i < project.getLayoutsCount(); i++) {
        const layout = project.getLayoutAt(i);
        const titleObject = findTitleObject(
          layout.getObjects().getRootFolder()
        );

        if (titleObject) {
          return titleObject;
        }
      }

      return null;
    },
    [project]
  );

  const titleObjectConfiguration = React.useMemo(
    () => {
      if (!titleObject) {
        return null;
      }

      const objectConfiguration = titleObject.getConfiguration();
      // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
      // and associated methods are redefined in JS, they have different arguments (
      // see ObjectJsImplementation C++ implementation). If called directly here from JS,
      // the arguments will be mismatched. To workaround this, always cast the object to
      // a base gdObject to ensure C++ methods are called.
      const objectConfigurationAsGd = gd.castObject(
        objectConfiguration,
        gd.ObjectConfiguration
      );

      return objectConfigurationAsGd;
    },
    [titleObject]
  );

  const updateProjectName = React.useCallback(
    () => {
      if (!titleObject || !titleObjectConfiguration) {
        return;
      }

      const properties = titleObjectConfiguration.getProperties();
      const textProperty = properties.get('text');
      if (!textProperty) {
        console.error('Title object does not have a "text" property.');
        return;
      }

      const textPropertyValue = textProperty.getValue();
      if (textPropertyValue !== project.getName()) {
        project.setName(textPropertyValue);
      }
    },
    [titleObject, titleObjectConfiguration, project]
  );

  if (!titleObject || !titleObjectConfiguration) {
    return (
      <Column expand alignItems="center" justifyContent="center">
        <Line>
          <Text>
            <Trans>
              Oops! Looks like this game has no logo set up, you can continue to
              the next step.
            </Trans>
          </Text>
        </Line>
      </Column>
    );
  }

  return (
    <ResponsiveLineStackLayout noMargin expand>
      <ColumnStackLayout noMargin expand noOverflowParent>
        <QuickObjectPropertiesEditor
          project={project}
          object={titleObject}
          objectConfiguration={titleObjectConfiguration}
          onObjectUpdated={updateProjectName}
          resourceManagementProps={resourceManagementProps}
        />
      </ColumnStackLayout>
    </ResponsiveLineStackLayout>
  );
};

// @flow
import * as React from 'react';
import { ObjectPreview } from './ObjectPreview';
import { mapFor } from '../Utils/MapFor';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import Text from '../UI/Text';
import { enumerateObjectFolderOrObjects } from '.';
import CompactPropertiesEditor from '../CompactPropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import { Column } from '../UI/Grid';

const QuickBehaviorPropertiesEditor = ({
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

  return (
    <CompactPropertiesEditor
      project={project}
      schema={basicPropertiesSchema}
      instances={[behavior]}
      onInstancesModified={onBehaviorUpdated}
      resourceManagementProps={resourceManagementProps}
    />
  );
};

const getObjectBehaviorNamesToTweak = (object: gdObject) => {
  return object
    .getAllBehaviorNames()
    .toJSArray()
    .filter(behaviorName => {
      const behavior = object.getBehavior(behaviorName);
      if (behavior.isDefaultBehavior()) {
        return false;
      }
      if (
        behavior
          .getProperties()
          .keys()
          .size() === 0
      ) {
        return false;
      }

      return true;
    });
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
|};

export const QuickBehaviorsTweaker = ({
  project,
  resourceManagementProps,
}: Props) => {
  return (
    <ColumnStackLayout noMargin expand>
      {mapFor(0, project.getLayoutsCount(), i => {
        const layout = project.getLayoutAt(i);
        const folderObjects = enumerateObjectFolderOrObjects(
          layout.getObjects().getRootFolder()
        );

        if (!folderObjects.length) return null;

        return (
          <ColumnStackLayout noMargin expand>
            {project.getLayoutsCount() > 1 && (
              <Text noMargin size={'block-title'}>
                {layout.getName()}
              </Text>
            )}
            {folderObjects.map(({ folderName, objects }) => {
              return (
                <ColumnStackLayout noMargin expand>
                  <Text noMargin size={'sub-title'}>
                    {folderName}
                  </Text>
                  {objects.map(object => {
                    const behaviorNamesToTweak = getObjectBehaviorNamesToTweak(
                      object
                    );
                    if (!behaviorNamesToTweak.length) {
                      return null;
                    }

                    return (
                      <ResponsiveLineStackLayout noMargin expand>
                        <ObjectPreview object={object} project={project} />
                        <Column noMargin>
                          {behaviorNamesToTweak.map(behaviorName => {
                            const behavior = object.getBehavior(behaviorName);
                            if (behavior.isDefaultBehavior()) {
                              return null;
                            }
                            if (
                              behavior
                                .getProperties()
                                .keys()
                                .size() === 0
                            ) {
                              return null;
                            }

                            return (
                              <Column noMargin expand>
                                <QuickBehaviorPropertiesEditor
                                  project={project}
                                  behavior={behavior}
                                  object={object}
                                  onBehaviorUpdated={() => {}}
                                  resourceManagementProps={
                                    resourceManagementProps
                                  }
                                />
                              </Column>
                            );
                          })}
                        </Column>
                      </ResponsiveLineStackLayout>
                    );
                  })}
                </ColumnStackLayout>
              );
            })}
          </ColumnStackLayout>
        );
      })}
    </ColumnStackLayout>
  );
};

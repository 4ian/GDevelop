// @flow
import * as React from 'react';
import { ObjectPreview } from './ObjectPreview';
import { mapFor } from '../Utils/MapFor';
import { ColumnStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import AssetSwappingDialog from '../AssetStore/AssetSwappingDialog';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
|};

const styles = {
  objectsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
};

const canSwapAssetOfObject = (object: gdObject) => {
  const type = object.getType();
  return type === 'Scene3D::Model3DObject' || type === 'Sprite';
};

const enumerateObjectFolderOrObjects = (
  objectFolderOrObject: gdObjectFolderOrObject,
  depth: number = 0
): Array<{ folderName: string, objects: Array<gdObject> }> => {
  const orderedFolderNames: Array<string> = [''];
  const folderObjects: { [key: string]: Array<gdObject> } = {
    '': [],
  };

  mapFor(0, objectFolderOrObject.getChildrenCount(), i => {
    const child = objectFolderOrObject.getChildAt(i);

    if (child.isFolder()) {
      const folderName = child.getFolderName();
      const currentFolderObjects: Array<gdObject> = (folderObjects[folderName] =
        folderObjects[folderName] || []);
      orderedFolderNames.push(folderName);

      enumerateObjectFolderOrObjects(child, depth + 1).forEach(
        ({ folderName, objects }) => {
          currentFolderObjects.push.apply(currentFolderObjects, objects);
        }
      );
    } else {
      const object = child.getObject();
      if (canSwapAssetOfObject(object))
        folderObjects[''].push(child.getObject());
    }
  });

  return orderedFolderNames
    .map(folderName => ({
      folderName,
      objects: folderObjects[folderName],
    }))
    .filter(folder => folder.objects.length > 0);
};

export const QuickObjectReplacer = ({
  project,
  resourceManagementProps,
}: Props) => {
  const [selectedObjectToSwap, setSelectedObjectToSwap] = React.useState(null);

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
                  <div style={styles.objectsContainer}>
                    {objects.map(object => (
                      <ColumnStackLayout noMargin>
                        <ObjectPreview object={object} project={project} />
                        <FlatButton
                          primary
                          label={<Trans>Replace</Trans>}
                          onClick={() => {
                            setSelectedObjectToSwap({ object, layout });
                          }}
                        />
                      </ColumnStackLayout>
                    ))}
                  </div>
                </ColumnStackLayout>
              );
            })}
          </ColumnStackLayout>
        );
      })}
      {selectedObjectToSwap && (
        <AssetSwappingDialog
          project={project}
          layout={selectedObjectToSwap.layout}
          eventsBasedObject={null}
          objectsContainer={selectedObjectToSwap.layout.getObjects()}
          object={selectedObjectToSwap.object}
          resourceManagementProps={resourceManagementProps}
          onClose={() => {
            setSelectedObjectToSwap(null);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};

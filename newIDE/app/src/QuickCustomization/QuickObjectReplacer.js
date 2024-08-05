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
  onLaunchPreview: () => Promise<void>,
|};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
  onLaunchPreview,
}: Props) => {
  const [selectedObjectToSwap, setSelectedObjectToSwap] = React.useState(null);

  if (project.getLayoutsCount() === 0) return null;
  const layout = project.getLayoutAt(0);


  return (
    <ColumnStackLayout noMargin expand>
      {enumerateObjectFolderOrObjects(layout.getObjects().getRootFolder()).map(
        ({ folderName, objects }) => {
          return (
            <ColumnStackLayout noMargin expand>
              <Text noMargin size={'sub-title'}>
                {folderName}
              </Text>
              <div style={styles.container}>
                {objects.map(object => (
                  <ColumnStackLayout noMargin>
                    <ObjectPreview object={object} project={project} />
                    <FlatButton
                      primary
                      label={<Trans>Replace</Trans>}
                      onClick={() => {
                        setSelectedObjectToSwap(object);
                      }}
                    />
                  </ColumnStackLayout>
                ))}
              </div>
            </ColumnStackLayout>
          );
        }
      )}
      {selectedObjectToSwap && (
        <AssetSwappingDialog
          project={project}
          layout={layout}
          eventsBasedObject={null}
          objectsContainer={layout.getObjects()}
          object={selectedObjectToSwap}
          resourceManagementProps={resourceManagementProps}
          onClose={() => {
            setSelectedObjectToSwap(null);
          }}
          onObjectsConfigurationSwapped={() => {
            setSelectedObjectToSwap(null);
          }}
          canInstallPrivateAsset={
            () => false /* TODO: move to resourceManagementProps. */
          }
        />
      )}
    </ColumnStackLayout>
  );
};

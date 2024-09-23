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
import { enumerateObjectFolderOrObjects } from '.';
import TipCard from './TipCard';

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

export const QuickObjectReplacer = ({
  project,
  resourceManagementProps,
}: Props) => {
  const [selectedObjectToSwap, setSelectedObjectToSwap] = React.useState(null);

  return (
    <ColumnStackLayout noMargin expand>
      <TipCard
        title={<Trans>These are objects</Trans>}
        description={
          <Trans>
            Each character, player, obstacle, background, item, etc. is an
            object. Objects are the building blocks of your game.
          </Trans>
        }
      />
      {mapFor(0, project.getLayoutsCount(), i => {
        const layout = project.getLayoutAt(i);
        const folderObjects = enumerateObjectFolderOrObjects(
          layout.getObjects().getRootFolder()
        );

        if (!folderObjects.length) return null;

        return (
          <ColumnStackLayout noMargin key={layout.getName()}>
            {project.getLayoutsCount() > 1 && (
              <Text noMargin size={'block-title'}>
                {layout.getName()}
              </Text>
            )}
            {folderObjects.map(({ folderName, objects }) => {
              return (
                <ColumnStackLayout noMargin key={folderName}>
                  <Text noMargin size={'sub-title'}>
                    {folderName}
                  </Text>
                  <div style={styles.objectsContainer}>
                    {objects.map(object => (
                      <ColumnStackLayout noMargin key={object.ptr}>
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
          minimalUI
        />
      )}
    </ColumnStackLayout>
  );
};

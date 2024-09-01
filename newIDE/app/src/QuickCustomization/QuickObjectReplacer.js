// @flow
import * as React from 'react';
import { ObjectPreview } from './ObjectPreview';
import { mapFor } from '../Utils/MapFor';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import AssetSwappingDialog from '../AssetStore/AssetSwappingDialog';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { enumerateObjectFolderOrObjects } from '.';
import { CalloutCard } from '../UI/CalloutCard';
import { LargeSpacer } from '../UI/Grid';

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
      <LargeSpacer />
      <CalloutCard
        renderImage={style => (
          <img
            src="res/quick_customization/replace_objects.svg"
            style={style}
            alt=""
          />
        )}
      >
        <ResponsiveLineStackLayout noMargin expand alignItems="stretch">
          <ColumnStackLayout alignItems="flex-start" expand noMargin>
            <Text noMargin size="block-title">
              <Trans>Objects are everything in your game</Trans>
            </Text>
            <Text noMargin size="body">
              <Trans>
                Each character, player, obstacle, background, item, etc. is an
                object. Objects are the building blocks of your game.
              </Trans>
            </Text>
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      </CalloutCard>
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

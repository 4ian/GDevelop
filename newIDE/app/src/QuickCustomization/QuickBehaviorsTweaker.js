// @flow
import * as React from 'react';
import { ObjectPreview } from './ObjectPreview';
import { mapFor } from '../Utils/MapFor';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import Text from '../UI/Text';
import { enumerateObjectFolderOrObjects } from '.';
import CompactPropertiesEditor from '../CompactPropertiesEditor';
import propertiesMapToSchema from '../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { Trans } from '@lingui/macro';
import { useForceRecompute } from '../Utils/UseForceUpdate';
import TipCard from './TipCard';
import { Column } from '../UI/Grid';

const gd: libGDevelop = global.gd;

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
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();
  const basicPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return propertiesMapToSchema({
        properties: behavior.getProperties(),
        getProperties: behavior => behavior.getProperties(),
        onUpdateProperty: (behavior, name, value) => {
          behavior.updateProperty(name, value);
        },
        object,
        visibility: 'Basic-Quick',
        quickCustomizationVisibilities: behavior.getPropertiesQuickCustomizationVisibilities(),
      });
    },
    [behavior, object, schemaRecomputeTrigger]
  );

  return (
    <Column noMargin>
      <CompactPropertiesEditor
        project={project}
        schema={basicPropertiesSchema}
        instances={[behavior]}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        onRefreshAllFields={forceRecomputeSchema}
      />
    </Column>
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

      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        behavior.getTypeName()
      );
      if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
        return false;
      }
      if (
        behaviorMetadata.getQuickCustomizationVisibility() ===
        gd.QuickCustomization.Hidden
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
      <TipCard
        title={<Trans>These are behaviors</Trans>}
        description={
          <Trans>
            Behaviors are attached to objects and make them alive. The rules of
            the game can be created using behaviors and events.
          </Trans>
        }
      />
      {mapFor(0, project.getLayoutsCount(), i => {
        const layout = project.getLayoutAt(i);
        const folderObjects = enumerateObjectFolderOrObjects(
          layout.getObjects().getRootFolder()
        );

        if (!folderObjects.length) return null;

        const objectEditorsPerFolderNodes = folderObjects
          .map(({ folderName, objects }) => {
            const behaviorPropertiesEditorsNodes = objects
              .map(object => {
                const behaviorNamesToTweak = getObjectBehaviorNamesToTweak(
                  object
                );
                if (!behaviorNamesToTweak.length) {
                  return null;
                }

                return (
                  <ResponsiveLineStackLayout noMargin expand key={object.ptr}>
                    <ObjectPreview object={object} project={project} />
                    <ColumnStackLayout noMargin expand noOverflowParent>
                      {behaviorNamesToTweak.map(behaviorName => {
                        const behavior = object.getBehavior(behaviorName);

                        return (
                          <QuickBehaviorPropertiesEditor
                            project={project}
                            behavior={behavior}
                            object={object}
                            onBehaviorUpdated={() => {}}
                            resourceManagementProps={resourceManagementProps}
                            key={behavior.ptr}
                          />
                        );
                      })}
                    </ColumnStackLayout>
                  </ResponsiveLineStackLayout>
                );
              })
              .filter(Boolean);

            if (!behaviorPropertiesEditorsNodes.length) {
              return null;
            }

            return (
              <ColumnStackLayout
                noMargin
                expand
                noOverflowParent
                key={folderName}
              >
                <Text noMargin size={'sub-title'}>
                  {folderName}
                </Text>
                <ColumnStackLayout
                  noMargin
                  expand
                  noOverflowParent
                  useLargeSpacer
                >
                  {behaviorPropertiesEditorsNodes}
                </ColumnStackLayout>
              </ColumnStackLayout>
            );
          })
          .filter(Boolean);

        if (!objectEditorsPerFolderNodes.length) {
          return null;
        }

        return (
          <ColumnStackLayout
            noMargin
            expand
            noOverflowParent
            key={layout.getName()}
          >
            {project.getLayoutsCount() > 1 && (
              <Text noMargin size={'block-title'}>
                {layout.getName()}
              </Text>
            )}
            {objectEditorsPerFolderNodes}
          </ColumnStackLayout>
        );
      }).filter(Boolean)}
    </ColumnStackLayout>
  );
};

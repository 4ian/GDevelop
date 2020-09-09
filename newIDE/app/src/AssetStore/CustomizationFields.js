// @flow
import * as React from 'react';
import { type Asset } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout } from '../UI/Layout';
import { unserializeFromJSObject } from '../Utils/Serializer';
import flatten from 'lodash/flatten';
import ParameterRenderingService from '../EventsSheet/ParameterRenderingService';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  asset: Asset,
|};

export default function CustomizationFields({
  asset,
  project,
  layout,
  objectsContainer,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
}: Props) {
  const [allParameterMetadata, setAllParameterMetadata] = React.useState<
    Array<gdParameterMetadata>
  >([]);

  React.useEffect(
    () => {
      // TODO: refactor into InstallAsset?
      setAllParameterMetadata(
        flatten(
          asset.objectAssets.map(objectAsset => {
            return flatten(
              objectAsset.customization
                .map(customization => {
                  if (customization.events) {
                    return customization.parameters.map(
                      serializedParameterMetadata => {
                        const parameterMetadata = new gd.ParameterMetadata();
                        unserializeFromJSObject(
                          parameterMetadata,
                          serializedParameterMetadata
                        );
                        return parameterMetadata;
                      }
                    );
                  } else if (customization.behaviorName) {
                    return customization.properties.map(
                      serializedParameterMetadata => {
                        const parameterMetadata = new gd.ParameterMetadata();
                        unserializeFromJSObject(
                          parameterMetadata,
                          serializedParameterMetadata
                        );
                        return parameterMetadata;
                      }
                    );
                  }

                  return null;
                })
                .filter(Boolean)
            );
          })
        ).filter(Boolean)
      );

      return () => {
        allParameterMetadata.forEach(parameterMetadata => {
          parameterMetadata.delete();
        });
        setAllParameterMetadata([]);
      };
    },
    [asset]
  );

  return (
    <ColumnStackLayout>
      {allParameterMetadata.map((parameterMetadata, index) => {
        const parameterMetadataType = parameterMetadata.getType();
        const ParameterComponent = ParameterRenderingService.getParameterComponent(
          parameterMetadataType
        );

        return (
          <ParameterComponent
            parameterMetadata={parameterMetadata}
            value={'TODO'}
            onChange={value => {
              /* TODO */
            }}
            project={project}
            scope={{
              layout,
            }}
            globalObjectsContainer={project}
            objectsContainer={objectsContainer}
            key={index}
            parameterRenderingService={ParameterRenderingService}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
          />
        );
      })}
    </ColumnStackLayout>
  );
}

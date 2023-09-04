// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import ImagePreview, { isProjectImageResourceSmooth } from './ImagePreview';
import GenericIconPreview from './GenericIconPreview';
import FontDownload from '@material-ui/icons/FontDownload';
import File from '../../UI/CustomSvgIcons/File';
import Video from '../../UI/CustomSvgIcons/Video';
import Music from '../../UI/CustomSvgIcons/Music';
import useForceUpdate from '../../Utils/UseForceUpdate';

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  onSize?: (number, number) => void,
|};

export type ResourcePreviewInterface = {| forceUpdate: () => void |};

/**
 * Display the right preview for any given resource of a project
 */
const ResourcePreview = React.forwardRef<Props, ResourcePreviewInterface>(
  (props, ref) => {
    const forceUpdate = useForceUpdate();
    React.useImperativeHandle(ref, () => ({ forceUpdate }));
    const { project, resourceName } = props;
    const resourcesManager = project.getResourcesManager();
    const resourceKind = resourcesManager.hasResource(resourceName)
      ? resourcesManager.getResource(resourceName).getKind()
      : null;

    switch (resourceKind) {
      case 'image':
        return (
          <ImagePreview
            resourceName={props.resourceName}
            imageResourceSource={props.resourcesLoader.getResourceFullUrl(
              props.project,
              props.resourceName,
              {}
            )}
            isImageResourceSmooth={isProjectImageResourceSmooth(
              props.project,
              props.resourceName
            )}
            onSize={props.onSize}
          />
        );
      case 'audio':
        return (
          <GenericIconPreview renderIcon={props => <Music {...props} />} />
        );
      case 'json':
      case 'tilemap':
      case 'tileset':
      case 'model3D':
        return <GenericIconPreview renderIcon={props => <File {...props} />} />;
      case 'video':
        return (
          <GenericIconPreview renderIcon={props => <Video {...props} />} />
        );
      case 'font':
      case 'bitmapFont':
        return (
          <GenericIconPreview
            renderIcon={props => <FontDownload {...props} />}
          />
        );
      default:
        return null;
    }
  }
);

export default ResourcePreview;

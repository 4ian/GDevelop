// @flow
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import FontDownload from '@material-ui/icons/FontDownload';
import { Trans } from '@lingui/macro';
import ResourcesLoader from '../../ResourcesLoader';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import CheckeredBackground from '../CheckeredBackground';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';

const paddingSize = 10;
const styles = {
  previewContainer: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    position: 'relative',
    objectFit: 'contain',
    verticalAlign: 'middle',
    pointerEvents: 'none',
  },
  cardContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    backgroundColor: 'rgb(0,0,0,0.5)',
  },
  title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  icon: { width: 32, height: 32 },
};

type ImageCardProps = {|
  project: gdProject,
  size: number,
  isSelected?: boolean,
  resource: gdResource,
  onChoose: () => void,
  imageStyle?: {|
    width: number,
    height: number,
    filter?: string,
  |},
|};

const ImageCard = ({
  project,
  resource,
  onChoose,
  size,
  isSelected,
  imageStyle,
}: ImageCardProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const resourceName = resource.getName();
  const resourceThumbnail = ResourcesLoader.getResourceFullUrl(
    project,
    resource.getName(),
    {}
  );
  return (
    <ButtonBase onClick={onChoose} focusRipple>
      <div
        style={{
          ...styles.cardContainer,
          width: size,
          height: size,
          outline: isSelected
            ? `1px solid ${gdevelopTheme.palette.secondary}`
            : undefined,
        }}
      >
        <div style={{ ...styles.previewContainer, width: size, height: size }}>
          <CheckeredBackground />
          <CorsAwareImage
            key={resourceName}
            style={{
              ...styles.previewImage,
              maxWidth: 128 - 2 * paddingSize,
              maxHeight: 128 - 2 * paddingSize,
              ...imageStyle,
            }}
            src={resourceThumbnail}
            alt={resourceName}
          />
        </div>
        <div style={styles.titleContainer}>
          <Text noMargin style={styles.title} color="inherit">
            {resourceName}
          </Text>
        </div>
      </div>
    </ButtonBase>
  );
};

type GenericCardProps = {|
  resource: gdResource,
  size: number,
  onChoose: () => void,
  children: React.Node,
|};

const GenericCard = ({
  resource,
  onChoose,
  size,
  children,
}: GenericCardProps) => {
  const resourceName = resource.getName();
  return (
    <div style={{ ...styles.cardContainer, width: size, height: size }}>
      <Column>{children}</Column>
      <div style={styles.titleContainer}>
        <Text noMargin style={styles.title}>
          {resourceName}
        </Text>
      </div>
    </div>
  );
};

type Props = {|
  project: gdProject,
  resource: gdResource,
  size: number,
  onChoose: () => void,
  isSelected?: boolean,
|};

export const ProjectResourceCard = ({
  project,
  resource,
  onChoose,
  size,
  isSelected,
}: Props) => {
  const resourceKind = resource.getKind();

  switch (resourceKind) {
    case 'image':
      return (
        <ImageCard
          project={project}
          isSelected={isSelected}
          resource={resource}
          onChoose={onChoose}
          size={size}
        />
      );
    case 'model3D':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <FontDownload style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            {!isSelected ? (
              <RaisedButton onClick={onChoose} label={<Trans>Select</Trans>} />
            ) : (
              <FlatButton label={<Trans>Unselect</Trans>} onClick={onChoose} />
            )}
          </Line>
        </GenericCard>
      );
    default:
      return null;
  }
};

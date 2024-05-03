// @flow
import * as React from 'react';
import { type Resource } from '../../Utils/GDevelopServices/Asset';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import FontDownload from '@material-ui/icons/FontDownload';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import CheckeredBackground from '../../ResourcesList/CheckeredBackground';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Video from '../../UI/CustomSvgIcons/Video';
import File from '../../UI/CustomSvgIcons/File';

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
  previewIconDarkTheme: {
    width: 40,
    height: 40,
    filter: 'grayscale(1) invert(1)',
  },
  previewIconLightTheme: {
    width: 40,
    height: 40,
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
  audioElement: { width: 128, height: 40 },
};

type ImageCardProps = {|
  size: number,
  resource: Resource,
  onChoose: () => void,
  imageStyle?: {|
    width: number,
    height: number,
    filter?: string,
  |},
|};

const ImageCard = ({
  resource,
  onChoose,
  size,
  imageStyle,
}: ImageCardProps) => {
  return (
    <ButtonBase onClick={onChoose} focusRipple>
      <div style={{ ...styles.cardContainer, width: size, height: size }}>
        <div style={{ ...styles.previewContainer, width: size, height: size }}>
          <CheckeredBackground />
          <CorsAwareImage
            key={resource.url}
            style={{
              ...styles.previewImage,
              maxWidth: 128 - 2 * paddingSize,
              maxHeight: 128 - 2 * paddingSize,
              ...imageStyle,
            }}
            src={resource.url}
            alt={resource.name}
          />
        </div>
        <div style={styles.titleContainer}>
          <Text noMargin style={styles.title}>
            {resource.name}
          </Text>
          <Text noMargin style={styles.title} size="body2">
            {resource.license}
          </Text>
        </div>
      </div>
    </ButtonBase>
  );
};

type GenericCardProps = {|
  size: number,
  resource: Resource,
  onChoose: () => void,
  children: React.Node,
|};

const GenericCard = ({
  resource,
  onChoose,
  size,
  children,
}: GenericCardProps) => {
  return (
    <div style={{ ...styles.cardContainer, width: size, height: size }}>
      <Column>{children}</Column>
      <div style={styles.titleContainer}>
        <Text noMargin style={styles.title}>
          {resource.name}
        </Text>
        <Text noMargin style={styles.title} size="body2">
          {resource.license}
        </Text>
      </div>
    </div>
  );
};

type Props = {|
  size: number,
  resource: Resource,
  onChoose: () => void,
|};

export const ResourceCard = ({ resource, onChoose, size }: Props) => {
  const resourceKind = resource.type;
  const theme = React.useContext(GDevelopThemeContext);

  switch (resourceKind) {
    case 'image':
      return <ImageCard resource={resource} onChoose={onChoose} size={size} />;
    case 'svg':
      return (
        <ImageCard
          resource={resource}
          onChoose={onChoose}
          size={size}
          imageStyle={
            theme.palette.type === 'light'
              ? styles.previewIconLightTheme
              : styles.previewIconDarkTheme
          }
        />
      );
    case 'audio':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <audio controls src={resource.url} style={styles.audioElement}>
              Audio preview is unsupported.
            </audio>
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    case 'json':
    case 'tilemap':
    case 'tileset':
    case 'spine':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <File style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    case 'video':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <Video style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    case 'font':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <FontDownload style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    case 'model3D':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <FontDownload style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    case 'atlas':
      return (
        <GenericCard onChoose={onChoose} resource={resource} size={size}>
          <Line justifyContent="center">
            <FontDownload style={styles.icon} />
          </Line>
          <Line justifyContent="center">
            <RaisedButton onClick={onChoose} label={<Trans>Choose</Trans>} />
          </Line>
        </GenericCard>
      );
    default:
      return null;
  }
};

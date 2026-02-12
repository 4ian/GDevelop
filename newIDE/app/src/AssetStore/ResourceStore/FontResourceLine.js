// @flow

import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { type FontResourceV2 } from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import Paper from '../../UI/Paper';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import { LineStackLayout } from '../../UI/Layout';
import { textEllipsisStyle } from '../../UI/TextEllipsis';

const PADDING = 8;
const BUTTON_BORDER_THICKNESS = 2;
const styles = {
  paper: {
    padding: PADDING,
    width: `calc(100% - ${PADDING * 2 + BUTTON_BORDER_THICKNESS}px)`,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-start',
  },
  previewContainer: {
    backgroundColor: 'white',
    padding: PADDING,
    height: 60,
    display: 'flex',
    overflowX: 'scroll',
    width: `calc(100% - ${PADDING * 2}px)`,
  },
  previewImage: {
    objectFit: 'contain',
    verticalAlign: 'middle',
    pointerEvents: 'none',
    maxHeight: '100%',
  },
  button: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    overflowX: 'hidden',
  },
};

const fontExtensionRegex = /\.(otf|ttf)$/;

type Props = {|
  fontResource: FontResourceV2,
  isSelected: boolean,
  onSelect: () => void,
|};

const FontResourceLine = ({ fontResource, isSelected, onSelect }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const fontNameWithoutExtension = fontResource.name.replace(
    fontExtensionRegex,
    ''
  );
  return (
    <ButtonBase
      onClick={onSelect}
      disableRipple
      disableTouchRipple
      style={styles.button}
    >
      <Paper
        background={isSelected ? 'light' : 'medium'}
        style={{
          ...styles.paper,
          borderColor: gdevelopTheme.palette.secondary,
        }}
        variant={isSelected ? 'outlined' : undefined}
      >
        <div style={styles.container}>
          <LineStackLayout noMargin alignItems="center">
            <Text
              noMargin
              size="sub-title"
              align="left"
              style={textEllipsisStyle}
            >
              {fontNameWithoutExtension}
            </Text>
            <Text
              noMargin
              color="secondary"
              align="left"
              style={textEllipsisStyle}
            >
              {fontResource.license}
            </Text>
          </LineStackLayout>
          <div style={styles.previewContainer}>
            <CorsAwareImage
              style={styles.previewImage}
              src={fontResource.previewImageUrl}
              alt={fontResource.name}
            />
          </div>
        </div>
      </Paper>
    </ButtonBase>
  );
};

export default FontResourceLine;

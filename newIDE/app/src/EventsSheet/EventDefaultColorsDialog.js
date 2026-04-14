// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Line, Column } from '../UI/Grid';
import ColorPicker from '../UI/ColorField/ColorPicker';
import {
  type RGBColor,
  rgbToHex,
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
  isLightRgbColor,
} from '../Utils/ColorTransformer';
import { MiniToolbarText } from '../UI/MiniToolbar';

const EXTENSION_NAME = 'EventDefaultColors';
const PROP_GROUP_BG = 'groupBg';
const PROP_COMMENT_BG = 'commentBg';
const PROP_COMMENT_TEXT = 'commentText';

const styles = {
  colorPicker: {
    width: 90,
    marginRight: 10,
  },
  previewContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    color: '#000',
  },
  previewEvent: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'sans-serif',
    display: 'flex',
    alignItems: 'center',
    minHeight: '2.5em',
  },
  groupTitle: {
    fontSize: '1.3em',
    fontWeight: 'normal',
  },
  commentText: {
    fontStyle: 'italic',
    whiteSpace: 'pre-wrap',
  },
};

type Props = {|
  project: gdProject,
  onClose: () => void,
|};

const EventDefaultColorsDialog = ({ project, onClose }: Props) => {
  const extensionProperties = project.getExtensionProperties();

  const [groupColor, setGroupColor] = React.useState<RGBColor>(
    rgbStringAndAlphaToRGBColor(
      extensionProperties.getValue(EXTENSION_NAME, PROP_GROUP_BG)
    ) || { r: 74, g: 176, b: 228 }
  );
  const [commentBgColor, setCommentBgColor] = React.useState<RGBColor>(
    rgbStringAndAlphaToRGBColor(
      extensionProperties.getValue(EXTENSION_NAME, PROP_COMMENT_BG)
    ) || { r: 255, g: 230, b: 109 }
  );
  const [commentTextColor, setCommentTextColor] = React.useState<RGBColor>(
    rgbStringAndAlphaToRGBColor(
      extensionProperties.getValue(EXTENSION_NAME, PROP_COMMENT_TEXT)
    ) || { r: 0, g: 0, b: 0 }
  );

  const onApply = () => {
    extensionProperties.setValue(
      EXTENSION_NAME,
      PROP_GROUP_BG,
      rgbColorToRGBString(groupColor)
    );
    extensionProperties.setValue(
      EXTENSION_NAME,
      PROP_COMMENT_BG,
      rgbColorToRGBString(commentBgColor)
    );
    extensionProperties.setValue(
      EXTENSION_NAME,
      PROP_COMMENT_TEXT,
      rgbColorToRGBString(commentTextColor)
    );
    onClose();
  };

  const groupTextColorHex = isLightRgbColor(groupColor) ? '#000000' : '#ffffff';
  const groupBgColorHex = `#${rgbToHex(
    groupColor.r,
    groupColor.g,
    groupColor.b
  )}`;
  const commentBgColorHex = `#${rgbToHex(
    commentBgColor.r,
    commentBgColor.g,
    commentBgColor.b
  )}`;
  const commentTextColorHex = `#${rgbToHex(
    commentTextColor.r,
    commentTextColor.g,
    commentTextColor.b
  )}`;

  return (
    <Dialog
      title={<Trans>Group and Comment default colors</Trans>}
      open
      maxWidth="sm"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          onClick={onApply}
        />,
      ]}
      onRequestClose={onClose}
    >
      <Column noMargin>
        <Line alignItems="center">
          <MiniToolbarText>
            <Trans>Group background:</Trans>
          </MiniToolbarText>
          <ColorPicker
            style={styles.colorPicker}
            color={groupColor}
            onChangeComplete={color => setGroupColor(color.rgb)}
            disableAlpha
          />
        </Line>
        <Line alignItems="center">
          <MiniToolbarText>
            <Trans>Comment background:</Trans>
          </MiniToolbarText>
          <ColorPicker
            style={styles.colorPicker}
            color={commentBgColor}
            onChangeComplete={color => setCommentBgColor(color.rgb)}
            disableAlpha
          />
          <MiniToolbarText>
            <Trans>Comment text:</Trans>
          </MiniToolbarText>
          <ColorPicker
            style={styles.colorPicker}
            color={commentTextColor}
            onChangeComplete={color => setCommentTextColor(color.rgb)}
            disableAlpha
          />
        </Line>
        <Column noMargin style={styles.previewContainer}>
          <MiniToolbarText>
            <Trans>Preview (newly created events):</Trans>
          </MiniToolbarText>
          <div
            style={{
              ...styles.previewEvent,
              backgroundColor: groupBgColorHex,
              color: groupTextColorHex,
            }}
          >
            <span style={styles.groupTitle}>
              <Trans>Example Group</Trans>
            </span>
          </div>
          <div
            style={{
              ...styles.previewEvent,
              backgroundColor: commentBgColorHex,
              color: commentTextColorHex,
            }}
          >
            <span style={styles.commentText}>
              <Trans>
                This is a comment event with your chosen default colors.
              </Trans>
            </span>
          </div>
        </Column>
      </Column>
    </Dialog>
  );
};

export default EventDefaultColorsDialog;

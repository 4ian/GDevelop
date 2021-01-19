// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { type RGBColor } from '../../Utils/ColorTransformer';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

const gd: libGDevelop = global.gd;

const styles = {
  sizeTextField: {
    width: 90,
  },
};

type Props = {|
  event: gdBaseEvent,
  onClose: () => void,
  onApply: () => void,
|};

type State = {|
  textValue: string,
  textColor: RGBColor,
  backgroundColor: RGBColor,
|};

const white: RGBColor = {
  r: 255,
  g: 255,
  b: 255,
};

const black: RGBColor = {
  r: 0,
  g: 0,
  b: 0,
};

export const filterEditableWithEventTextDialog = (
  events: Array<gdBaseEvent>
): Array<gdBaseEvent> => {
  return events.filter(event =>
    [
      'BuiltinCommonInstructions::Group',
      'BuiltinCommonInstructions::Comment',
    ].includes(event.getType())
  );
};

export default class EventTextDialog extends React.Component<Props, State> {
  _applyChangesOnEvent = () => {
    const { event } = this.props;
    const { textValue, textColor, backgroundColor } = this.state;
    const eventType = event.getType();

    if (eventType === 'BuiltinCommonInstructions::Comment') {
      //Text value
      gd.asCommentEvent(event).setComment(textValue);

      //Text color
      gd.asCommentEvent(event).setTextColor(
        textColor.r,
        textColor.g,
        textColor.b
      );
      //Background color
      gd.asCommentEvent(event).setBackgroundColor(
        backgroundColor.r,
        backgroundColor.g,
        backgroundColor.b
      );
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      //Text value
      gd.asGroupEvent(event).setName(textValue);

      //Text color for group not supported in Core, instead GroupEvent.js handle this
      //Background color
      gd.asGroupEvent(event).setBackgroundColor(
        backgroundColor.r,
        backgroundColor.g,
        backgroundColor.b
      );
      return;
    }
  };

  _getInitialStateFromEvent = (): State => {
    const { event } = this.props;
    const eventType = event.getType();

    let textValue: string = '';
    let textColor = black;
    let backgroundColor = black;

    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentEvent = gd.asCommentEvent(event);
      textColor = {
        r: commentEvent.getTextColorRed(),
        g: commentEvent.getTextColorGreen(),
        b: commentEvent.getTextColorBlue(),
      };

      backgroundColor = {
        r: commentEvent.getBackgroundColorRed(),
        g: commentEvent.getBackgroundColorGreen(),
        b: commentEvent.getBackgroundColorBlue(),
      };

      textValue = gd.asCommentEvent(event).getComment();
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      var groupEvent = gd.asGroupEvent(event);
      const r = groupEvent.getBackgroundColorR(),
        g = groupEvent.getBackgroundColorG(),
        b = groupEvent.getBackgroundColorB();

      // Text color is automatically chosen for groups.
      textColor = (r + g + b) / 3 > 200 ? black : white;

      backgroundColor = {
        r: groupEvent.getBackgroundColorR(),
        g: groupEvent.getBackgroundColorG(),
        b: groupEvent.getBackgroundColorB(),
      };

      textValue = gd.asGroupEvent(event).getName();
    } else {
      console.error(
        'Dialog was opened for an unsupported event type: ' + eventType
      );
    }

    return {
      textValue,
      textColor,
      backgroundColor,
    };
  };

  state = this._getInitialStateFromEvent();

  render() {
    const { event, onApply, onClose } = this.props;
    const { textValue, textColor, backgroundColor } = this.state;
    const eventType = event.getType();

    return (
      <Dialog
        title={<Trans>Edit the event text</Trans>}
        onRequestClose={onClose}
        cannotBeDismissed={true}
        open
        noMargin
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onClose}
          />,
          <FlatButton
            key={'Apply'}
            label={<Trans>Apply</Trans>}
            primary
            keyboardFocused
            onClick={() => {
              this._applyChangesOnEvent();
              onApply();
            }}
          />,
        ]}
      >
        <Column noMargin>
          <MiniToolbar>
            <MiniToolbarText>
              <Trans>Background color:</Trans>
            </MiniToolbarText>
            <ColorPicker
              style={styles.sizeTextField}
              disableAlpha
              color={backgroundColor}
              onChangeComplete={color => {
                this.setState({ backgroundColor: color.rgb });
              }}
            />

            {eventType === 'BuiltinCommonInstructions::Comment' && (
              <React.Fragment>
                <MiniToolbarText>
                  <Trans>Text color:</Trans>
                </MiniToolbarText>
                <ColorPicker
                  style={styles.sizeTextField}
                  disableAlpha
                  color={textColor}
                  onChangeComplete={color => {
                    this.setState({ textColor: color.rgb });
                  }}
                />
              </React.Fragment>
            )}
          </MiniToolbar>
          <Line noMargin>
            <Column expand>
              <Line>
                <SemiControlledTextField
                  commitOnBlur
                  hintText={t`Enter the text to be displayed`}
                  fullWidth
                  multiline
                  rows={8}
                  rowsMax={30}
                  value={textValue}
                  onChange={value => {
                    this.setState({
                      textValue: value,
                    });
                  }}
                />
              </Line>
            </Column>
          </Line>
        </Column>
      </Dialog>
    );
  }
}

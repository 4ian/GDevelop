// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

const gd = global.gd;

const toolbarItemStyle = {
  marginRight: 10,
};

const styles = {
  sizeTextField: {
    width: 90,
    ...toolbarItemStyle,
  },
  toolbarItem: toolbarItemStyle,
  checkbox: toolbarItemStyle,
};

type Props = {|
  event: gdBaseEvent,
  onClose: () => void,
  onApply: () => void,
|};

type State = {|
  textValue: any,
  textColor: {| r: number, g: number, b: number |},
  backgroundColor: {| r: number, g: number, b: number |},
|};

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
        parseInt(textColor.r),
        parseInt(textColor.g),
        parseInt(textColor.b)
      );
      //Background color
      gd.asCommentEvent(event).setBackgroundColor(
        parseInt(backgroundColor.r),
        parseInt(backgroundColor.g),
        parseInt(backgroundColor.b)
      );
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      //Text value
      gd.asGroupEvent(event).setName(textValue);

      //Text color for group not supported in Core, instead GroupEvent.js handle this
      //Background color
      gd.asGroupEvent(event).setBackgroundColor(
        parseInt(backgroundColor.r),
        parseInt(backgroundColor.g),
        parseInt(backgroundColor.b)
      );
      return;
    }
  };

  _getInitialStateFromEvent = () => {
    const { event } = this.props;
    const eventType = event.getType();
    let text, textColors, backgroundColors;

    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentEvent = gd.asCommentEvent(event);
      textColors = {
        r: commentEvent.getTextColorRed(),
        g: commentEvent.getTextColorGreen(),
        b: commentEvent.getTextColorBlue(),
      };

      backgroundColors = {
        r: commentEvent.getBackgroundColorRed(),
        g: commentEvent.getBackgroundColorGreen(),
        b: commentEvent.getBackgroundColorBlue(),
      };

      text = gd.asCommentEvent(event).getComment();
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      var groupEvent = gd.asGroupEvent(event);
      const r = groupEvent.getBackgroundColorR(),
        g = groupEvent.getBackgroundColorG(),
        b = groupEvent.getBackgroundColorB();

      const white = {
        r: 255,
        g: 255,
        b: 255,
      };

      const black = {
        r: 0,
        g: 0,
        b: 0,
      };

      textColors = (r + g + b) / 3 > 200 ? black : white; //Because text color is not supported by Core

      backgroundColors = {
        r: groupEvent.getBackgroundColorR(),
        g: groupEvent.getBackgroundColorG(),
        b: groupEvent.getBackgroundColorB(),
      };

      text = gd.asGroupEvent(event).getName();
    } else {
      console.error(
        'Dialog was opened for an unsupported event type: ' + eventType
      );
    }

    //return state = this._getInitialStateFromEvent();
    this.setState({
      textValue: text,
      textColor: textColors,
      backgroundColor: backgroundColors,
    });
  };

  render() {
    const { event, onApply, onClose } = this.props;
    const eventType = event.getType();

    return (
      <Dialog
        title={<Trans>Edit the event text</Trans>}
        onRequestClose={onClose}
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
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/interface/scene-editor/layers-and-cameras"
          />,
        ]}
      >
        <Column noMargin>
          <MiniToolbar>
            <MiniToolbarText>
              <Trans />
            </MiniToolbarText>
            <MiniToolbarText>
              <Trans>Background color:</Trans>
            </MiniToolbarText>
            <ColorPicker
              style={styles.sizeTextField}
              disableAlpha
              color={this.state.backgroundColor}
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
                  color={this.state.textColor}
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
                  multiLine
                  rows={8}
                  rowsMax={8}
                  value={this.state.textValue}
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

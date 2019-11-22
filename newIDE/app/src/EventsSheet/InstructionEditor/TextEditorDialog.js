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
  event: any,
  onClose: () => void,
  onApply: () => void,
|};

type State = {|
  textValue: any,
  textColors: any,
  backgroundColors: any,
|};

export default class TextEditorDialog extends React.PureComponent<
  Props,
  State
> {
  setName = () => {
    const { event } = this.props;
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Group') {
      gd.asGroupEvent(event).setName(this.state.textValue);
    }
  };

  setComment = () => {
    const { event } = this.props;
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      gd.asCommentEvent(event).setComment(this.state.textValue);
    }
  };

  setTextColors = () => {
    const { event } = this.props;
    const { textColors } = this.state;
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      gd.asCommentEvent(event).setTextColor(
        parseInt(textColors.red),
        parseInt(textColors.green),
        parseInt(textColors.blue)
      );
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      //Text color for group not supported in Core, instead GroupEvent.js handle this
      return;
    }
  };

  setBackgroundColors = () => {
    const { event } = this.props;
    const { backgroundColors } = this.state;
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      gd.asCommentEvent(event).setBackgroundColor(
        parseInt(backgroundColors.red),
        parseInt(backgroundColors.green),
        parseInt(backgroundColors.blue)
      );
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      gd.asGroupEvent(event).setBackgroundColor(
        parseInt(backgroundColors.red),
        parseInt(backgroundColors.green),
        parseInt(backgroundColors.blue)
      );
    }
  };

  getComment = () => {
    const { event } = this.props;
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      return gd.asCommentEvent(event).getComment();
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      return gd.asGroupEvent(event).getName();
    } else {
      console.error(
        'Dialog was opened for an unsupported event type: ' + eventType
      );
      return '';
    }
  };

  getTextColors = () => {
    const { event } = this.props;
    const eventType = event.getType();
    let textColors;

    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentEvent = gd.asCommentEvent(event);
      textColors = {
        red: commentEvent.getTextColorRed(),
        green: commentEvent.getTextColorGreen(),
        blue: commentEvent.getTextColorBlue(),
      };
      return textColors;
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      var groupEvent = gd.asGroupEvent(event);
      const r = groupEvent.getBackgroundColorR(),
        g = groupEvent.getBackgroundColorG(),
        b = groupEvent.getBackgroundColorB();

      textColors = (r + g + b) / 3 > 200 ? 'black' : 'white'; //Because text color is not supported by Core
      return textColors;
    } else {
      console.error('Dialog was opened for an unsupported event text color.');
      return '';
    }
  };

  getBackgroundColors = () => {
    const { event } = this.props;
    const eventType = event.getType();
    let backgroundColors;

    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentEvent = gd.asCommentEvent(event);
      backgroundColors = {
        red: commentEvent.getBackgroundColorRed(),
        green: commentEvent.getBackgroundColorGreen(),
        blue: commentEvent.getBackgroundColorBlue(),
      };

      return backgroundColors;
    } else if (eventType === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(event);
      backgroundColors = {
        red: groupEvent.getBackgroundColorR(),
        green: groupEvent.getBackgroundColorG(),
        blue: groupEvent.getBackgroundColorB(),
      };

      return backgroundColors;
    } else {
      console.error(
        'Dialog was opened for an unsupported event background color'
      );
      return '';
    }
  };

  state = {
    textValue: this.getComment(),
    textColors: this.getTextColors(),
    backgroundColors: this.getBackgroundColors(),
  };

  render() {
    const { event, onApply, onClose } = this.props;
    const eventType = event.getType();

    return (
      <Dialog
        title={<Trans>Text editor</Trans>}
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
              if (eventType === 'BuiltinCommonInstructions::Comment') {
                this.setComment();
              } else if (eventType === 'BuiltinCommonInstructions::Group') {
                this.setName();
              }
              this.setTextColors();
              this.setBackgroundColors();

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
              color={{
                r: this.state.backgroundColors.red,
                g: this.state.backgroundColors.green,
                b: this.state.backgroundColors.blue,
                a: 255,
              }}
              onChangeComplete={color => {
                this.setState({
                  backgroundColors: {
                    red: color.rgb.r,
                    green: color.rgb.g,
                    blue: color.rgb.b,
                  },
                });

                this.forceUpdate();
              }}
            />

            {eventType !== 'BuiltinCommonInstructions::Group' && (
              <React.Fragment>
                <MiniToolbarText>
                  <Trans>Text color:</Trans>
                </MiniToolbarText>
                <ColorPicker
                  style={styles.sizeTextField}
                  disableAlpha
                  color={{
                    r: this.state.textColors.red,
                    g: this.state.textColors.green,
                    b: this.state.textColors.blue,
                    a: 255,
                  }}
                  onChangeComplete={color => {
                    this.setState({
                      textColors: {
                        red: color.rgb.r,
                        green: color.rgb.g,
                        blue: color.rgb.b,
                      },
                    });

                    this.forceUpdate();
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
                  rows={100}
                  rowsMax={100}
                  value={this.state.textValue}
                  onChange={value => {
                    this.setState({
                      textValue: value,
                    });
                    this.forceUpdate();
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

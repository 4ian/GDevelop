// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
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

const EventTextDialog = (props: Props) => {
  const { event, onClose } = props;

  const [textValue, setTextValue] = React.useState<string>('');
  const [textColor, setTextColor] = React.useState<RGBColor>(black);
  const [backgroundColor, setBackgroundColor] = React.useState<RGBColor>(black);

  const eventType = event.getType();

  React.useEffect(
    () => {
      if (eventType === 'BuiltinCommonInstructions::Comment') {
        const commentEvent = gd.asCommentEvent(event);

        setTextColor({
          r: commentEvent.getTextColorRed(),
          g: commentEvent.getTextColorGreen(),
          b: commentEvent.getTextColorBlue(),
        });

        setBackgroundColor({
          r: commentEvent.getBackgroundColorRed(),
          g: commentEvent.getBackgroundColorGreen(),
          b: commentEvent.getBackgroundColorBlue(),
        });

        setTextValue(gd.asCommentEvent(event).getComment());
      } else if (eventType === 'BuiltinCommonInstructions::Group') {
        var groupEvent = gd.asGroupEvent(event);
        const r = groupEvent.getBackgroundColorR(),
          g = groupEvent.getBackgroundColorG(),
          b = groupEvent.getBackgroundColorB();

        // Text color is automatically chosen for groups.
        setTextColor(() => {
          return (r + g + b) / 3 > 200 ? black : white;
        });

        setBackgroundColor({
          r: groupEvent.getBackgroundColorR(),
          g: groupEvent.getBackgroundColorG(),
          b: groupEvent.getBackgroundColorB(),
        });

        setTextValue(gd.asGroupEvent(event).getName());
      } else {
        console.error(
          'Dialog was opened for an unsupported event type: ' + eventType
        );
      }
    },
    [event, eventType]
  );

  const onApply = React.useCallback(
    () => {
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
      }
      props.onApply();
      return;
    },
    [props, event, eventType, textValue, textColor, backgroundColor]
  );

  return (
    <Dialog
      title={
        eventType === 'BuiltinCommonInstructions::Comment' ? (
          <Trans>Edit comment</Trans>
        ) : (
          <Trans>Edit group</Trans>
        )
      }
      open
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key={'Apply'}
          label={<Trans>Apply</Trans>}
          primary
          onClick={onApply}
        />,
      ]}
      onRequestClose={onClose}
      onApply={onApply}
    >
      <Column noMargin>
        <MiniToolbar noPadding>
          <MiniToolbarText firstChild>
            <Trans>Background color:</Trans>
          </MiniToolbarText>
          <ColorPicker
            style={styles.sizeTextField}
            disableAlpha
            color={backgroundColor}
            onChangeComplete={color => {
              setBackgroundColor(color.rgb);
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
                  setTextColor(color.rgb);
                }}
              />
            </React.Fragment>
          )}
        </MiniToolbar>
        <Line noMargin>
          <Column expand noMargin>
            <Line>
              <SemiControlledTextField
                commitOnBlur
                translatableHintText={t`Enter the text to be displayed`}
                fullWidth
                multiline
                rows={8}
                rowsMax={30}
                value={textValue}
                onChange={value => {
                  setTextValue(value);
                }}
              />
            </Line>
          </Column>
        </Line>
      </Column>
    </Dialog>
  );
};

export default EventTextDialog;

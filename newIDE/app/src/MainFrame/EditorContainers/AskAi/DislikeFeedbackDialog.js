// @flow
import * as React from 'react';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FlatButton from '../../../UI/FlatButton';

type DislikeFeedbackDialogProps = {|
  open: boolean,
  onClose: () => void,
  onSendFeedback: (reason: string) => void,
|};

export const DislikeFeedbackDialog = ({
  open,
  onClose,
  onSendFeedback,
}: DislikeFeedbackDialogProps) => {
  const [selectedReason, setSelectedReason] = React.useState<?string>(null);

  const handleChange = (event: { target: { value: string } }) => {
    setSelectedReason(event.target.value);
  };

  const handleSendFeedback = () => {
    if (selectedReason) {
      onSendFeedback(selectedReason);
      onClose();
    }
  };

  return (
    <Dialog
      title={<Trans>What could be improved?</Trans>}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          key="send"
          primary
          label={<Trans>Send feedback</Trans>}
          onClick={handleSendFeedback}
          disabled={!selectedReason}
        />,
      ]}
      open={open}
      onRequestClose={onClose}
      maxWidth="sm"
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            Help us improve by telling us what was wrong with the answer:
          </Trans>
        </Text>
        <RadioGroup value={selectedReason || ''} onChange={handleChange}>
          <FormControlLabel
            value="not-in-my-language"
            control={<Radio color="secondary" />}
            label={<Trans>The answer is not in my language</Trans>}
          />
          <FormControlLabel
            value="non-existing-things"
            control={<Radio color="secondary" />}
            label={
              <Trans>Some things in the answer don't exist in GDevelop</Trans>
            }
          />
          <FormControlLabel
            value="not-as-good-as-it-could-be"
            control={<Radio color="secondary" />}
            label={<Trans>The answer is not as good as it could be</Trans>}
          />
          <FormControlLabel
            value="very-wrong-answer"
            control={<Radio color="secondary" />}
            label={<Trans>The answer is entirely wrong</Trans>}
          />
          <FormControlLabel
            value="out-of-scope"
            control={<Radio color="secondary" />}
            label={<Trans>The answer is out of scope for GDevelop</Trans>}
          />
          <FormControlLabel
            value="other"
            control={<Radio color="secondary" />}
            label={<Trans>Other reason</Trans>}
          />
        </RadioGroup>
      </ColumnStackLayout>
    </Dialog>
  );
};

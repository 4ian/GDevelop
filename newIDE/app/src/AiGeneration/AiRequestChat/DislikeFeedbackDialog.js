// @flow
import * as React from 'react';
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FlatButton from '../../UI/FlatButton';
import { CompactTextAreaField } from '../../UI/CompactTextAreaField';

type DislikeFeedbackDialogProps = {|
  open: boolean,
  onClose: () => void,
  onSendFeedback: (reason: string, freeFormDetails: string) => void,
  mode: 'chat' | 'agent',
|};

export const DislikeFeedbackDialog = ({
  mode,
  open,
  onClose,
  onSendFeedback,
}: DislikeFeedbackDialogProps) => {
  const [selectedReason, setSelectedReason] = React.useState<?string>(null);
  const [freeFormDetails, setFreeFormDetails] = React.useState<string>('');

  const handleChange = (event: { target: { value: string } }) => {
    setSelectedReason(event.target.value);
  };

  const handleSendFeedback = () => {
    if (selectedReason) {
      onSendFeedback(selectedReason, freeFormDetails);
      onClose();
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={
            mode === 'agent' ? (
              <Trans>What went wrong?</Trans>
            ) : (
              <Trans>What could be improved?</Trans>
            )
          }
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
              {mode === 'agent' ? (
                <Trans>
                  The AI agent is in beta. Help us make it better by telling us
                  what went wrong:
                </Trans>
              ) : (
                <Trans>
                  Help us improve by telling us what could be improved:
                </Trans>
              )}
            </Text>
            <RadioGroup value={selectedReason || ''} onChange={handleChange}>
              {mode === 'agent' ? (
                <>
                  <FormControlLabel
                    value="not-as-good-as-it-could-be"
                    control={<Radio color="secondary" />}
                    label={
                      <Trans>
                        The result wasn't as good as it could have been
                      </Trans>
                    }
                  />
                  <FormControlLabel
                    value="too-little-work"
                    control={<Radio color="secondary" />}
                    label={<Trans>It didn't do enough</Trans>}
                  />
                  <FormControlLabel
                    value="does-not-work"
                    control={<Radio color="secondary" />}
                    label={<Trans>It didn't work at all</Trans>}
                  />
                  <FormControlLabel
                    value="too-much-modified-or-broken"
                    control={<Radio color="secondary" />}
                    label={
                      <Trans>Too many things were changed or broken</Trans>
                    }
                  />
                </>
              ) : (
                <>
                  <FormControlLabel
                    value="not-in-my-language"
                    control={<Radio color="secondary" />}
                    label={<Trans>The answer is not in my language</Trans>}
                  />
                  <FormControlLabel
                    value="non-existing-things"
                    control={<Radio color="secondary" />}
                    label={
                      <Trans>
                        Some things in the answer don't exist in GDevelop
                      </Trans>
                    }
                  />
                  <FormControlLabel
                    value="not-as-good-as-it-could-be"
                    control={<Radio color="secondary" />}
                    label={
                      <Trans>The answer is not as good as it could be</Trans>
                    }
                  />
                  <FormControlLabel
                    value="very-wrong-answer"
                    control={<Radio color="secondary" />}
                    label={<Trans>The answer is entirely wrong</Trans>}
                  />
                  <FormControlLabel
                    value="out-of-scope"
                    control={<Radio color="secondary" />}
                    label={
                      <Trans>The answer is out of scope for GDevelop</Trans>
                    }
                  />
                  <FormControlLabel
                    value="too-short"
                    control={<Radio color="secondary" />}
                    label={<Trans>The answer is too short</Trans>}
                  />
                  <FormControlLabel
                    value="too-long"
                    control={<Radio color="secondary" />}
                    label={<Trans>The answer is too long</Trans>}
                  />
                </>
              )}
              <FormControlLabel
                value="other"
                control={<Radio color="secondary" />}
                label={<Trans>Other reason</Trans>}
              />
            </RadioGroup>
            <CompactTextAreaField
              label={i18n._(t`More details (optional)`)}
              value={freeFormDetails}
              onChange={value => setFreeFormDetails(value)}
              rows={5}
              maxLength={10000}
            />
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

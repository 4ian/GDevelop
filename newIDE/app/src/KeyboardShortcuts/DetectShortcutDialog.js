// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { getShortcutMetadataFromEvent, getShortcutDisplayName } from './index';

const styles = {
  shortcutBox: {
    padding: 15,
    textAlign: 'center',
  },
};

type Props = {|
  commandText: ?string,
  onSet: (shortcut: string) => void,
  onClose: () => void,
|};

const DetectShortcutDialog = (props: Props) => {
  const [shortcutString, setShortcutString] = React.useState('');
  const [isValid, setIsValid] = React.useState(false);

  const onApply = () => {
    if (!isValid) return;
    shortcutString && props.onSet(shortcutString);
    props.onClose();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const metadata = getShortcutMetadataFromEvent(e);
      if (e.type === 'keyup') return;
      setIsValid(metadata.isValid);
      setShortcutString(metadata.shortcutString);
    };
    document.addEventListener('keyup', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.removeEventListener('keyup', handler);
    };
  }, []);

  return (
    <Dialog
      open
      title={<Trans>Set shortcut</Trans>}
      maxWidth="xs"
      actions={[
        <FlatButton
          key="Cancel"
          label={<Trans>Cancel</Trans>}
          onClick={props.onClose}
        />,
        <FlatButton
          label={<Trans>Set shortcut</Trans>}
          primary
          key="Set"
          onClick={onApply}
          disabled={!isValid}
        />,
      ]}
      secondaryActions={[
        <FlatButton
          key="Remove"
          label={<Trans>Remove shortcut</Trans>}
          onClick={() => {
            props.onSet('');
            props.onClose();
          }}
        />,
      ]}
      onRequestClose={props.onClose}
      onApply={onApply}
    >
      <Typography>{props.commandText}</Typography>
      <Paper variant="outlined" style={styles.shortcutBox}>
        <Typography>
          {shortcutString ? (
            getShortcutDisplayName(shortcutString)
          ) : (
            <Trans>Press a shortcut combination...</Trans>
          )}
        </Typography>
      </Paper>
    </Dialog>
  );
};

export default DetectShortcutDialog;

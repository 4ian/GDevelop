// @flow
import * as React from 'react';
import { Trans, Plural } from '@lingui/macro';
import Popover from '@material-ui/core/Popover';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import StatusChip from '../UI/StatusChip';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import WarningFilled from '../UI/CustomSvgIcons/WarningFilled';
import Sparkle from '../UI/CustomSvgIcons/Sparkle';
import {
  type InGameEditorExtensionError,
  getInGameEditorExtensionErrorOrigin,
} from '.';
import classes from './InGameEditorExtensionErrorsIndicator.module.css';

type Props = {|
  errors: Array<InGameEditorExtensionError>,
  isFromStore: (error: InGameEditorExtensionError) => boolean,
  onAskAiToFix: () => void,
  onDismiss: () => void,
|};

/**
 * A discreet chip counting the errors thrown by the code of extensions in the
 * in-game editor, opening their details.
 */
const InGameEditorExtensionErrorsIndicator = ({
  errors,
  isFromStore,
  onAskAiToFix,
  onDismiss,
}: Props): React.Node => {
  const [anchorElement, setAnchorElement] = React.useState<?HTMLElement>(null);
  if (errors.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={classes.trigger}
        onClick={event => setAnchorElement(event.currentTarget)}
      >
        <StatusChip
          tone="warning"
          icon={<WarningFilled />}
          label={
            <Plural
              value={errors.length}
              one="# extension error"
              other="# extension errors"
            />
          }
        />
      </button>
      <Popover
        open={!!anchorElement}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ style: { borderRadius: 10, marginTop: -8 } }}
      >
        <Paper background="light">
          <div className={classes.content}>
            <ColumnStackLayout noMargin>
              <Text size="block-title" noMargin>
                <Trans>Errors in the code of extensions</Trans>
              </Text>
              <Text size="body-small" color="secondary" noMargin>
                <Trans>
                  The scene editor kept working, but the code of these
                  extensions threw errors while displaying the scene.
                </Trans>
              </Text>
              <div className={classes.errors}>
                {errors.map(error => (
                  <div key={error.id} className={classes.error}>
                    <LineStackLayout noMargin alignItems="center">
                      <Text size="sub-title" noMargin>
                        {error.extensionName || (
                          <Trans>Unknown extension</Trans>
                        )}
                      </Text>
                      {isFromStore(error) && (
                        <StatusChip
                          size="small"
                          label={<Trans>Store extension (read-only)</Trans>}
                        />
                      )}
                    </LineStackLayout>
                    <Text size="body-small" color="secondary" noMargin>
                      {getInGameEditorExtensionErrorOrigin(error)} ·{' '}
                      <Plural
                        value={error.count}
                        one="# time"
                        other="# times"
                      />
                    </Text>
                    <code className={classes.message}>{error.message}</code>
                  </div>
                ))}
              </div>
              <LineStackLayout noMargin justifyContent="flex-end">
                <FlatButton
                  label={<Trans>Dismiss</Trans>}
                  onClick={() => {
                    setAnchorElement(null);
                    onDismiss();
                  }}
                />
                <RaisedButton
                  color="ai"
                  icon={<Sparkle />}
                  label={<Trans>Ask the AI to fix</Trans>}
                  onClick={() => {
                    setAnchorElement(null);
                    onAskAiToFix();
                  }}
                />
              </LineStackLayout>
            </ColumnStackLayout>
          </div>
        </Paper>
      </Popover>
    </>
  );
};

export default InGameEditorExtensionErrorsIndicator;

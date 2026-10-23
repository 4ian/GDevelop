// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Popover from '@material-ui/core/Popover';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import StatusChip from '../UI/StatusChip';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import WarningFilled from '../UI/CustomSvgIcons/WarningFilled';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { isWindows } from '../Utils/Platform';
import optionalRequire from '../Utils/OptionalRequire';
import {
  type SlowGraphicsRenderingReason,
  useSlowGraphicsRenderingReason,
} from '.';
import classes from './SlowGraphicsRenderingIndicator.module.css';
const electron = optionalRequire('electron');

const SoftwareRenderingExplanation = (): React.Node => (
  <>
    <Text size="body-small" noMargin>
      <Trans>
        Graphics acceleration is unavailable: the scene is drawn by the
        processor instead of the graphics card, which is a lot slower and keeps
        the processor busy.
      </Trans>
    </Text>
    <Text size="body-small" noMargin>
      {electron ? (
        <Trans>
          Updating the drivers of your graphics card, then restarting your
          computer, can solve this.
        </Trans>
      ) : (
        <Trans>
          Check that graphics acceleration is enabled in the settings of your
          browser (in Chrome: "Use graphics acceleration when available"), then
          restart it. Updating the drivers of your graphics card can also solve
          this.
        </Trans>
      )}
    </Text>
  </>
);

const IntegratedGraphicsCardExplanation = (): React.Node => (
  <>
    <Text size="body-small" noMargin>
      <Trans>
        GDevelop is using the graphics card integrated in the processor, while a
        more powerful one is installed on this computer.
      </Trans>
    </Text>
    <Text size="body-small" noMargin>
      {isWindows() ? (
        <Trans>
          In the Windows settings (System &gt; Display &gt; Graphics), choose
          "High performance" for GDevelop, then restart GDevelop.
        </Trans>
      ) : (
        <Trans>
          In the settings of your system or of your graphics card, choose the
          high performance graphics card for GDevelop, then restart GDevelop.
        </Trans>
      )}
    </Text>
  </>
);

type Props = {|
  /** Only for stories: the reason is otherwise detected on this computer. */
  mockedSlowGraphicsRenderingReason?: SlowGraphicsRenderingReason,
|};

/**
 * A discreet chip shown when the 3D rendering is a lot slower than it could
 * be on this computer, opening how to fix it.
 */
const SlowGraphicsRenderingIndicator = ({
  mockedSlowGraphicsRenderingReason,
}: Props): React.Node => {
  const detectedSlowGraphicsRenderingReason = useSlowGraphicsRenderingReason();
  const slowGraphicsRenderingReason =
    mockedSlowGraphicsRenderingReason || detectedSlowGraphicsRenderingReason;
  const { values, showAlertMessage } = React.useContext(PreferencesContext);
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [anchorElement, setAnchorElement] = React.useState<?HTMLElement>(null);
  if (
    !slowGraphicsRenderingReason ||
    isDismissed ||
    values.hiddenAlertMessages['slow-graphics-rendering']
  )
    return null;

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
          label={<Trans>Slow graphics</Trans>}
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
                <Trans>The graphics card is not used at its best</Trans>
              </Text>
              {slowGraphicsRenderingReason === 'software-rendering' ? (
                <SoftwareRenderingExplanation />
              ) : (
                <IntegratedGraphicsCardExplanation />
              )}
              <LineStackLayout noMargin justifyContent="flex-end">
                <FlatButton
                  label={<Trans>Don't show again</Trans>}
                  onClick={() => {
                    setAnchorElement(null);
                    showAlertMessage('slow-graphics-rendering', false);
                  }}
                />
                <RaisedButton
                  primary
                  label={<Trans>Dismiss</Trans>}
                  onClick={() => {
                    setAnchorElement(null);
                    setIsDismissed(true);
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

export default SlowGraphicsRenderingIndicator;

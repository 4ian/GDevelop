// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import TextField from '../../UI/TextField';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import Copy from '../../UI/CustomSvgIcons/Copy';
import Share from '@material-ui/icons/Share';
import InfoBar from '../../UI/Messages/InfoBar';
import IconButton from '../../UI/IconButton';
import { LinearProgress } from '@material-ui/core';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  RedditIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';

const styles = {
  icon: {
    padding: 5,
  },
};

export const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text align="center">
        <Trans>
          Generate a unique link to share your game, for a few days, playable
          from any computer or mobile phone's browser.
        </Trans>
      </Text>
    </Line>
  </Column>
);

type WebProjectLinkProps = {|
  build: ?Build,
  loading: boolean,
|};

export const WebProjectLink = ({ build, loading }: WebProjectLinkProps) => {
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState<boolean>(
    false
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState<boolean>(
    false
  );

  if (!build && !loading) return null;
  const buildPending = loading || (build && build.status !== 'complete');
  const buildUrl = buildPending ? null : getBuildArtifactUrl(build, 's3Key');

  const onOpen = () => {
    if (buildPending || !buildUrl) return;
    Window.openExternalURL(buildUrl);
  };

  const onCopy = () => {
    if (buildPending || !buildUrl) return;
    // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
    navigator.clipboard.writeText(buildUrl);
    setShowCopiedInfoBar(true);
  };

  const onShare = async () => {
    if (buildPending || !buildUrl) return;

    if (!navigator.share) {
      // We are on desktop (or do not support sharing using the system dialog).
      setIsShareDialogOpen(true);
      return;
    }

    // We are on mobile (or on browsers supporting sharing using the system dialog).
    const shareData = {
      title: 'My GDevelop game',
      text: 'Try the game I just created with #gdevelop',
      url: buildUrl,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Couldn't share the game", err);
    }
  };

  return (
    <>
      {buildPending ? (
        <>
          <Text>
            <Trans>Just a few seconds while we generate the link...</Trans>
          </Text>
          <LinearProgress />
        </>
      ) : (
        <Line justifyContent="center">
          <FlatButton
            label={<Trans>Share</Trans>}
            onClick={onShare}
            icon={<Share />}
          />
          <Spacer />
          <RaisedButton label={<Trans>Open</Trans>} onClick={onOpen} primary />
        </Line>
      )}
      <Dialog
        title={<Trans>Share your game</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Back</Trans>}
            primary={false}
            onClick={() => setIsShareDialogOpen(false)}
          />,
        ]}
        open={isShareDialogOpen}
        onRequestClose={() => setIsShareDialogOpen(false)}
      >
        {buildUrl && (
          <Column>
            <TextField
              value={buildUrl}
              readOnly
              fullWidth
              endAdornment={
                <IconButton onClick={onCopy} tooltip={t`Copy`} edge="end">
                  <Copy />
                </IconButton>
              }
            />
            <Line justifyContent="flex-end">
              <FacebookShareButton
                url={`Try the game I just created with #gdevelop: ${buildUrl}`}
                style={styles.icon}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <RedditShareButton
                url={`Try the game I just created with r/gdevelop: ${buildUrl}`}
                style={styles.icon}
              >
                <RedditIcon size={32} round />
              </RedditShareButton>
              <TwitterShareButton
                url={`Try the game I just created with #gdevelop: ${buildUrl}`}
                style={styles.icon}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <WhatsappShareButton
                url={`Try the game I just created with gdevelop.io: ${buildUrl}`}
                style={styles.icon}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <EmailShareButton
                url={`Try the game I just created with gdevelop.io: ${buildUrl}`}
                style={styles.icon}
              >
                <EmailIcon size={32} round />
              </EmailShareButton>
            </Line>
          </Column>
        )}
        <InfoBar
          message={<Trans>Copied to clipboard!</Trans>}
          visible={showCopiedInfoBar}
          hide={() => setShowCopiedInfoBar(false)}
        />
      </Dialog>
    </>
  );
};

export const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web (upload online)</Trans>,
  helpPage: '/publishing/web',
};

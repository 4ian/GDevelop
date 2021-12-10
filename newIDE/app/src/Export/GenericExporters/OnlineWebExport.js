// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import TextField from '../../UI/TextField';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import RaisedButton from '../../UI/RaisedButton';
import Window from '../../Utils/Window';
import Paste from '../../UI/CustomSvgIcons/Paste';
import InfoBar from '../../UI/Messages/InfoBar';

export const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text align="center">
        <Trans>
          Generate a unique link to share your game, for a few days, playable
          from any computer browser or mobile phone.
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

  if (!build && !loading) return null;
  const buildPending = loading || (build && build.status !== 'complete');

  const value = buildPending
    ? 'Just a few seconds while we generate the link...'
    : getBuildArtifactUrl(build, 's3Key') || '';

  const onOpen = () => {
    if (buildPending) return;
    Window.openExternalURL(value);
  };

  const onCopy = () => {
    if (buildPending) return;
    // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
    navigator.clipboard.writeText(value);
    setShowCopiedInfoBar(true);
  };

  return (
    <Line justifyContent="center">
      <TextField value={value} readOnly fullWidth />
      {!buildPending && (
        <>
          <RaisedButton label={<Trans>Open</Trans>} onClick={onOpen} />
          <RaisedButton primary icon={<Paste />} onClick={onCopy} />
        </>
      )}
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </Line>
  );
};

export const onlineWebExporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: <Trans>Web (upload online)</Trans>,
  helpPage: '/publishing/web',
  description: (
    <Trans>
      Upload your game online directly from GDevelop and share the link to
      players. Play to your game using your browser on computers and mobile
      phones.
    </Trans>
  ),
};

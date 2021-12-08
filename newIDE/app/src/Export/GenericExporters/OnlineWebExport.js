// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import TextField from '../../UI/TextField';
import {
  getBuildArtifactUrl,
  type Build,
} from '../../Utils/GDevelopServices/Build';

const styles = {
  icon: {
    height: 48,
    width: 48,
  },
};

export const ExplanationHeader = () => (
  <Column noMargin alignItems="center" justifyContent="center">
    <Line>
      <Text>
        <Trans>
          Generate a unique link to share your game, for a few days, playable
          from any computer browser or mobile phone
        </Trans>
      </Text>
    </Line>
    <Line>
      <PeopleOutline style={{ ...styles.icon }} />
    </Line>
  </Column>
);

type WebProjectLinkProps = {|
  build: ?Build,
  loading: boolean,
|};

export const WebProjectLink = ({ build, loading }: WebProjectLinkProps) => {
  console.log(build, loading);
  const value = loading
    ? 'Just a few seconds...'
    : build
    ? getBuildArtifactUrl(build, 's3Key') || ''
    : '';
  // if (url) Window.openExternalURL(url);

  return (
    <Line justifyContent="center">
      <TextField value={value} readOnly fullWidth />
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

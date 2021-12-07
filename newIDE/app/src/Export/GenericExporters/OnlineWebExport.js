// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import { type RenderIconProps } from '../ExportDialog';

export const ExplanationHeader = () => (
  <Text>
    <Trans>
      This will export your game and upload it on GDevelop games hosting. The
      game will be freely accessible from the link, available for a few days and
      playable from any computer browser or mobile phone (iOS, Android 5+).
    </Trans>
  </Text>
);

export const onlineWebExporter = {
  name: <Trans>Web (upload online)</Trans>,
  renderIcon: (props: RenderIconProps) => <Chrome {...props} />,
  helpPage: '/publishing/web',
  description: (
    <Trans>
      Upload your game online directly from GDevelop and share the link to
      players. Play to your game using your browser on computers and mobile
      phones.
    </Trans>
  ),
};

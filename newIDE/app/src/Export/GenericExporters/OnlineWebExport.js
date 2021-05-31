// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';

export const ExplanationHeader = (): React.Node => (
  <Text>
    <Trans>
      This will export your game and upload it on GDevelop games hosting. The
      game will be freely accessible from the link, available for a few days and
      playable from any computer browser or mobile phone (iOS, Android 5+).
    </Trans>
  </Text>
);

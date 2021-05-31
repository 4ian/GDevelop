// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';

export const ExplanationHeader = (): React.Node => (
  <Text>
    <Trans>
      Packaging your game for Android will create an APK file that can be
      installed on Android phones or published to the Play Store.
    </Trans>
  </Text>
);

// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

/**
 * Maps a build error `code` (detected by the backend when analyzing the build
 * log) to a human-readable, translatable message shown to the user.
 */
export const buildDetectedErrorsConfig: {
  [code: string]: {| message: React.Node |},
} = {
  'ios-app-icon-wrong-size': {
    message: (
      <Trans>
        Your app icon couldn't be used because it doesn't have the right size.
        The app icon must be a square image (for example 1024×1024 pixels) with
        no transparency. Update your game's icon and start a new build.
      </Trans>
    ),
  },
};

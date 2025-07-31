// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

export const formatDurationOfRedemptionCode = (
  durationInDays: number
): React.Node => {
  if (durationInDays < 30) {
    return <Trans>{durationInDays} days</Trans>;
  }
  const roundedMonths = Math.round(durationInDays / 30);
  if (roundedMonths === 1) {
    return <Trans>1 month</Trans>;
  }
  return <Trans>{roundedMonths} months</Trans>;
};

// @flow
import * as React from 'react';
import { dropIndicator, cantDropIndicator } from './ClassNames';

/**
 * A Drop indicator line for the events sheet
 */
// $FlowFixMe[signature-verification-failure]
export default function DropIndicator({ canDrop }: {| canDrop: boolean |}) {
  return <div className={canDrop ? dropIndicator : cantDropIndicator} />;
}

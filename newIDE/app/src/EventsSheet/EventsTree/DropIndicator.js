// @flow
import * as React from 'react';
import { dropIndicator, cantDropIndicator } from './ClassNames';

/**
 * A Drop indicator line for the events sheet
 */
export default function DropIndicator({
  canDrop,
}: {|
  canDrop: boolean,
|}): React.MixedElement {
  return <div className={canDrop ? dropIndicator : cantDropIndicator} />;
}

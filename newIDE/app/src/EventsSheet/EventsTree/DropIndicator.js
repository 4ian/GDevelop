// @flow
import * as React from 'react';
import { dropIndicator, cantDropIndicator } from './ClassNames';

export default function DropIndicator({ canDrop }: {| canDrop: boolean |}) {
  return <div className={canDrop ? dropIndicator : cantDropIndicator} />;
}

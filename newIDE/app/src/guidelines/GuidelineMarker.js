// @flow
import React from 'react';

type Props = {|
  children: React.Node,
|};

//TODO 
//Avoir un ref sur mon composant, s'en servir pour positionné le Popper

const GuidelineMarker = ({ identifier, children }: Props) => (
  <div className={'guideline-' + identifier} >{children}</div>
);

export default GuidelineMarker;
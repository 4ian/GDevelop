// @flow
import React from 'react';

type Props = {|
  children: React.DOM,
  identifier: string,
|};

const GuidelineMarker = ({ identifier, children }: Props) => (
  <div className={'guideline-' + identifier} >{children}</div>
);

export default GuidelineMarker;
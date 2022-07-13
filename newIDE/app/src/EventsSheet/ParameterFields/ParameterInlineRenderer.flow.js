// @flow
import * as React from 'react';

export type InvalidParameterValueProps = {|
  children: React.Node,
  isEmpty?: boolean,
|};

/**
 * The props expected by a function that renders a parameter in the events sheet
 */
export type ParameterInlineRendererProps = {|
  parameterMetadata: gdParameterMetadata,
  value: string,
  expressionIsValid: boolean,
  renderObjectThumbnail: string => React.Node,
  InvalidParameterValue: InvalidParameterValueProps => React.Node,
  MissingParameterValue: () => React.Node,
  useAssignmentOperators: boolean,
|};

/**
 * The type of a function that renders a parameter in the events sheet
 */
export type ParameterInlineRenderer = ParameterInlineRendererProps => React.Node;

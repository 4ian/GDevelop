// @flow

export type InvalidParameterValueProps = {|
  children: React.Node,
  isEmpty?: boolean,
|};

/**
 * The props expected by a function that renders a parameter in the events sheet
 */
export type ParameterInlineRendererProps = {|
  type: string,
  value: string,
  renderObjectThumbnail: string => React.Node,
  InvalidParameterValue: InvalidParameterValueProps => React.Node,
|};

/**
 * The type of a function that renders a parameter in the events sheet
 */
export type ParameterInlineRenderer = ParameterInlineRendererProps => React.Node;

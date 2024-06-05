// @flow
import * as React from 'react';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope.flow';

export type InvalidParameterValueProps = {|
  children: React.Node,
  isEmpty?: boolean,
|};

/**
 * The props expected by a function that renders a parameter in the events sheet
 */
export type ParameterInlineRendererProps = {|
  scope: EventsScope,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
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

// @flow
import * as React from 'react';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type RuntimeVariablesMap } from '../RuntimeVariablesContext';

export type InvalidParameterValueProps = {|
  children: React.Node,
  isEmpty?: boolean,
|};

export type DeprecatedParameterValueProps = {|
  children: React.Node,
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
  hasDeprecationWarning: boolean,
  renderObjectThumbnail: string => React.Node,
  InvalidParameterValue: InvalidParameterValueProps => React.Node,
  DeprecatedParameterValue: DeprecatedParameterValueProps => React.Node,
  MissingParameterValue: () => React.Node,
  useAssignmentOperators: boolean,
  highlightedSearchText?: ?string,
  highlightedSearchMatchCase?: boolean,
  runtimeVariables?: ?RuntimeVariablesMap,
  // Name of the most recent `object`-typed parameter preceding this one
  // in the same instruction (if any). Used by `objectvar` tooltips to
  // resolve the `<object>.<variable>` runtime value at pause time.
  lastObjectName?: ?string,
|};

/**
 * The type of a function that renders a parameter in the events sheet
 */
export type ParameterInlineRenderer = ParameterInlineRendererProps => React.Node;

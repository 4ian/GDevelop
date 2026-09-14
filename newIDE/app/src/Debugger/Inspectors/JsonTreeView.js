// @flow
import * as React from 'react';
import InspectorTreeView from './InspectorTreeView';

type Props = {
  src: any,
  missingValueLabel?: React.Node,
  // The other props of `react-json-view` (theme, collapsed...) are accepted
  // and ignored, so that its former users keep working as they are.
  ...
};

/**
 * Shows any value as rows of the inspector. Kept as the name the inspectors
 * used for `react-json-view`: given a value that is not an object, that
 * library replaced its tree by an error node, while this shows the value.
 */
const JsonTreeView = ({ src, missingValueLabel }: Props): React.Node => (
  <InspectorTreeView src={src} missingValueLabel={missingValueLabel} />
);

export default JsonTreeView;

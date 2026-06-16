// @flow
import * as React from 'react';

export type SplitEditorToolbarProps = {|
  leadingToolbar: React.Node,
  trailingToolbar: React.Node,
|};

export const SplitEditorToolbar = ({
  leadingToolbar,
  trailingToolbar,
}: SplitEditorToolbarProps): React.Node => (
  <>
    {leadingToolbar}
    {trailingToolbar}
  </>
);

export const getSplitEditorToolbar = (
  editorToolbar: ?React.Node
): {| leadingToolbar: ?React.Node, trailingToolbar: ?React.Node |} => {
  if (
    React.isValidElement(editorToolbar) &&
    editorToolbar.type === SplitEditorToolbar
  ) {
    return {
      // $FlowFixMe[prop-missing] - React validates the element type above.
      leadingToolbar: editorToolbar.props.leadingToolbar,
      // $FlowFixMe[prop-missing] - React validates the element type above.
      trailingToolbar: editorToolbar.props.trailingToolbar,
    };
  }

  return {
    leadingToolbar: null,
    trailingToolbar: editorToolbar,
  };
};

// @flow
import * as React from 'react';

export type SplitEditorToolbarProps = {|
  navigationToolbar?: React.Node,
  leadingToolbar: React.Node,
  trailingToolbar: React.Node,
|};

export const SplitEditorToolbar = ({
  navigationToolbar,
  leadingToolbar,
  trailingToolbar,
}: SplitEditorToolbarProps): React.Node => (
  <>
    {navigationToolbar}
    {leadingToolbar}
    {trailingToolbar}
  </>
);

export const getSplitEditorToolbar = (
  editorToolbar: ?React.Node
): {|
  navigationToolbar: ?React.Node,
  leadingToolbar: ?React.Node,
  trailingToolbar: ?React.Node,
|} => {
  const editorElement: any = editorToolbar;
  if (
    React.isValidElement(editorToolbar) &&
    editorElement.type === SplitEditorToolbar
  ) {
    return {
      navigationToolbar: editorElement.props.navigationToolbar,
      leadingToolbar: editorElement.props.leadingToolbar,
      trailingToolbar: editorElement.props.trailingToolbar,
    };
  }

  return {
    navigationToolbar: null,
    leadingToolbar: null,
    trailingToolbar: editorToolbar,
  };
};

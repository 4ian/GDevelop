// @flow
import { t } from '@lingui/macro';
import * as React from 'react';

import IconButton from '../UI/IconButton';
import DoubleChevronArrowLeft from '../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import DoubleChevronArrowRight from '../UI/CustomSvgIcons/DoubleChevronArrowRight';
import {
  SplitEditorToolbar,
  getSplitEditorToolbar,
} from '../MainFrame/Toolbar/SplitEditorToolbar';

type Props = {|
  isFunctionsListCollapsed: () => boolean,
  onToggleFunctionsList: () => boolean,
|};

export const FunctionsListToggleButton: React.ComponentType<Props> = ({
  isFunctionsListCollapsed,
  onToggleFunctionsList,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsCollapsed(isFunctionsListCollapsed());
  }, [isFunctionsListCollapsed]);

  return (
    <IconButton
      id="toolbar-toggle-functions-list-button"
      size="small"
      color="default"
      aria-label={isCollapsed ? 'Show function list' : 'Hide function list'}
      tooltip={
        isCollapsed ? t`Show the function list` : t`Hide the function list`
      }
      onClick={() => setIsCollapsed(onToggleFunctionsList())}
    >
      {isCollapsed ? <DoubleChevronArrowRight /> : <DoubleChevronArrowLeft />}
    </IconButton>
  );
};

export const addFunctionsListToggleButtonToToolbar = (
  editorToolbar: ?React.Node,
  props: Props
): React.Node => {
  const { navigationToolbar, leadingToolbar, trailingToolbar } =
    getSplitEditorToolbar(editorToolbar);

  return (
    <SplitEditorToolbar
      navigationToolbar={
        <>
          <FunctionsListToggleButton {...props} />
          {navigationToolbar}
        </>
      }
      leadingToolbar={leadingToolbar}
      trailingToolbar={trailingToolbar}
    />
  );
};

export default FunctionsListToggleButton;

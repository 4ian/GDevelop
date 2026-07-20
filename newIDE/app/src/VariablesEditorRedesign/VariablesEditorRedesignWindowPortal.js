// @flow
import * as React from 'react';

import WindowPortal from '../UI/WindowPortal';
import VariablesEditorRedesignWindow, {
  REFERENCE_GEOMETRY,
} from './VariablesEditorRedesignWindow';

type Props = {|
  onClose: () => void,
  focusRequestId: number,
|};

/** Hosts the redesigned variables surface in its own browser/Electron window. */
const VariablesEditorRedesignWindowPortal = ({
  onClose,
  focusRequestId,
}: Props): React.Node => (
  <WindowPortal
    title="Variables in Scene: Game"
    initialWidth={REFERENCE_GEOMETRY.overview.width}
    initialHeight={REFERENCE_GEOMETRY.overview.height}
    onClose={onClose}
    onWindowReady={() => {}}
    focusRequestId={focusRequestId}
    renderContent={() => (
      <VariablesEditorRedesignWindow
        variant="overview"
        onCancel={onClose}
        onApply={onClose}
      />
    )}
  />
);

export default VariablesEditorRedesignWindowPortal;

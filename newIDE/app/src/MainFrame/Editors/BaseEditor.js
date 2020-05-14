// @flow
import * as React from 'react';
import { serializeToJSObject } from '../../Utils/Serializer';
import { rgbToHexNumber } from '../../Utils/ColorTransformer';

//TODO: try BaseEditor<Props,State>
export default class BaseEditor extends React.Component<*, *> {
  static defaultProps = {
    setToolbar: () => {},
  };

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  saveUiSettings = () => {
    // Implement in the editor, if needed.
  };

  shouldComponentUpdate(nextProps: *) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user. For editors that do special work when isActive
    // is set to false (for example to disable PIXI rendering), shouldComponentUpdate
    // should be overriden with a proper implementation.
    if (!nextProps.isActive) {
      return false;
    }

    return true;
  }

  updateToolbar() {
    console.warn('No toolbar defined for this editor');

    if (this.props.setToolbar) this.props.setToolbar(null);
  }
}

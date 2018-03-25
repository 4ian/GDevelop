// @flow
import * as React from 'react';
import { serializeToJSObject } from '../../Utils/Serializer';
import { rgbToHexNumber } from '../../Utils/ColorTransformer';

export default class BaseEditor extends React.Component<*,*> {
  static defaultProps = {
    setToolbar: () => {},
  };

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout() :?gdLayout {
    return null;
  }

  updateToolbar() {
    console.warn('No toolbar defined for this editor');

    if (this.props.setToolbar) this.props.setToolbar(null);
  }

  getSerializedElements() {
    throw new Error(
      'The editor has not implemented getSerializedElements to return what should be serialized'
    );
  }

  static getLayoutSerializedElements(layout: ?gdLayout) {
    if (!layout) return {};

    return {
      windowTitle: layout.getWindowDefaultTitle(),
      layers: serializeToJSObject(layout, 'serializeLayersTo'),
      backgroundColor:
        '' +
        rgbToHexNumber(
          layout.getBackgroundColorRed(),
          layout.getBackgroundColorGreen(),
          layout.getBackgroundColorBlue()
        ),
    };
  }
}

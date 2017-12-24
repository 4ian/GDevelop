import React, { Component } from 'react';
const gd = global.gd;

/**
 * Wrap the specified component so that it is able to modify a
 * copy of the serializable object passed as its props (with the prop name
 * being the one specified by propName) and then apply the changes (in which
 * case the original serializable object is modified) or cancel the changes
 * (in which case the original serializable object remains intact).
 */
export const withSerializableObject = (
  WrappedComponent,
  { newObjectCreator, propName, useProjectToUnserialize }
) => {
  return class extends Component {
    constructor(props) {
      super(props);

      this.state = {
        serializableObject: newObjectCreator(),
      };
      this._loadFrom(props[propName]);
    }

    componentWillUnmount() {
      this.state.serializableObject.delete();
    }

    componentWillReceiveProps(newProps) {
      if (
        (!this.props.open && newProps.open) ||
        (newProps.open && this.props[propName] !== newProps[propName])
      ) {
        this._loadFrom(newProps[propName]);
      }
    }

    _loadFrom(serializableObject) {
      if (!serializableObject) return;

      const serializedElement = new gd.SerializerElement();
      serializableObject.serializeTo(serializedElement);
      if (!useProjectToUnserialize) {
        this.state.serializableObject.unserializeFrom(serializedElement);
      } else {
        this.state.serializableObject.unserializeFrom(
          this.props.project,
          serializedElement
        );
      }
      serializedElement.delete();
    }

    _apply = () => {
      if (!this.props[propName]) return;

      const serializedElement = new gd.SerializerElement();
      this.state.serializableObject.serializeTo(serializedElement);
      if (!useProjectToUnserialize) {
        this.props[propName].unserializeFrom(serializedElement);
      } else {
        this.props[propName].unserializeFrom(
          this.props.project,
          serializedElement
        );
      }
      serializedElement.delete();

      if (this.props.onApply) this.props.onApply();
    };

    _cancel = () => {
      if (this.props.onCancel) this.props.onCancel();
    };

    render() {
      const props = this.props;

      return React.createElement(WrappedComponent, {
        ...props,
        [propName]: this.state.serializableObject,
        onCancel: this._cancel,
        onApply: this._apply,
      });
    }
  };
};

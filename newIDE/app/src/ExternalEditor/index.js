import Bridge from './Bridge.js';
import React, { Component } from 'react';
import Window from '../Utils/Window.js';
const gd = global.gd;

class ExternalEditor extends Component {
  constructor() {
    super();
    this.bridge = new Bridge();
    this.editorArguments = Window.getArguments();
    this.selectedEditor = this.editorArguments['editor'];
    this.editedElementName = this.editorArguments['edited-element-name'];
    this.isIntegrated = this.editorArguments['mode'] === 'integrated';
    this.lastShowCommandDate = 0;
    this.state = {
      loading: false,
    };

    if (this.bridge.isSupported()) {
      console.log('Connection to an external editor...');

      this.bridge.onReceive((command, payload, scope) => {
        if (command === 'update') {
          this._onUpdateReceived(payload, scope);
        } else if (command === 'setBounds') {
          if (this.isIntegrated) {
            Window.setBounds(
              payload.x,
              payload.y,
              payload.width,
              payload.height
            );
          }
        } else if (command === 'show') {
          this.lastShowCommandDate = Date.now();
          Window.show();
        } else if (command === 'hide') {
          if (this.isIntegrated) {
            Window.hide(payload && payload.forceHide);
          }
        }
      });
      this.bridge.onConnected(() => {
        this.requestUpdate('', true);
      });
      Window.onBlur(() => {
        if (this.isIntegrated) this._hideIfNotJustShown();
        this.sendUpdate();
      });
      Window.onFocus(() => {
        this.requestUpdate();
      });
      Window.onClose(() => {
        this.sendUpdate();
      });

      this.bridge.connectTo(this.editorArguments['server-port']);
    } else {
      console.warn('Connection to an external editor is not supported');
    }
  }

  _hideIfNotJustShown = () => {
    // Sometime, we'll receive the blur event AFTER
    // the external editor containing this editor
    // received the activate event from the system (wxActivateEvent in the case of
    // wxWidgets).
    // So we'll receive a show command THEN hide, which is not what we want
    // (we want to hide and then show again the editor if needed).
    if (Date.now() - this.lastShowCommandDate < 100) {
      console.info(
        'The editor is not hidden because it receive a `show` command less ' +
          'than 100ms ago.'
      );
      return;
    }

    Window.hide();
  };

  sendUpdate = () => {
    console.log('Sending update to server editor');
    if (this.state.loading) {
      console.warn('Already loading an update, abort send');
      return;
    }
    if (this.sendingUpdate) {
      console.warn('Already sending an update, abort send');
      return;
    }
    if (!this.editor) {
      console.error(
        'No children editor to use to get the updated edited element'
      );
      return;
    }

    this.sendingUpdate = true;
    const elements = this.editor.getSerializedElements();
    for (const scope in elements) {
      if (elements.hasOwnProperty(scope)) {
        this.bridge.send('update', elements[scope], scope);
      }
    }
    this.sendingUpdate = false;

    console.log('Update send done');
  };

  launchPreview = () => {
    this.sendUpdate();
    this.bridge.send('requestPreview', undefined);
  };

  editObject = object => {
    this.sendUpdate();
    this.bridge.send('editObject', object.getName());
  };

  /**
   * Request an update to the server. Note that if forcedUpdate is set to false,
   * the server may not send back an update (for example if nothing changed).
   */
  requestUpdate = (scope = '', forcedUpdate = false) => {
    const command = forcedUpdate ? 'requestForcedUpdate' : 'requestUpdate';
    this.bridge.send(command, undefined, scope);
  };

  _onUpdateReceived = (payload, scope) => {
    console.log('Received project update from server');
    if (scope !== '') {
      console.warn(`Not implemented: received ${scope} update from server`);
      return;
    }

    this.setState(
      {
        loading: true,
      },
      () =>
        setTimeout(() => {
          // Transform the payload into a gd.SerializerElement
          // Note that gd.Serializer.fromJSObject returns a new gd.SerializerElement object at every call
          if (this._serializedObject) this._serializedObject.delete();

          var t1 = performance.now();
          this._serializedObject = gd.Serializer.fromJSObject(payload);
          var t2 = performance.now();
          console.log(
            'Call to gd.Serializer.fromJSObject took ' +
              (t2 - t1) +
              ' milliseconds.'
          );

          this.editor.loadFullProject(this._serializedObject, () => {
            this._serializedObject.delete();
            this._serializedObject = null;
            this.setState({
              loading: false,
            });
          });
        }),
      10 // Let some time for the loader to be shown
    );
  };

  render() {
    return React.cloneElement(this.props.children, {
      loading: this.state.loading,
      ref: editor => this.editor = editor,
      requestUpdate: () => this.requestUpdate('', true),
      onPreview: this.launchPreview,
      onEditObject: this.editObject,
      selectedEditor: this.selectedEditor,
      editedElementName: this.editedElementName,
    });
  }
}

export default ExternalEditor;

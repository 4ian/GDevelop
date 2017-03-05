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
    this.state = {
      loading: false,
    }

		if (this.bridge.isSupported()) {
      console.log("Connection to an external editor...");

			this.bridge.onReceive((command, object, scope) => {
				if (command === "update") {
					this._onUpdateReceived(object, scope);
				} else if (command === "setBounds") {
					// Window.setBounds(
					// 	object.getChild('x').getValue().getInt(),
					// 	object.getChild('y').getValue().getInt(),
					// 	object.getChild('width').getValue().getInt(),
					// 	object.getChild('height').getValue().getInt()
					// );
				} else if (command === "show") {
					Window.show();
				} else if (command === "hide") {
					Window.hide();
				}
			});
			this.bridge.onConnected(() => {
				this.requestUpdate();
			})
      Window.onBlur(() => {
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
      console.warn("Connection to an external editor is not supported");
    }
  }

	sendUpdate = () => {
		console.log("Sending update to server editor");
		if (this.state.loading) {
			console.warn("Already loading an update, abort send");
			return;
		}
		if (this.sendingUpdate) {
			console.warn("Already sending an update, abort send");
			return;
		}
		if (!this.editor) {
			console.error("No children editor to use to get the updated edited element");
			return;
		}

		this.sendingUpdate = true;
		const serializedElement = new gd.SerializerElement();
		const scope = this.editor.getSerializedEditedElement(serializedElement);
		this.bridge.send('update', serializedElement, scope);
		serializedElement.delete();

		this.sendingUpdate = false;
		console.log("Update send done");
	}

  launchPreview = () => {
    this.bridge.send('requestPreview', undefined);
  }

  requestUpdate = (scope = "") => {
    this.setState({
      loading: true,
    }, () => {
			this.bridge.send("requestUpdate", undefined, scope)
    });
  }

	_onUpdateReceived = (serializedObject, scope) => {
		console.log("Received project update from server");
		if (scope === 'instances') {
			console.warn("Not implemented: received instances update from server");
			this.setState({
				loading: false,
			});
			return;
		}

		this.editor.loadFullProject(serializedObject, () => {
			this.setState({
				loading: false,
			});
		});
	}

  render() {
    return (
      React.cloneElement(this.props.children, {
        loading: this.state.loading,
				ref: (editor) => this.editor = editor,
				requestUpdate: this.requestUpdate,
        onPreview: this.launchPreview,
				selectedEditor: this.selectedEditor,
				editedElementName: this.editedElementName,
      })
    );
  }
}

export default ExternalEditor;

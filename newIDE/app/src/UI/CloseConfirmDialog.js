// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
const electron = optionalRequire('electron');

type Props = {|
  shouldPrompt: boolean,
|};

export default class CloseConfirmDialog extends React.Component<Props, *> {
  _delayElectronClose = true;

  componentDidMount() {
    this._setup(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.shouldPrompt !== this.props.shouldPrompt)
      this._setup(newProps);
  }

  _setup(props: Props) {
    if (Window.isDev()) return; // Don't prevent live-reload in development

    const { shouldPrompt } = props;
    const message =
      'Are you sure you want to quit GDevelop? Any unsaved changes will be lost.';

    if (electron) {
      window.onbeforeunload = e => {
        if (this._delayElectronClose && shouldPrompt) {
          //eslint-disable-next-line
          const answer = confirm(message);
          setTimeout(() => {
            if (answer) {
              // If answer is positive, re-trigger the close
              this._delayElectronClose = false;
              electron.remote.getCurrentWindow().close();
            }
          });

          // First, prevents closing the window immediately
          e.returnValue = true;
        } else {
          // Returning undefined will let the window close
        }
      };
    } else if (window) {
      if (shouldPrompt) {
        window.onbeforeunload = () => message;
      } else {
        window.onbeforeunload = null;
      }
    }
  }

  render() {
    return null;
  }
}

import React from 'react';
import ReactDOM from 'react-dom';
import { Column, Line } from './Grid';
import Divider from 'material-ui/Divider';

export default class SeparateWindowDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    // STEP 1: create a container <div>
    this.containerEl = document.createElement('div');
    this.externalWindow = null;
  }

  render() {
    // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
    const { actions } = this.props;
    const content = actions ? (
      <Column>
        {this.props.children}
        <Divider />
        <Line>{this.props.actions}</Line>
      </Column>
    ) : (
      this.props.children
    );

    return ReactDOM.createPortal(content, this.containerEl);
  }

  componentDidMount() {
    // STEP 3: open a new browser window and store a reference to it
    this.externalWindow = window.open(
      '',
      '',
      'width=600,height=400,left=200,top=200'
    );

    if (!this.externalWindow) {
      console.error(
        'Unable to open an external window for SeparateWindowDialog - is Electron or a popup blocker on?'
      );
      return;
    }

    // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
    this.externalWindow.document.body.appendChild(this.containerEl);

    this.externalWindow.addEventListener('close', event => {
        console.log("CLOSE");
      this.props.onRequestClose();
    });
  }

  componentWillUnmount() {
    // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
    // So we tidy up by closing the window
    this.externalWindow.close();
  }
}

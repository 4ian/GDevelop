// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Debugger from '../../Debugger';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import SubscriptionChecker from '../../Profile/SubscriptionChecker';

type State = {|
  subscriptionChecked: boolean,
|};

export class DebuggerEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?Debugger;
  _subscriptionChecker: ?SubscriptionChecker;
  state: State = {
    subscriptionChecked: false,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user.
    return nextProps.isActive;
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  componentWillReceiveProps() {
    this._checkHasSubscription();
  }

  componentDidMount() {
    this._checkHasSubscription();
  }

  _checkHasSubscription() {
    if (
      this._subscriptionChecker &&
      this.props.isActive &&
      !this.state.subscriptionChecked
    ) {
      this._subscriptionChecker.checkHasSubscription();
      this.setState({
        subscriptionChecked: true,
      });
    }
  }

  render() {
    const { project, previewDebuggerServer } = this.props;
    if (!project || !previewDebuggerServer) return null;

    return (
      <React.Fragment>
        <Debugger
          project={project}
          setToolbar={this.props.setToolbar}
          isActive={this.props.isActive}
          previewDebuggerServer={previewDebuggerServer}
          ref={editor => (this.editor = editor)}
        />
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._subscriptionChecker = subscriptionChecker)
          }
          onChangeSubscription={() => {
            if (this.props.onChangeSubscription)
              this.props.onChangeSubscription();
          }}
          id="Debugger"
          title={<Trans>Debugger</Trans>}
          mode="try"
        />
      </React.Fragment>
    );
  }
}

export const renderDebuggerEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <DebuggerEditorContainer {...props} />;

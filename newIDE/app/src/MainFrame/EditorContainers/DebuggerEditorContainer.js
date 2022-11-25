// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Debugger from '../../Debugger';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import SubscriptionChecker, {
  type SubscriptionCheckerInterface,
} from '../../Profile/Subscription/SubscriptionChecker';

type State = {|
  subscriptionChecked: boolean,
|};

export class DebuggerEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?Debugger;
  _subscriptionChecker: ?SubscriptionCheckerInterface;
  state = {
    subscriptionChecked: false,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // We stop updates when the component is inactive.
    // If it's active, was active or becoming active again we let update propagate.
    // Especially important to note that when becoming inactive, a "last" update is allowed.
    return this.props.isActive || nextProps.isActive;
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

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps() {
    this._checkUserHasSubscription();
  }

  componentDidMount() {
    this._checkUserHasSubscription();
  }

  _checkUserHasSubscription() {
    if (
      this._subscriptionChecker &&
      this.props.isActive &&
      !this.state.subscriptionChecked
    ) {
      this._subscriptionChecker.checkUserHasSubscription();
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
          previewDebuggerServer={previewDebuggerServer}
          ref={editor => (this.editor = editor)}
        />
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._subscriptionChecker = subscriptionChecker)
          }
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
) => <DebuggerEditorContainer {...props} />;

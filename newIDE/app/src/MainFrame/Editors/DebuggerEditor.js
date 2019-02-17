// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Debugger from '../../Debugger';
import BaseEditor from './BaseEditor';
import SubscriptionChecker from '../../Profile/SubscriptionChecker';

export default class DebuggerEditor extends BaseEditor {
  editor: ?Debugger;
  _subscriptionChecker: ?SubscriptionChecker;
  state = {
    subscriptionChecked: false,
  };

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
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
    return (
      <React.Fragment>
        <Debugger {...this.props} ref={editor => (this.editor = editor)} />
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

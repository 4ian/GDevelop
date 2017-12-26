// @flow

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '../UI/Dialog';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';
import Authentification, { type Profile } from './Authentification';

type Props = {|
  open: boolean,
  onClose: Function,
  authentification: ?Authentification,
|};

type State = {|
  authenticated: boolean,
  profile: ?Profile,
|};

export default class PreferencesDialog extends Component<Props, State> {
  state = {
    authenticated: false,
    profile: null,
  };

  componentWillMount() {
    if (this.props.authentification) {
      this.setState({
        authenticated: this.props.authentification
          ? this.props.authentification.isAuthenticated()
          : false,
      });

      this.fetchUserProfile();
    }
  }

  fetchUserProfile() {
    console.log('Fetching');
    const { authentification } = this.props;
    if (!authentification) return;

    authentification.getUserInfo((err, profile) => {
      console.log('YOP', profile);
      if (err && err.unauthenticated) {
        return this.setState({
          authenticated: false,
          profile: null,
        });
      } else if (err) {
        console.log('Unable to fetch user profile', err);
        return;
      }

      this.setState({
        profile,
      });
    });
  }

  login = () => {
    if (this.props.authentification)
      this.props.authentification.login({
        onHide: () => console.log('hidden'),
        onAuthenticated: arg => {
          this.setState({
            authenticated: true,
          });

          this.fetchUserProfile();
        },
        onAuthorizationError: err => console.log('Authentification error', err),
      });
  };

  logout = () => {
    if (this.props.authentification) this.props.authentification.logout();

    this.setState({
      authenticated: false,
    });
  };

  render() {
    const { authenticated, profile } = this.state;
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        title="My profile"
      >
        <Column>
          <Line>
            {authenticated && profile ? (
              <div>
                You're logged in as {profile.nickname}. Welcome!
                <RaisedButton label="Logout" onClick={this.logout} />
              </div>
            ) : (
              <div>
                <RaisedButton
                  label="Create my profile"
                  onClick={this.login}
                  primary
                />
                <FlatButton label="Login" onClick={this.login} />
              </div>
            )}
          </Line>
        </Column>
      </Dialog>
    );
  }
}

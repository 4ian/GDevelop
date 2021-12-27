// @flow
import React, { Component } from 'react';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import BuildsList from './BuildsList';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import BuildsWatcher from './BuildsWatcher';

type Props = {|
  onBuildsUpdated?: () => void,
  authenticatedUser: AuthenticatedUser,
  gameId: string,
|};
type State = {|
  builds: ?Array<Build>,
  error: ?Error,
|};

export default class Builds extends Component<Props, State> {
  state = {
    builds: null,
    error: null,
  };
  buildsWatcher = new BuildsWatcher();

  componentDidMount() {
    this._refreshBuilds();
  }

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  _startBuildsWatcher = () => {
    if (!this.state.builds) return;

    this.buildsWatcher.start({
      authenticatedUser: this.props.authenticatedUser,
      builds: this.state.builds,
      onBuildUpdated: (newBuild: Build) => {
        if (!this.state.builds) return;

        this.setState({
          builds: this.state.builds.map((oldBuild: Build) => {
            if (newBuild.id === oldBuild.id) return newBuild;

            return oldBuild;
          }),
        });
      },
    });
  };

  _refreshBuilds = () => {
    const {
      getAuthorizationHeader,
      firebaseUser,
    } = this.props.authenticatedUser;
    if (!firebaseUser) return;
    this.setState({ builds: null, error: null });

    getBuilds(getAuthorizationHeader, firebaseUser.uid, this.props.gameId).then(
      builds => {
        this.setState(
          {
            builds,
          },
          () => {
            this._startBuildsWatcher();
            if (this.props.onBuildsUpdated) this.props.onBuildsUpdated();
          }
        );
      },
      () => {
        this.setState({
          error: new Error(
            'There was an issue getting the game builds, verify your internet connection or try again later.'
          ),
        });
      }
    );
  };

  render() {
    return (
      <BuildsList
        builds={this.state.builds}
        authenticatedUser={this.props.authenticatedUser}
        error={this.state.error}
        loadBuilds={this._refreshBuilds}
      />
    );
  }
}

// @flow
import React, { Component } from 'react';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import BuildsList from './BuildsList';
import { getBuilds, type Build } from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import BuildsWatcher from './BuildsWatcher';

type Props = {|
  onBuildsUpdated?: () => void,
  authenticatedUser: AuthenticatedUser,
  game: Game,
  onGameUpdated?: () => Promise<void>,
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
    // Game is not registered yet so return an empty list of builds.
    const gameId = this.props.game.id;
    this.setState({ builds: null, error: null });

    getBuilds(getAuthorizationHeader, firebaseUser.uid, gameId).then(
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

  _onBuildUpdated = (build: Build) => {
    this.setState((previousState: State) => {
      if (!previousState.builds) return;
      return {
        ...previousState,
        builds: previousState.builds.map((oldBuild: Build) => {
          if (build.id === oldBuild.id) return build;
          return oldBuild;
        }),
      };
    });
  };

  _onBuildDeleted = (build: Build) => {
    this.setState((previousState: State) => {
      if (!previousState.builds) return;
      return {
        ...previousState,
        builds: previousState.builds.filter(
          (oldBuild: Build) => build.id !== oldBuild.id
        ),
      };
    });
  };

  render() {
    return (
      <BuildsList
        builds={this.state.builds}
        authenticatedUser={this.props.authenticatedUser}
        error={this.state.error}
        loadBuilds={this._refreshBuilds}
        game={this.props.game}
        onGameUpdated={this.props.onGameUpdated}
        onBuildUpdated={this._onBuildUpdated}
        onBuildDeleted={this._onBuildDeleted}
      />
    );
  }
}

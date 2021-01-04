// @flow
import React, { Component } from 'react';
import { type UserProfile } from '../../Profile/UserProfileContext';
import BuildsList from './BuildsList';
import {
  getBuilds,
  type Build,
  type BuildArtifactKeyName,
  getBuildArtifactUrl,
} from '../../Utils/GDevelopServices/Build';
import Window from '../../Utils/Window';
import BuildsWatcher from './BuildsWatcher';

type Props = {|
  onBuildsUpdated: ?() => void,
  userProfile: UserProfile,
|};
type State = {|
  builds: ?Array<Build>,
|};

export default class Builds extends Component<Props, State> {
  state = {
    builds: null,
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
      userProfile: this.props.userProfile,
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
    const { getAuthorizationHeader, profile } = this.props.userProfile;
    if (!profile) return;

    getBuilds(getAuthorizationHeader, profile.uid).then(
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
        //TODO: Handle error
      }
    );
  };

  _download = (build: Build, key: BuildArtifactKeyName) => {
    const url = getBuildArtifactUrl(build, key);
    if (url) Window.openExternalURL(url);
  };

  render() {
    return (
      <BuildsList
        builds={this.state.builds}
        userProfile={this.props.userProfile}
        onDownload={this._download}
      />
    );
  }
}

// @flow
import React, { Component } from 'react';
import UserProfileContext, {
  type UserProfile,
} from '../../Profile/UserProfileContext';
import BuildsList from './BuildsList';
import {
  getBuilds,
  type Build,
  getUrl,
} from '../../Utils/GDevelopServices/Build';
import Window from '../../Utils/Window';

type ContainerProps = {|
  onBuildsUpdated: ?() => void,
|};
type Props = {|
  onBuildsUpdated: ?() => void,
  userProfile: UserProfile,
|};
type State = {|
  builds: ?Array<Build>,
|};

export class Builds extends Component<Props, State> {
  state = {
    builds: null,
  };

  componentDidMount() {
    this._refreshBuilds();
  }

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
            if (this.props.onBuildsUpdated) this.props.onBuildsUpdated();
          }
        );
      },
      () => {
        //TODO: Handle error
      }
    );
  };

  _download = (build: Build, key: string) => {
    if (!build || !build[key]) return;

    Window.openExternalURL(getUrl(build[key]));
  };

  render() {
    return (
      <BuildsList builds={this.state.builds} onDownload={this._download} />
    );
  }
}

const BuildsContainer = (props: ContainerProps) => (
  <UserProfileContext.Consumer>
    {(userProfile: UserProfile) => (
      <Builds
        userProfile={userProfile}
        onBuildsUpdated={props.onBuildsUpdated}
      />
    )}
  </UserProfileContext.Consumer>
);

export default BuildsContainer;

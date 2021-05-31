// @flow
import * as React from 'react';
import {
  getReleases,
  type Release,
} from '../../Utils/GDevelopServices/Release';
import ChangelogRenderer from './ChangelogRenderer';
import { getIDEVersion } from '../../Version';

type State = {|
  releases: ?Array<Release>,
  error: ?Error,
|};

type Props = {|
  onUpdated?: () => void,
|};

/**
 * Load information about latest releases and display them.
 */
export default class Changelog extends React.Component<Props, State> {
  state: State = {
    releases: null,
    error: null,
  };

  _onUpdated: () => void = () => {
    if (this.props.onUpdated) this.props.onUpdated();
  };

  componentDidMount() {
    getReleases()
      .then(releases =>
        this.setState(
          {
            releases,
            error: null,
          },
          this._onUpdated
        )
      )
      .catch((error: ?Error) =>
        this.setState(
          {
            error,
          },
          this._onUpdated
        )
      );
  }

  render(): React.Node {
    const { releases, error } = this.state;
    return (
      <ChangelogRenderer
        releases={releases}
        error={error}
        currentReleaseName={getIDEVersion()}
      />
    );
  }
}

// @flow
import * as React from 'react';
import {
  getReleases,
  type Release,
} from '../../Utils/GDevelopServices/Release';
import ChangelogRenderer from './ChangelogRenderer';
import { getIDEVersion } from '../../Version';

type Props = {|
  onUpdated?: () => void,
|};

/**
 * Load information about latest releases and display them.
 */
const Changelog = ({ onUpdated }: Props) => {
  const [releases, setReleases] = React.useState<?Array<Release>>(null);
  const [error, setError] = React.useState<?Error>(null);

  React.useEffect(
    () => {
      getReleases()
        .then(releases => {
          setError(null);
          setReleases(releases);
          if (onUpdated) {
            onUpdated();
          }
        })
        .catch((error: ?Error) => {
          setError(error);
          if (onUpdated) {
            onUpdated();
          }
        });
    },
    [onUpdated]
  );

  return (
    <ChangelogRenderer
      releases={releases}
      error={error}
      currentReleaseName={getIDEVersion()}
    />
  );
};

export default Changelog;

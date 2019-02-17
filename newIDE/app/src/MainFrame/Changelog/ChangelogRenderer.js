// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  type Release,
  findRelease,
} from '../../Utils/GDevelopServices/Release';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import ReactMarkdown from 'react-markdown';
import { Column, Line } from '../../UI/Grid';
import { FlatButton, RaisedButton } from 'material-ui';
import Window from '../../Utils/Window';
import { hasBreakingChange } from '../../Utils/GDevelopServices/Release';
import AlertMessage from '../../UI/AlertMessage';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';

type Props = {|
  releases: ?Array<Release>,
  error: ?Error,
  currentReleaseName: string,
|};

/**
 * Display information about latest releases.
 */
const ChangelogRenderer = ({ releases, error, currentReleaseName }: Props) => {
  const openReleaseNote = () =>
    Window.openExternalURL('https://github.com/4ian/GDevelop/releases');

  if (error) {
    return (
      <Column>
        <Line>
          <AlertMessage kind="warning">
            Please double check online the changes to make sure that you are
            aware of anything new in this version that would require you to
            adapt your project.
          </AlertMessage>
        </Line>
        <Line>
          <EmptyMessage>
            <Trans>
              Unable to load the information about the latest GDevelop releases.
              Verify your internet connection or retry later.
            </Trans>
          </EmptyMessage>
        </Line>
        <Line justifyContent="center">
          <RaisedButton
            label={<Trans>See the releases notes online</Trans>}
            onClick={openReleaseNote}
          />
        </Line>
      </Column>
    );
  }

  if (!releases) {
    return <PlaceholderLoader />;
  }

  const currentRelease = findRelease(releases, currentReleaseName);
  const currentVersionHasBreakingChange =
    !!currentRelease && hasBreakingChange(currentRelease);

  return (
    <ThemeConsumer>
      {muiTheme => (
        <Column>
          {currentVersionHasBreakingChange && (
            <AlertMessage kind="warning">
              This version of GDevelop has a breaking change. Please make sure
              to read the changes below to understand if any change or
              adaptation must be made to your project.
            </AlertMessage>
          )}
          {releases.map(release =>
            release.name ? (
              <ReactMarkdown
                key={release.name}
                escapeHtml
                source={
                  '# Version ' +
                  release.name +
                  '\n---\n' +
                  (release.description ||
                    'Changes and new features description will be available soon.')
                }
                className={muiTheme.markdownRootClassName}
              />
            ) : null
          )}
          <Line justifyContent="center">
            <FlatButton
              label={<Trans>See all the releases notes</Trans>}
              onClick={openReleaseNote}
            />
          </Line>
        </Column>
      )}
    </ThemeConsumer>
  );
};

export default ChangelogRenderer;

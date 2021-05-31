// @flow
import * as React from 'react';
import ChangelogDialog from './ChangelogDialog';
import PreferencesContext from '../Preferences/PreferencesContext';

type ContainerProps = {|
  defaultOpen: boolean,
|};

type ContainerState = {|
  open: boolean,
|};

class ChangelogDialogContainer extends React.Component<
  ContainerProps,
  ContainerState
> {
  state = {
    open: this.props.defaultOpen,
  };

  render() {
    const { open } = this.state;
    return (
      <ChangelogDialog
        open={open}
        onClose={() =>
          this.setState({
            open: false,
          })
        }
      />
    );
  }
}

/**
 * The container showing the ChangelogDialog only if a a new version
 * of GDevelop is detected.
 */
export default (props: {||}): React.Node => (
  <PreferencesContext.Consumer>
    {({ values, verifyIfIsNewVersion }) => (
      <ChangelogDialogContainer
        defaultOpen={verifyIfIsNewVersion() && values.autoDisplayChangelog}
      />
    )}
  </PreferencesContext.Consumer>
);

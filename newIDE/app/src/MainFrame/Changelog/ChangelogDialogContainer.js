// @flow
import * as React from 'react';
import ChangelogDialog from './ChangelogDialog';
import PreferencesContext from '../Preferences/PreferencesContext';

type ContainerProps = {|
  defaultOpen: boolean,
|};

const ChangelogDialogContainer = ({ defaultOpen }: ContainerProps) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return <ChangelogDialog open={open} onClose={() => setOpen(false)} />;
};

/**
 * The container showing the ChangelogDialog only if a a new version
 * of GDevelop is detected.
 */
export default (props: {||}) => (
  <PreferencesContext.Consumer>
    {({ values, verifyIfIsNewVersion }) => (
      <ChangelogDialogContainer
        defaultOpen={verifyIfIsNewVersion() && values.autoDisplayChangelog}
      />
    )}
  </PreferencesContext.Consumer>
);

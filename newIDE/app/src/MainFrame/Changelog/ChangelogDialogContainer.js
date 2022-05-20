// @flow
import * as React from 'react';
import ChangelogDialog from './ChangelogDialog';
import PreferencesContext from '../Preferences/PreferencesContext';

type InnerContainerProps = {|
  defaultOpen: boolean,
|};

const ChangelogDialogInnerContainer = ({
  defaultOpen,
}: InnerContainerProps) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return <ChangelogDialog open={open} onClose={() => setOpen(false)} />;
};

/**
 * The container showing the ChangelogDialog only if a a new version
 * of GDevelop is detected.
 */
const ChangelogDialogContainer = (props: {||}) => (
  <PreferencesContext.Consumer>
    {({ values, verifyIfIsNewVersion }) => (
      <ChangelogDialogInnerContainer
        defaultOpen={verifyIfIsNewVersion() && values.autoDisplayChangelog}
      />
    )}
  </PreferencesContext.Consumer>
);

export default ChangelogDialogContainer;

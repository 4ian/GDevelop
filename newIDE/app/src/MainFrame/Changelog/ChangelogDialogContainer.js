// @flow
import * as React from 'react';
import ChangelogDialog from './ChangelogDialog';
import PreferencesContext from '../Preferences/PreferencesContext';

let isChangelogDisplayedAtStartup = false;
export const wasChangelogDisplayedAtStartup = (): boolean =>
  isChangelogDisplayedAtStartup;

type InnerContainerProps = {|
  defaultOpen: boolean,
|};

const ChangelogDialogInnerContainer = ({
  defaultOpen,
}: InnerContainerProps) => {
  const [open, setOpen] = React.useState(defaultOpen);
  if (defaultOpen) isChangelogDisplayedAtStartup = true;

  return <ChangelogDialog open={open} onClose={() => setOpen(false)} />;
};

/**
 * The container showing the ChangelogDialog only if a a new version
 * of GDevelop is detected.
 */
const ChangelogDialogContainer = (props: {||}): React.Node => (
  <PreferencesContext.Consumer>
    {({ values, verifyIfIsNewVersion }) => (
      <ChangelogDialogInnerContainer
        defaultOpen={verifyIfIsNewVersion() && values.autoDisplayChangelog}
      />
    )}
  </PreferencesContext.Consumer>
);

export default ChangelogDialogContainer;

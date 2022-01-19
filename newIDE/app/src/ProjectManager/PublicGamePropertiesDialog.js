// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import PublicGameProperties from './PublicGameProperties';
import RaisedButton from '../UI/RaisedButton';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../Utils/ProjectErrorsChecker';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';

type PublicProjectProperties = {|
  name: string,
|};

function applyPublicPropertiesToProject(
  project: gdProject,
  newProperties: PublicProjectProperties
) {
  const t = str => str; //TODO
  const { name } = newProperties;
  project.setName(name);

  return displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project));
}

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: () => void,
  onApply: () => void,
|};

const PublicGamePropertiesDialog = ({
  project,
  open,
  onClose,
  onApply,
}: Props) => {
  const [name, setName] = React.useState(project.getName());
  if (!open) return null;

  const onSave = () => {
    if (
      applyPublicPropertiesToProject(project, {
        name,
      })
    )
      onApply();
  };

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      key="back"
      primary={false}
      onClick={onClose}
    />,
    <RaisedButton
      label={<Trans>Save</Trans>}
      primary
      onClick={onSave}
      key="save"
    />,
  ];

  return (
    <Dialog
      title={<Trans>Game info</Trans>}
      onRequestClose={onClose}
      actions={actions}
      cannotBeDismissed={false}
      open={open}
      noMargin
    >
      <PublicGameProperties name={name} setName={setName} project={project} />
    </Dialog>
  );
};

export default PublicGamePropertiesDialog;

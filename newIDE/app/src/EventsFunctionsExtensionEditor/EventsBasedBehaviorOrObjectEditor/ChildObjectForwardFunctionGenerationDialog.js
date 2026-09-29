// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const excludedObjectOrGroupNames = ['Object'];

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onCancel: () => void,
  onChoose: (childObjectName: string) => void,
|};

export default function ChildObjectForwardFunctionGenerationDialog({
  project,
  projectScopedContainersAccessor,
  onChoose,
  onCancel,
}: Props): React.Node {
  const [objectName, setObjectName] = React.useState('');

  return (
    <Dialog
      title={<Trans>Choose an object</Trans>}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/objects/custom-objects-prefab-template"
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
          key={'close'}
        />,
        <RaisedButton
          label={<Trans>Generate</Trans>}
          primary
          keyboardFocused={true}
          onClick={() => onChoose(objectName)}
          key={'generate'}
        />,
      ]}
      open
      onRequestClose={onCancel}
      maxWidth="sm"
    >
      <Text>
        <Trans>
          Functions from this child-object will be forwarded by the parent.
        </Trans>
      </Text>
      <ObjectSelector
        project={project}
        value={objectName}
        excludedObjectOrGroupNames={excludedObjectOrGroupNames}
        noGroups
        requireCustomObject
        onChange={setObjectName}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        floatingLabelText={<Trans>Choose an object</Trans>}
        fullWidth
        openOnFocus={false}
      />
    </Dialog>
  );
}

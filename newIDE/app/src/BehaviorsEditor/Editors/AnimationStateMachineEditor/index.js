// @flow
import * as React from 'react';
import { type BehaviorEditorProps } from '../BehaviorEditorProps.flow';
import AnimationStateMachineEditor from '../../../ObjectEditor/AnimationStateMachineEditor';

type Props = BehaviorEditorProps;

/**
 * The editor of the AnimationStateMachine behavior: it displays the state
 * machine graph editor (the same one as in the "State Machine" tab of the
 * object editor).
 */
const AnimationStateMachineBehaviorEditor = ({
  project,
  behaviors,
  object,
  onBehaviorUpdated,
}: Props): React.Node => {
  const behavior = behaviors[0];

  return (
    <AnimationStateMachineEditor
      object={object}
      project={project}
      behavior={behavior}
      onUpdated={onBehaviorUpdated}
    />
  );
};

export default AnimationStateMachineBehaviorEditor;

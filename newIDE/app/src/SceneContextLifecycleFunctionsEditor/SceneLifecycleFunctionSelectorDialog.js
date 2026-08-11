// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Subheader from '../UI/Subheader';
import { List } from '../UI/List';
import { FunctionListItem } from '../EventsFunctionsExtensionEditor/ExtensionFunctionSelectorDialog';
import {
  hasSceneLifecycleEventsFunction,
  isSceneLifecycleFunctionName,
  type SceneLifecycleFunctionName,
} from '../SceneContextLifecycleFunctions';

const gd: libGDevelop = global.gd;

type Props = {|
  owner: gdLayout | gdExternalEvents,
  onCancel: () => void,
  onChoose: (name: SceneLifecycleFunctionName) => void,
|};

const SceneLifecycleFunctionSelectorDialog = ({
  owner,
  onCancel,
  onChoose,
}: Props): React.Node => (
  <Dialog
    title={<Trans>Choose a new scene lifecycle function</Trans>}
    actions={[
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        keyboardFocused
        onClick={onCancel}
      />,
    ]}
    open
    onRequestClose={onCancel}
    maxWidth="sm"
  >
    <List>
      <Subheader>
        <Trans>Scene lifecycle functions</Trans>
      </Subheader>
      <FunctionListItem
        functionType={gd.EventsFunction.Action}
        functionName="sceneLoad"
        name={<Trans>On scene load</Trans>}
        description={
          <Trans>
            Events run once after this scene has loaded, before its first
            update.
          </Trans>
        }
        disabled={hasSceneLifecycleEventsFunction(owner, 'sceneLoad')}
        onChoose={({ name }) => {
          if (isSceneLifecycleFunctionName(name)) onChoose((name: any));
        }}
      />
      <FunctionListItem
        functionType={gd.EventsFunction.Action}
        functionName="sceneSignal"
        name={<Trans>On scene signal</Trans>}
        description={
          <Trans>
            Events run once for each scene signal delivered to this scene.
          </Trans>
        }
        disabled={hasSceneLifecycleEventsFunction(owner, 'sceneSignal')}
        onChoose={({ name }) => {
          if (isSceneLifecycleFunctionName(name)) onChoose((name: any));
        }}
      />
      <FunctionListItem
        functionType={gd.EventsFunction.Action}
        functionName="sceneUpdate"
        name={<Trans>Scene update</Trans>}
        description={
          <Trans>Events run every frame while this scene is active.</Trans>
        }
        disabled={hasSceneLifecycleEventsFunction(owner, 'sceneUpdate')}
        onChoose={({ name }) => {
          if (isSceneLifecycleFunctionName(name)) onChoose((name: any));
        }}
      />
      <FunctionListItem
        functionType={gd.EventsFunction.Action}
        functionName="sceneUnload"
        name={<Trans>On scene unload</Trans>}
        description={
          <Trans>
            Events run once before this scene and its objects are unloaded.
          </Trans>
        }
        disabled={hasSceneLifecycleEventsFunction(owner, 'sceneUnload')}
        onChoose={({ name }) => {
          if (isSceneLifecycleFunctionName(name)) onChoose((name: any));
        }}
      />
    </List>
  </Dialog>
);

export default SceneLifecycleFunctionSelectorDialog;

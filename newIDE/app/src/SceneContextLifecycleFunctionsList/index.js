// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import { List, ListItem } from '../UI/List';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import {
  sceneLifecycleFunctionDefinitions,
  type SceneLifecycleFunctionName,
} from '../SceneContextLifecycleFunctions';

const styles = {
  container: {
    width: 292,
    minWidth: 240,
    maxWidth: 340,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: '1px solid rgba(128, 128, 128, 0.25)',
  },
};

type Props = {|
  ownerKind: 'scene' | 'external-events',
  selectedLifecycleFunctionName: SceneLifecycleFunctionName,
  onSelectLifecycleFunction: (name: SceneLifecycleFunctionName) => void,
|};

const getLabel = (name: SceneLifecycleFunctionName): React.Node => {
  switch (name) {
    case 'sceneLoad':
      return <Trans>On scene load</Trans>;
    case 'sceneSignal':
      return <Trans>On scene signal</Trans>;
    case 'sceneUpdate':
      return <Trans>Scene update</Trans>;
    case 'sceneUnload':
      return <Trans>On scene unload</Trans>;
    default:
      return null;
  }
};

const getSceneDescription = (name: SceneLifecycleFunctionName): React.Node => {
  switch (name) {
    case 'sceneLoad':
      return (
        <Trans>
          Events run once after this scene has loaded, before its first update.
        </Trans>
      );
    case 'sceneSignal':
      return (
        <Trans>
          Events run once for each scene signal delivered to this scene.
        </Trans>
      );
    case 'sceneUpdate':
      return <Trans>Events run every frame while this scene is active.</Trans>;
    case 'sceneUnload':
      return (
        <Trans>
          Events run once before this scene and its objects are unloaded.
        </Trans>
      );
    default:
      return null;
  }
};

const getExternalEventsDescription = (
  name: SceneLifecycleFunctionName
): React.Node => {
  switch (name) {
    case 'sceneLoad':
      return (
        <Trans>
          Included when linked from an On scene load lifecycle function.
        </Trans>
      );
    case 'sceneSignal':
      return (
        <Trans>
          Included once per signal when linked from an On scene signal lifecycle
          function.
        </Trans>
      );
    case 'sceneUpdate':
      return (
        <Trans>
          Included every frame when linked from a Scene update lifecycle
          function.
        </Trans>
      );
    case 'sceneUnload':
      return (
        <Trans>
          Included during cleanup when linked from an On scene unload lifecycle
          function.
        </Trans>
      );
    default:
      return null;
  }
};

export default function SceneContextLifecycleFunctionsList({
  ownerKind,
  selectedLifecycleFunctionName,
  onSelectLifecycleFunction,
}: Props): React.Node {
  return (
    <div style={styles.container}>
      <Subheader>
        {ownerKind === 'scene' ? (
          <Trans>Scene lifecycle functions</Trans>
        ) : (
          <Trans>External lifecycle functions</Trans>
        )}
      </Subheader>
      <List>
        {sceneLifecycleFunctionDefinitions.map(definition => (
          <ListItem
            key={definition.name}
            id={`scene-lifecycle-function-${definition.name}`}
            leftIcon={
              <ListIcon
                src={definition.icon}
                iconSize={32}
                padding={4}
                useExactIconSize
              />
            }
            primaryText={getLabel(definition.name)}
            secondaryText={
              ownerKind === 'scene'
                ? getSceneDescription(definition.name)
                : getExternalEventsDescription(definition.name)
            }
            secondaryTextLines={2}
            selected={definition.name === selectedLifecycleFunctionName}
            onClick={() => onSelectLifecycleFunction(definition.name)}
          />
        ))}
      </List>
    </div>
  );
}

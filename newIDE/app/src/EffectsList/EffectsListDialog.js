// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import EffectsList from './index';
import HelpButton from '../UI/HelpButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onApply: () => void,
  effectsContainer: gdEffectsContainer,
|};

export default class EffectsListDialog extends React.Component<Props, {||}> {
  render() {
    const { project, onApply, effectsContainer } = this.props;

    return (
      <Dialog
        noMargin
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/interface/scene-editor/layer-effects"
          />,
        ]}
        actions={[
          <FlatButton
            label={<Trans>Ok</Trans>}
            primary
            keyboardFocused
            onClick={onApply}
            key={'Apply'}
          />,
        ]}
        cannotBeDismissed={true}
        open
        onRequestClose={onApply}
        title={<Trans>Effects</Trans>}
      >
        <EffectsList
          project={project}
          resourceSources={this.props.resourceSources}
          onChooseResource={this.props.onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
          effectsContainer={effectsContainer}
          onEffectsUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
        />
      </Dialog>
    );
  }
}

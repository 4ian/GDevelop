// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import EffectsList from './index';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onApply: () => void,
  effectsContainer: gdEffectsContainer,
|};

export default class EffectsListDialog extends React.Component<Props, {||}> {
  render() {
    const { onApply, effectsContainer } = this.props;

    return (
      <Dialog
        noMargin
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/interface/scene-editor/layers-and-cameras"
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
        modal
        open
        onRequestClose={onApply}
        autoScrollBodyContent
        title={<Trans>Effects</Trans>}
      >
        <EffectsList
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

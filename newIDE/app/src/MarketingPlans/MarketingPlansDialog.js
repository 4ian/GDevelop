// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import MarketingPlans from './MarketingPlans';
import { type Game } from '../Utils/GDevelopServices/Game';

type Props = {|
  game: Game,
  onClose: () => void,
|};

const MarketingPlansDialog = ({ game, onClose }: Props) => {
  return (
    <Dialog
      title={<Trans>Marketing campaigns</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      open
      onRequestClose={onClose}
    >
      <MarketingPlans game={game} />
    </Dialog>
  );
};

export default MarketingPlansDialog;

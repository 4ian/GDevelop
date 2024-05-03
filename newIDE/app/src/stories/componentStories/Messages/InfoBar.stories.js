// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import InfoBar from '../../../UI/Messages/InfoBar';
import { ColumnStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import { Line } from '../../../UI/Grid';

export default {
  title: 'UI Building Blocks/InfoBar',
  component: InfoBar,
  decorators: [paperDecorator],
};

export const Default = () => {
  const [infoBarOpen, setInfoBarOpen] = React.useState<boolean>(false);
  const [
    infoBarWithActionOpen,
    setInfoBarWithActionOpen,
  ] = React.useState<boolean>(false);
  return (
    <>
      <Line>
        <ColumnStackLayout>
          <RaisedButton
            onClick={() => setInfoBarOpen(true)}
            label={'Open info bar'}
          />
          <RaisedButton
            onClick={() => setInfoBarWithActionOpen(true)}
            label={'Open info bar with button'}
          />
          <InfoBar
            message={"You're seeing an info bar"}
            hide={() => setInfoBarOpen(false)}
            visible={infoBarOpen}
          />
          <InfoBar
            message={"You're seeing an info bar with a button"}
            hide={() => setInfoBarWithActionOpen(false)}
            visible={infoBarWithActionOpen}
            actionLabel={'Alright'}
            onActionClick={action('Click on button')}
          />
        </ColumnStackLayout>
      </Line>
    </>
  );
};

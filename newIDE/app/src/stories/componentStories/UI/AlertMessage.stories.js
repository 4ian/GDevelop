// @flow
import * as React from 'react';

import { getPaperDecorator } from '../../PaperDecorator';

import AlertMessage from '../../../UI/AlertMessage';
import { ColumnStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/AlertMessage',
  component: AlertMessage,
  decorators: [getPaperDecorator('medium')],
};

export const Default = () => (
  <ColumnStackLayout>
    <AlertMessage>Hello World, this is an alert text</AlertMessage>
    <AlertMessage onHide={() => {}}>
      Hello World, this is an alert text
    </AlertMessage>
    <AlertMessage onHide={() => {}} hideButtonSize="small">
      Hello World, this is an alert text
    </AlertMessage>
    <AlertMessage kind="info">
      Hello World, this is an info alert text
    </AlertMessage>
    <AlertMessage kind="info" onHide={() => {}}>
      Hello World, this is an info alert text
    </AlertMessage>
    <AlertMessage kind="info" onHide={() => {}} hideButtonSize="small">
      Hello World, this is an info alert text
    </AlertMessage>
    <AlertMessage kind="warning">
      Hello World, this is a warning alert text
    </AlertMessage>
    <AlertMessage kind="warning" onHide={() => {}}>
      Hello World, this is a warning alert text
    </AlertMessage>
    <AlertMessage kind="warning" onHide={() => {}} hideButtonSize="small">
      Hello World, this is a warning alert text
    </AlertMessage>
    <AlertMessage kind="error">
      Hello World, this is an error alert text
    </AlertMessage>
    <AlertMessage kind="error" onHide={() => {}}>
      Hello World, this is an error alert text
    </AlertMessage>
    <AlertMessage kind="error" onHide={() => {}} hideButtonSize="small">
      Hello World, this is an error alert text
    </AlertMessage>
    <AlertMessage kind="info">
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
    <AlertMessage kind="info" onHide={() => {}}>
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
    <AlertMessage kind="info" onHide={() => {}} hideButtonSize="small">
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
    <AlertMessage
      kind="info"
      renderLeftIcon={() => (
        <img
          src="res/tutorial_icons/tween-behavior.jpg"
          alt=""
          style={{
            maxWidth: 128,
            maxHeight: 128,
          }}
        />
      )}
      onHide={() => {}}
    >
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
    <AlertMessage
      kind="info"
      renderLeftIcon={() => (
        <img
          src="res/tutorial_icons/tween-behavior.jpg"
          alt=""
          style={{
            maxWidth: 128,
            maxHeight: 128,
          }}
        />
      )}
      onHide={() => {}}
      hideButtonSize="small"
    >
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
  </ColumnStackLayout>
);

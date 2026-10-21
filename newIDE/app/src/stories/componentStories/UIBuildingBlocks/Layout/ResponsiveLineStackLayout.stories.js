// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import FlatButton from '../../../../UI/FlatButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { ResponsiveLineStackLayout } from '../../../../UI/Layout';
import '../../../../UI/Theme/Global/Scrollbar.css';
import '../../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/Layout/ResponsiveLineStackLayout',
};

const Default = (): React.Node => (
  <ResponsiveLineStackLayout>
    <div>Some Div</div>
    <span>Some Span</span>
    <RaisedButton label="Raised Button" onClick={action('on click')} />
    <RaisedButton label="Raised Button" onClick={action('on click')} />
    <FlatButton label="Flat Button" onClick={action('on click')} />
  </ResponsiveLineStackLayout>
);

export { Default as __Default };

export const DefaultWithNullItems = (): React.Node => (
  <ResponsiveLineStackLayout>
    {null}
    {null}
    <div>Some Div</div>
    {null}
    {null}
    <span>Some Span</span>
    <RaisedButton label="Raised Button" onClick={action('on click')} />
    <RaisedButton label="Raised Button" onClick={action('on click')} />
    <FlatButton label="Flat Button" onClick={action('on click')} />
    {null}
    {null}
  </ResponsiveLineStackLayout>
);
DefaultWithNullItems.storyName = 'Default with null items';

export const AlignItemsCenter = (): React.Node => (
  <ResponsiveLineStackLayout alignItems="center">
    <div>Some Div</div>
    <span>Some Span</span>
    <RaisedButton label="Raised Button" onClick={action('on click')} />
  </ResponsiveLineStackLayout>
);
AlignItemsCenter.storyName = 'alignItems=center';

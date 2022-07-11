// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import SliderComponent from '../../../UI/Slider';

import Brush from '@material-ui/icons/Brush';
import FilterList from '@material-ui/icons/FilterList';
import CloudDownload from '@material-ui/icons/CloudDownload';

import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import RaisedButton from '../../../UI/RaisedButton';
import FlatButton from '../../../UI/FlatButton';
import TextButton from '../../../UI/TextButton';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import RaisedButtonWithMenu from '../../../UI/RaisedButtonWithMenu';
import ElementWithMenu from '../../../UI/Menu/ElementWithMenu';
import ToolbarIcon from '../../../UI/ToolbarIcon';
import MiniToolbar, { MiniToolbarText } from '../../../UI/MiniToolbar';
import IconButton from '../../../UI/IconButton';

const buildFakeMenuTemplate = () => [
  {
    label: 'Option 1',
    click: action('click option 1'),
  },
  { type: 'separator' },
  {
    label: 'Option 2',
    click: action('click option 2'),
  },
];

export default {
  title: 'UI Building Blocks/Buttons',
  component: SliderComponent,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <LineStackLayout noMargin>
      <Text>Buttons:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <RaisedButton label="Raised button" onClick={action('onClick')()} />
      <RaisedButton
        icon={<CloudDownload />}
        label="Raised button"
        onClick={action('onClick')()}
      />
      <RaisedButton
        label="Primary Raised button"
        primary
        onClick={action('onClick')()}
      />
      <RaisedButton
        icon={<CloudDownload />}
        label="Primary Raised button"
        primary
        onClick={action('onClick')()}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <FlatButton label="Flat button" onClick={action('onClick')()} />
      <FlatButton
        leftIcon={<CloudDownload />}
        label="Flat button"
        onClick={action('onClick')()}
      />
      <FlatButton
        label="Primary Flat button"
        primary
        onClick={action('onClick')()}
      />
      <FlatButton
        leftIcon={<CloudDownload />}
        label="Primary Flat button"
        primary
        onClick={action('onClick')()}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <TextButton label="Text button" onClick={action('onClick')()} />
      <TextButton
        icon={<CloudDownload />}
        label="Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        primary
        label="Primary Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        icon={<CloudDownload />}
        primary
        label="Primary Text button"
        onClick={action('onClick')()}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text>Buttons with split menus:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <RaisedButton
        label="Traditional Raised button"
        onClick={action('onClick')()}
      />
      <RaisedButtonWithSplitMenu
        label="Button with split menu"
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithSplitMenu
        label="Primary button with split menu"
        primary
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithSplitMenu
        label="... and with icon"
        icon={<Brush />}
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithSplitMenu
        label="... and disabled"
        icon={<Brush />}
        disabled
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text>Buttons with menus:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <RaisedButton
        label="Traditional Raised button"
        onClick={action('onClick')()}
      />
      <RaisedButtonWithMenu
        label="Button with menu"
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithMenu
        label="... and with icon"
        icon={<Brush />}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithMenu
        label="... and disabled"
        icon={<Brush />}
        disabled
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text>Icons with menu:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <ElementWithMenu
        element={
          <ToolbarIcon
            src="res/ribbon_default/bug32.png"
            tooltip={'ToolbarIcon with menu'}
          />
        }
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <ElementWithMenu
        element={
          <IconButton>
            <FilterList />
          </IconButton>
        }
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text>In a mini toolbar:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <MiniToolbar>
        <MiniToolbarText firstChild>Some text:</MiniToolbarText>
        <IconButton>
          <Brush />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton>
              <FilterList />
            </IconButton>
          }
          buildMenuTemplate={() => [
            {
              label: 'Option 1',
              click: action('click option 1'),
            },
            { type: 'separator' },
            {
              label: 'Option 2',
              click: action('click option 2'),
            },
          ]}
        />
      </MiniToolbar>
    </LineStackLayout>
  </ColumnStackLayout>
);

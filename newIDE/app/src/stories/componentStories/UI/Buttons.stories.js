// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import Home from '../../../UI/CustomSvgIcons/Home';
import Crown from '../../../UI/CustomSvgIcons/Crown';
import Cut from '../../../UI/CustomSvgIcons/Cut';

import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';
import RaisedButton from '../../../UI/RaisedButton';
import FlatButton from '../../../UI/FlatButton';
import TextButton from '../../../UI/TextButton';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import FlatButtonWithSplitMenu from '../../../UI/FlatButtonWithSplitMenu';
import RaisedButtonWithMenu from '../../../UI/RaisedButtonWithMenu';
import ElementWithMenu from '../../../UI/Menu/ElementWithMenu';
import MiniToolbar, { MiniToolbarText } from '../../../UI/MiniToolbar';
import IconButton from '../../../UI/IconButton';
import { Column, Line } from '../../../UI/Grid';
import Trash from '../../../UI/CustomSvgIcons/Trash';
import AddCircle from '../../../UI/CustomSvgIcons/AddCircle';
import Download from '../../../UI/CustomSvgIcons/Download';
import Edit from '../../../UI/CustomSvgIcons/Edit';
import Filter from '../../../UI/CustomSvgIcons/Filter';

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
  decorators: [paperDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Buttons:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <RaisedButton label="Raised button" onClick={action('onClick')()} />
      <RaisedButton
        icon={<Download />}
        label="Raised button"
        onClick={action('onClick')()}
      />
      <RaisedButton
        label="Primary Raised button"
        primary
        onClick={action('onClick')()}
      />
      <RaisedButton
        icon={<Download />}
        label="Primary Raised button"
        primary
        onClick={action('onClick')()}
      />
      <RaisedButton icon={<Download />} primary onClick={action('onClick')()} />
      <RaisedButton icon={<Download />} onClick={action('onClick')()} />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <FlatButton label="Flat button" onClick={action('onClick')()} />
      <FlatButton
        leftIcon={<Download />}
        label="Flat button"
        onClick={action('onClick')()}
      />
      <FlatButton
        label="Primary Flat button"
        primary
        onClick={action('onClick')()}
      />
      <FlatButton
        leftIcon={<Download />}
        label="Primary Flat button"
        primary
        onClick={action('onClick')()}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <TextButton label="Text button" onClick={action('onClick')()} />
      <TextButton
        icon={<Download />}
        label="Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        primary
        label="Primary Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        icon={<Download />}
        primary
        label="Primary Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        secondary
        label="Secondary Text button"
        onClick={action('onClick')()}
      />
      <TextButton
        icon={<Download />}
        secondary
        label="Secondary Text button"
        onClick={action('onClick')()}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Buttons with split menus:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <RaisedButton
        label="Traditional Raised button"
        onClick={action('onClick')()}
      />
      <RaisedButtonWithSplitMenu
        label="Raised button with split menu"
        primary
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <FlatButtonWithSplitMenu
        label="Flat primary button"
        primary
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <FlatButtonWithSplitMenu
        label="Flat non primary button"
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <FlatButtonWithSplitMenu
        label="... and with icon"
        icon={<Edit />}
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <FlatButtonWithSplitMenu
        label="... and disabled"
        icon={<Edit />}
        disabled
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <FlatButtonWithSplitMenu
        icon={<Edit />}
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <FlatButtonWithSplitMenu
        icon={<Edit />}
        disabled
        onClick={action('onClick')()}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Buttons with menus:</Text>
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
        icon={<Edit />}
        buildMenuTemplate={buildFakeMenuTemplate}
      />
      <RaisedButtonWithMenu
        label="... and disabled"
        icon={<Edit />}
        disabled
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Icons with menu:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <ElementWithMenu
        element={
          <IconButton>
            <Filter />
          </IconButton>
        }
        buildMenuTemplate={buildFakeMenuTemplate}
      />
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Icons</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Column expand>
        <Text>A few icon buttons</Text>
        <Line noMargin>
          <IconButton>
            <Edit />
          </IconButton>
          <IconButton selected>
            <Edit />
          </IconButton>
          <IconButton>
            <Trash />
          </IconButton>
          <IconButton>
            <AddCircle />
          </IconButton>
        </Line>
        <Line>
          <IconButton size="small">
            <Edit />
          </IconButton>
          <IconButton size="small" selected>
            <Edit />
          </IconButton>
          <IconButton size="small">
            <Trash />
          </IconButton>
          <IconButton size="small">
            <AddCircle />
          </IconButton>
        </Line>
      </Column>
      <Column expand>
        <Text>A few SVG icon buttons</Text>
        <Line noMargin>
          <IconButton>
            <Home />
          </IconButton>
          <IconButton>
            <Cut />
          </IconButton>
          <IconButton>
            <Crown />
          </IconButton>
          <IconButton selected>
            <Crown />
          </IconButton>
        </Line>
        <Line>
          <IconButton size="small">
            <Home />
          </IconButton>
          <IconButton size="small">
            <Cut />
          </IconButton>
          <IconButton size="small">
            <Crown />
          </IconButton>
          <IconButton size="small" selected>
            <Crown />
          </IconButton>
        </Line>
      </Column>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">In a mini toolbar:</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <MiniToolbar>
        <MiniToolbarText firstChild>Some text:</MiniToolbarText>
        <IconButton>
          <Edit />
        </IconButton>
        <ElementWithMenu
          element={
            <IconButton>
              <Filter />
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

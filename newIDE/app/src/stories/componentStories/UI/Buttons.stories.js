// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import Brush from '@material-ui/icons/Brush';
import FilterList from '@material-ui/icons/FilterList';
import CloudDownload from '@material-ui/icons/CloudDownload';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';
import Home from '../../../UI/CustomSvgIcons/Home';
import Crown from '../../../UI/CustomSvgIcons/Crown';
import Cut from '../../../UI/CustomSvgIcons/Cut';

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
import { Column, Line } from '../../../UI/Grid';

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
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <LineStackLayout noMargin>
      <Text size="block-title">Buttons:</Text>
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
      <Text size="block-title">Buttons with split menus:</Text>
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
      <Text size="block-title">Icons with menu:</Text>
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
      <Text size="block-title">Icons</Text>
    </LineStackLayout>
    <LineStackLayout noMargin>
      <Column expand>
        <Text>A few Material UI icon buttons</Text>
        <Line noMargin>
          <IconButton>
            <Brush />
          </IconButton>
          <IconButton>
            <Brush fontSize="small" />
          </IconButton>
          <IconButton>
            <Delete />
          </IconButton>
          <IconButton>
            <Delete fontSize="small" />
          </IconButton>
          <IconButton>
            <AddCircle />
          </IconButton>
          <IconButton>
            <AddCircle fontSize="small" />
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
            <Home fontSize="small" />
          </IconButton>
          <IconButton>
            <Cut />
          </IconButton>
          <IconButton>
            <Cut fontSize="small" />
          </IconButton>
          <IconButton>
            <Crown />
          </IconButton>
          <IconButton>
            <Crown fontSize="small" />
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

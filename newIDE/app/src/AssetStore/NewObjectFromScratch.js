// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import { Column, Line } from '../UI/Grid';
import { sendNewObjectCreated } from '../Utils/Analytics/EventSender';
import ScrollView from '../UI/ScrollView';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { AssetStoreContext } from './AssetStoreContext';
import { translateExtensionCategory } from '../Utils/Extension/ExtensionCategories';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import TextButton from '../UI/TextButton';
import { t, Trans } from '@lingui/macro';
import LoaderModal from '../UI/LoaderModal';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import AssetsList from './AssetsList';

const ObjectListItem = ({
  enumeratedObjectMetadata,
  onClick,
  id,
}: {|
  enumeratedObjectMetadata: EnumeratedObjectMetadata,
  onClick: () => void,
  id?: string,
|}) => {
  if (enumeratedObjectMetadata.name === '') {
    // Base object is an "abstract" object
    return null;
  }

  // For some reason, iconFileName can sometimes be undefined. see https://github.com/4ian/GDevelop/issues/6094.
  const iconFilename = enumeratedObjectMetadata.iconFilename || '';

  return (
    <ListItem
      id={id}
      leftIcon={<ListIcon src={iconFilename} iconSize={40} isGDevelopIcon />}
      key={enumeratedObjectMetadata.name}
      primaryText={enumeratedObjectMetadata.fullName}
      secondaryText={enumeratedObjectMetadata.description}
      secondaryTextLines={2}
      onClick={onClick}
    />
  );
};

type CustomObjectPackResultsProps = {|
  packTag: string,
  onAssetSelect: (assetShortHeader: AssetShortHeader) => Promise<void>,
  onBack: () => void,
  isAssetBeingInstalled: boolean,
|};

export const CustomObjectPackResults = ({
  packTag,
  onAssetSelect,
  onBack,
  isAssetBeingInstalled,
}: CustomObjectPackResultsProps) => {
  const { useSearchItem, error } = React.useContext(AssetStoreContext);
  // Memoizing the parameters of the search as it seems to trigger infinite rendering if not.
  const chosenCategory: ChosenCategory = React.useMemo(
    () => ({
      node: {
        name: packTag,
        allChildrenTags: [],
        children: [],
      },
      parentNodes: [],
    }),
    [packTag]
  );
  const filters = React.useMemo(() => [], []);
  const selectedAssetPackSearchResults = useSearchItem(
    '',
    chosenCategory,
    null,
    filters
  );

  return (
    <>
      <Column noMargin expand>
        <Line>
          <TextButton
            icon={<ChevronArrowLeft />}
            label={<Trans>Back</Trans>}
            onClick={onBack}
            disabled={isAssetBeingInstalled}
          />
        </Line>
        <AssetsList
          assetShortHeaders={selectedAssetPackSearchResults}
          error={error}
          onOpenDetails={assetShortHeader => {
            if (isAssetBeingInstalled) return;
            onAssetSelect(assetShortHeader);
          }}
        />
      </Column>
      <LoaderModal show={isAssetBeingInstalled} />
    </>
  );
};

const getMergedInstalledWithDefaultEnumeratedObjectMetadataByCategory = ({
  i18n,
  project,
}: {|
  i18n: I18nType,
  project: gdProject,
|}): { [key: string]: Array<EnumeratedObjectMetadata> } => {
  const installedEnumeratedObjectMetadatas = enumerateObjectTypes(project);

  // - Objects with only a name defined are built in, so will be replaced
  //   by the real object metadata when we loop through the installed objects.
  // - Objects with more information are custom objects and may not be installed,
  //   so we add as much info as possible so that the user can see what they are.
  const defaultEnumeratedObjectMetadatasByCategory = {
    [translateExtensionCategory('General', i18n)]: [
      {
        name: 'Sprite',
      },
      {
        name: 'TiledSpriteObject::TiledSprite',
      },
      {
        name: 'PanelSpriteObject::PanelSprite',
      },
      {
        name: 'Scene3D::Cube3DObject',
      },
      {
        name: 'Scene3D::Model3DObject',
      },
    ],
    [translateExtensionCategory('Input', i18n)]: [
      {
        name: 'SpriteMultitouchJoystick::SpriteMultitouchJoystick',
        fullName: i18n._(t`Multitouch Joystick`),
        description: i18n._(t`Joystick for touchscreens.`),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iMTYiIGN5PSIxNiIgcj0iMTMiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjI4LjQsMTIgMjAsMTIgMjAsMy42ICIvPg0KPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iMjAsMjguNCAyMCwyMCAyOC40LDIwICIvPg0KPHBvbHlsaW5lIGNsYXNzPSJzdDAiIHBvaW50cz0iMy42LDIwIDEyLDIwIDEyLDI4LjQgIi8+DQo8cG9seWxpbmUgY2xhc3M9InN0MCIgcG9pbnRzPSIxMiwzLjYgMTIsMTIgMy42LDEyICIvPg0KPHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSIxNiw2IDE2LjcsNyAxNS4zLDcgIi8+DQo8cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjE2LDI2IDE1LjMsMjUgMTYuNywyNSAiLz4NCjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNiwxNiA3LDE1LjMgNywxNi43ICIvPg0KPHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSIyNiwxNiAyNSwxNi43IDI1LDE1LjMgIi8+DQo8L3N2Zz4NCg==',
        assetStorePackTag: 'multitouch joysticks',
        requiredExtensions: [
          {
            extensionName: 'SpriteMultitouchJoystick',
            extensionVersion: '1.0.0',
          },
        ],
      },
    ],
    [translateExtensionCategory('Text', i18n)]: [
      {
        name: 'TextObject::Text',
      },
      {
        name: 'BBText::BBText',
      },
      {
        name: 'BitmapText::BitmapTextObject',
      },
    ],
    [translateExtensionCategory('User interface', i18n)]: [
      {
        name: 'PanelSpriteButton::PanelSpriteButton',
        fullName: i18n._(t`Panel sprite button`),
        description: i18n._(t`Resizable button with text customization.`),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTI5LDIzSDNjLTEuMSwwLTItMC45LTItMlYxMWMwLTEuMSwwLjktMiwyLTJoMjZjMS4xLDAsMiwwLjksMiwydjEwQzMxLDIyLjEsMzAuMSwyMywyOSwyM3oiLz4NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMywxOUwxMywxOWMtMS4xLDAtMi0wLjktMi0ydi0yYzAtMS4xLDAuOS0yLDItMmgwYzEuMSwwLDIsMC45LDIsMnYyQzE1LDE4LjEsMTQuMSwxOSwxMywxOXoiLz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIxOCIgeTE9IjEzIiB4Mj0iMTgiIHkyPSIxOSIvPg0KPGxpbmUgY2xhc3M9InN0MCIgeDE9IjIxIiB5MT0iMTMiIHgyPSIxOCIgeTI9IjE3Ii8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMjEiIHkxPSIxOSIgeDI9IjE5IiB5Mj0iMTYiLz4NCjwvc3ZnPg0K',
        assetStorePackTag: 'menu buttons',
        requiredExtensions: [
          {
            extensionName: 'PanelSpriteButton',
            extensionVersion: '1.0.0',
          },
        ],
      },
      {
        name: 'PanelSpriteSlider::PanelSpriteSlider',
        fullName: i18n._(t`Slider`),
        description: i18n._(
          t`Let users select a numerical value by dragging a slider.`
        ),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iMjMiIGN5PSI3IiByPSIzIi8+DQo8bGluZSBjbGFzcz0ic3QwIiB4MT0iMyIgeTE9IjciIHgyPSIyMCIgeTI9IjciLz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyOSIgeTE9IjciIHgyPSIyNiIgeTI9IjciLz4NCjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjEyIiBjeT0iMTYiIHI9IjMiLz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIzIiB5MT0iMTYiIHgyPSI5IiB5Mj0iMTYiLz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyOSIgeTE9IjE2IiB4Mj0iMTUiIHkyPSIxNiIvPg0KPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iMjMiIGN5PSIyNSIgcj0iMyIvPg0KPGxpbmUgY2xhc3M9InN0MCIgeDE9IjMiIHkxPSIyNSIgeDI9IjIwIiB5Mj0iMjUiLz4NCjxsaW5lIGNsYXNzPSJzdDAiIHgxPSIyOSIgeTE9IjI1IiB4Mj0iMjYiIHkyPSIyNSIvPg0KPC9zdmc+DQo=',
        assetStorePackTag: 'settings ui',
        requiredExtensions: [
          {
            extensionName: 'PanelSpriteSlider',
            extensionVersion: '1.0.0',
          },
        ],
      },
      {
        name: 'SpriteToggleSwitch::SpriteToggleSwitch',
        fullName: i18n._(t`Toggle switch`),
        description: i18n._(t`A toggle switch that users can click or touch.`),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIzLDIzSDljLTMuOSwwLTctMy4xLTctN3YwYzAtMy45LDMuMS03LDctN2gxNGMzLjksMCw3LDMuMSw3LDd2MEMzMCwxOS45LDI2LjksMjMsMjMsMjN6Ii8+DQo8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSI5IiBjeT0iMTYiIHI9IjQiLz4NCjwvc3ZnPg0K',
        assetStorePackTag: 'settings ui',
        requiredExtensions: [
          {
            extensionName: 'SpriteToggleSwitch',
            extensionVersion: '1.0.0',
          },
        ],
      },
      {
        name: 'PanelSpriteContinuousBar::PanelSpriteContinuousBar',
        fullName: i18n._(t`Resource bar (continuous)`),
        description: i18n._(
          t`A bar that represents a resource in the game (health, mana, ammo, etc).`
        ),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMyIDMyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBkPSJNMjgsMTJIMTRINGMtMi4yLDAtNCwxLjgtNCw0czEuOCw0LDQsNGgxMGgxNGMyLjIsMCw0LTEuOCw0LTRTMzAuMiwxMiwyOCwxMnogTTQsMThjLTEuMSwwLTItMC45LTItMnMwLjktMiwyLTJoMTANCgljMS4xLDAsMiwwLjksMiwycy0wLjksMi0yLDJINHoiLz4NCjwvc3ZnPg0K',
        assetStorePackTag: 'resource bars',
        requiredExtensions: [
          {
            extensionName: 'PanelSpriteContinuousBar',
            extensionVersion: '1.0.0',
          },
        ],
      },
      {
        name: 'TiledUnitsBar::TiledUnitsBar',
        fullName: i18n._(t`Resource bar (separated units)`),
        description: i18n._(
          t`A bar that represents a resource in the game (health, mana, ammo, etc).`
        ),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0ibWRpLWRvdHMtaG9yaXpvbnRhbCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik0xNiwxMkEyLDIgMCAwLDEgMTgsMTBBMiwyIDAgMCwxIDIwLDEyQTIsMiAwIDAsMSAxOCwxNEEyLDIgMCAwLDEgMTYsMTJNMTAsMTJBMiwyIDAgMCwxIDEyLDEwQTIsMiAwIDAsMSAxNCwxMkEyLDIgMCAwLDEgMTIsMTRBMiwyIDAgMCwxIDEwLDEyTTQsMTJBMiwyIDAgMCwxIDYsMTBBMiwyIDAgMCwxIDgsMTJBMiwyIDAgMCwxIDYsMTRBMiwyIDAgMCwxIDQsMTJaIiAvPjwvc3ZnPg==',
        assetStorePackTag: 'resource bars',
        requiredExtensions: [
          {
            extensionName: 'TiledUnitsBar',
            extensionVersion: '1.0.0',
          },
        ],
      },
      {
        name: 'TextInput::TextInputObject',
      },
      {
        name: 'Video::VideoObject',
      },
    ],
    [translateExtensionCategory('Visual effect', i18n)]: [
      {
        name: 'Lighting::LightObject',
      },
      {
        name: 'ParticleSystem::ParticleEmitter',
        assetStorePackTag: 'particles emitter',
        requiredExtensions: [],
      },
      {
        name: 'ParticleEmitter3D::ParticleEmitter3D',
        fullName: i18n._(t`3D particle emitter`),
        description: i18n._(
          t`Displays a large number of particles to create visual effects.`
        ),
        iconFilename:
          'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0ibWRpLWZpcmUiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTcuNjYgMTEuMkMxNy40MyAxMC45IDE3LjE1IDEwLjY0IDE2Ljg5IDEwLjM4QzE2LjIyIDkuNzggMTUuNDYgOS4zNSAxNC44MiA4LjcyQzEzLjMzIDcuMjYgMTMgNC44NSAxMy45NSAzQzEzIDMuMjMgMTIuMTcgMy43NSAxMS40NiA0LjMyQzguODcgNi40IDcuODUgMTAuMDcgOS4wNyAxMy4yMkM5LjExIDEzLjMyIDkuMTUgMTMuNDIgOS4xNSAxMy41NUM5LjE1IDEzLjc3IDkgMTMuOTcgOC44IDE0LjA1QzguNTcgMTQuMTUgOC4zMyAxNC4wOSA4LjE0IDEzLjkzQzguMDggMTMuODggOC4wNCAxMy44MyA4IDEzLjc2QzYuODcgMTIuMzMgNi42OSAxMC4yOCA3LjQ1IDguNjRDNS43OCAxMCA0Ljg3IDEyLjMgNSAxNC40N0M1LjA2IDE0Ljk3IDUuMTIgMTUuNDcgNS4yOSAxNS45N0M1LjQzIDE2LjU3IDUuNyAxNy4xNyA2IDE3LjdDNy4wOCAxOS40MyA4Ljk1IDIwLjY3IDEwLjk2IDIwLjkyQzEzLjEgMjEuMTkgMTUuMzkgMjAuOCAxNy4wMyAxOS4zMkMxOC44NiAxNy42NiAxOS41IDE1IDE4LjU2IDEyLjcyTDE4LjQzIDEyLjQ2QzE4LjIyIDEyIDE3LjY2IDExLjIgMTcuNjYgMTEuMk0xNC41IDE3LjVDMTQuMjIgMTcuNzQgMTMuNzYgMTggMTMuNCAxOC4xQzEyLjI4IDE4LjUgMTEuMTYgMTcuOTQgMTAuNSAxNy4yOEMxMS42OSAxNyAxMi40IDE2LjEyIDEyLjYxIDE1LjIzQzEyLjc4IDE0LjQzIDEyLjQ2IDEzLjc3IDEyLjMzIDEzQzEyLjIxIDEyLjI2IDEyLjIzIDExLjYzIDEyLjUgMTAuOTRDMTIuNjkgMTEuMzIgMTIuODkgMTEuNyAxMy4xMyAxMkMxMy45IDEzIDE1LjExIDEzLjQ0IDE1LjM3IDE0LjhDMTUuNDEgMTQuOTQgMTUuNDMgMTUuMDggMTUuNDMgMTUuMjNDMTUuNDYgMTYuMDUgMTUuMSAxNi45NSAxNC41IDE3LjVIMTQuNVoiIC8+PC9zdmc+',
        assetStorePackTag: '3d particles',
        requiredExtensions: [
          {
            extensionName: 'ParticleEmitter3D',
            extensionVersion: '1.0.0',
          },
        ],
      },
    ],
    [translateExtensionCategory('Advanced', i18n)]: [
      {
        name: 'TileMap::TileMap',
      },
      {
        name: 'TileMap::CollisionMask',
      },
      {
        name: 'PrimitiveDrawing::Drawer',
      },
    ],
  };
  installedEnumeratedObjectMetadatas.forEach(
    installedEnumeratedObjectMetadata => {
      const category = translateExtensionCategory(
        installedEnumeratedObjectMetadata.categoryFullName,
        i18n
      );
      defaultEnumeratedObjectMetadatasByCategory[category] =
        defaultEnumeratedObjectMetadatasByCategory[category] || [];
      const objectIndex = defaultEnumeratedObjectMetadatasByCategory[
        category
      ].findIndex(
        enumeratedObjectMetadata =>
          enumeratedObjectMetadata.name ===
          installedEnumeratedObjectMetadata.name
      );

      if (objectIndex !== -1) {
        const currentEnumeratedObjectMetadata =
          defaultEnumeratedObjectMetadatasByCategory[category][objectIndex];
        defaultEnumeratedObjectMetadatasByCategory[category][objectIndex] = {
          ...currentEnumeratedObjectMetadata,
          ...installedEnumeratedObjectMetadata,
        };
      } else {
        defaultEnumeratedObjectMetadatasByCategory[category] = [
          ...defaultEnumeratedObjectMetadatasByCategory[category],
          installedEnumeratedObjectMetadata,
        ];
      }
    }
  );

  return defaultEnumeratedObjectMetadatasByCategory;
};

type Props = {|
  project: gdProject,
  onCreateNewObject: (type: string) => void,
  onCustomObjectSelected: (?EnumeratedObjectMetadata) => void,
  selectedCustomObject: ?EnumeratedObjectMetadata,
  onInstallAsset: (assetShortHeader: AssetShortHeader) => Promise<void>,
  isAssetBeingInstalled: boolean,
  i18n: I18nType,
|};

export default function NewObjectFromScratch({
  project,
  onCreateNewObject,
  onCustomObjectSelected,
  selectedCustomObject,
  onInstallAsset,
  isAssetBeingInstalled,
  i18n,
}: Props) {
  const enumeratedObjectMetadatasByCategory: {
    [string]: Array<EnumeratedObjectMetadata>,
  } = React.useMemo(
    () =>
      getMergedInstalledWithDefaultEnumeratedObjectMetadataByCategory({
        project,
        i18n,
      }),
    [project, i18n]
  );

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-object-types'
  );

  return !selectedCustomObject || !selectedCustomObject.assetStorePackTag ? (
    <ScrollView>
      {DismissableTutorialMessage && (
        <Line>
          <Column expand>{DismissableTutorialMessage}</Column>
        </Line>
      )}
      <List>
        {Object.keys(enumeratedObjectMetadatasByCategory).map(category => {
          const categoryEnumeratedObjectMetadatas =
            enumeratedObjectMetadatasByCategory[category];
          return (
            <React.Fragment key={category}>
              <Subheader>{category}</Subheader>
              {categoryEnumeratedObjectMetadatas.map(
                enumeratedObjectMetadata => (
                  <ObjectListItem
                    key={enumeratedObjectMetadata.name}
                    enumeratedObjectMetadata={enumeratedObjectMetadata}
                    id={`object-category-${
                      enumeratedObjectMetadata.name
                    }`.replace(/:/g, '-')}
                    onClick={() => {
                      sendNewObjectCreated(enumeratedObjectMetadata.name);
                      if (enumeratedObjectMetadata.assetStorePackTag) {
                        // When the object is from an asset store, display the objects from the pack
                        // so that the user can either pick a similar object or skip to create a new one.
                        onCustomObjectSelected(enumeratedObjectMetadata);
                      } else {
                        onCreateNewObject(enumeratedObjectMetadata.name);
                      }
                    }}
                  />
                )
              )}
            </React.Fragment>
          );
        })}
      </List>
    </ScrollView>
  ) : (
    <CustomObjectPackResults
      packTag={selectedCustomObject.assetStorePackTag}
      onAssetSelect={onInstallAsset}
      isAssetBeingInstalled={isAssetBeingInstalled}
      onBack={() => onCustomObjectSelected(null)}
    />
  );
}

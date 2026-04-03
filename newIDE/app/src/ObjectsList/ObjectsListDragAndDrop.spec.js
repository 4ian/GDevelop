// @flow
import * as React from 'react';
import renderer from 'react-test-renderer';
import DroppedFileObjectSelectorOverlay from './DroppedFileObjectSelectorOverlay';
import {
  getDroppedSupportedFile,
  getFileExtension,
  getResourceKindFromExtension,
  getResourceKindFromMimeType,
} from './DroppedFileObjectSelectorUtils';

jest.mock('../UI/ListIcon', () => 'ListIcon');
jest.mock('../UI/Theme/GDevelopThemeContext', () => {
  const React = require('react');
  return React.createContext({
    listItem: {
      selectedBackgroundColor: '#ff8800',
    },
    list: {
      itemsBackgroundColor: '#223344',
    },
    palette: {
      canvasColor: '#0f1014',
    },
    paper: {
      backgroundColor: {
        dark: '#121826',
      },
    },
    text: {
      color: {
        primary: '#ffffff',
      },
    },
  });
});

describe('ObjectsList drag and drop helpers', () => {
  test('extracts the file extension in lowercase', () => {
    expect(getFileExtension('Character.Run.PNG')).toBe('png');
    expect(getFileExtension('archive')).toBe('');
  });

  test('detects supported resource kinds from extension', () => {
    expect(getResourceKindFromExtension('png')).toBe('image');
    expect(getResourceKindFromExtension('glb')).toBe(null);
    expect(getResourceKindFromExtension('wav')).toBe(null);
  });

  test('detects supported resource kinds from mime type', () => {
    expect(getResourceKindFromMimeType('image/webp')).toBe('image');
    expect(getResourceKindFromMimeType('model/gltf-binary')).toBe(null);
    expect(getResourceKindFromMimeType('audio/wav')).toBe(null);
  });

  test('detects a supported dropped file from a file list', () => {
    const droppedFile = getDroppedSupportedFile([
      {
        name: 'hero.webp',
        size: 42,
        path: '/tmp/hero.webp',
      },
    ]);

    expect(droppedFile).toEqual({
      file: {
        name: 'hero.webp',
        size: 42,
        path: '/tmp/hero.webp',
      },
      resourceKind: 'image',
    });
  });

  test('detects a supported dropped file from a data transfer item file', () => {
    const droppedFile = getDroppedSupportedFile({
      0: {
        kind: 'file',
        type: 'image/png',
        getAsFile: () => ({
          name: 'enemy.png',
          size: 10,
        }),
      },
      length: 1,
    });

    expect(droppedFile).toEqual({
      file: {
        name: 'enemy.png',
        size: 10,
      },
      resourceKind: 'image',
    });
  });

  test('returns null for unsupported dropped mime types before the file is available', () => {
    const droppedFile = getDroppedSupportedFile({
      0: {
        kind: 'file',
        type: 'model/gltf-binary',
        getAsFile: () => null,
      },
      length: 1,
    });

    expect(droppedFile).toBe(null);
  });

  test('returns null for unsupported dropped entries', () => {
    expect(
      getDroppedSupportedFile([
        {
          name: 'music.ogg',
        },
      ])
    ).toBe(null);

    expect(
      getDroppedSupportedFile({
        0: {
          kind: 'string',
          type: 'text/plain',
        },
        length: 1,
      })
    ).toBe(null);
  });
});

describe('DroppedFileObjectSelectorOverlay', () => {
  test('renders the radial overlay with highlighted and non-highlighted options', () => {
    const component = renderer.create(
      <DroppedFileObjectSelectorOverlay
        optionMarkers={[
          {
            objectType: 'Sprite',
            iconUrl: 'sprite-icon.png',
            label: 'Sprite',
            left: '50%',
            top: '14%',
          },
          {
            objectType: 'PanelSpriteObject::PanelSprite',
            iconUrl: 'panel-icon.png',
            label: 'Panel Sprite',
            left: '82%',
            top: '68%',
          },
          {
            objectType: 'TiledSpriteObject::TiledSprite',
            iconUrl: 'tiled-icon.png',
            label: 'Tiled Sprite',
            left: '18%',
            top: '68%',
          },
        ]}
        highlightedObjectType="PanelSpriteObject::PanelSprite"
        isLoading={false}
      />
    );

    const iconNodes = component.root.findAllByType('ListIcon');
    expect(iconNodes).toHaveLength(3);
    expect(iconNodes.map(node => node.props.src)).toEqual([
      'sprite-icon.png',
      'panel-icon.png',
      'tiled-icon.png',
    ]);

    const optionNodes = component.root.findAll(
      node => node.props.style && node.props.style.width === 96
    );
    expect(optionNodes).toHaveLength(3);

    const highlightedOption = optionNodes.find(
      node => node.props.style.left === '82%'
    );
    const nonHighlightedOptions = optionNodes.filter(
      node => node.props.style.left !== '82%'
    );

    expect(highlightedOption).toBeDefined();
    expect(highlightedOption && highlightedOption.props.style.opacity).toBe(1);
    expect(nonHighlightedOptions.map(node => node.props.style.opacity)).toEqual(
      [0.78, 0.78]
    );

    const radialBackground = component.root.find(
      node =>
        node.props.style && typeof node.props.style.background === 'string'
    );
    expect(radialBackground.props.style.background).toContain('#223344');
    expect(radialBackground.props.style.background).toContain('#ff8800');
    expect(radialBackground.props.style.opacity).toBe(0.88);
  });
});

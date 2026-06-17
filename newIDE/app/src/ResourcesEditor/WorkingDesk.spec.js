// @noflow
import fs from 'fs';
import path from 'path';
import React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import IconButton from '../UI/IconButton';
import WorkingDesk from './WorkingDesk';
import {
  formatImageZoomFactor,
  getNextImageZoomFactor,
  getWorkingDeskImageZoomStyles,
  shouldShowWorkingDeskImageZoomToolbar,
} from './WorkingDeskZoomUtils';

jest.mock('../UI/SoundPlayer', () => () => null);
jest.mock('../ResourcesList/ResourcePreview', () => () => null);
jest.mock('../UI/IconButton', () => {
  const React = require('react');
  return function MockIconButton(props) {
    return React.createElement(
      'button',
      {
        disabled: props.disabled,
        onClick: props.onClick,
      },
      props.children
    );
  };
});

describe('WorkingDesk', () => {
  it('uses readable white text in the Markdown preview', () => {
    const css = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.css'),
      'utf8'
    );

    expect(css).toMatch(
      /\.resources-markdown-preview\s*\{[^}]*color:\s*#fff;/i
    );
  });

  it('keeps the Markdown preview contained inside the working desk', () => {
    const css = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.css'),
      'utf8'
    );
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toMatch(/markdownContainer:\s*\{[\s\S]*minWidth:\s*0,/i);
    expect(source).toMatch(
      /markdownContainer:\s*\{[\s\S]*overflow:\s*'hidden',/i
    );
    expect(css).toMatch(
      /\.resources-markdown-preview\s*\{[^}]*overflow:\s*auto;/i
    );
    expect(css).toMatch(
      /\.resources-markdown-preview \.gd-markdown\s*\{[^}]*width:\s*100%;/i
    );
    expect(css).toMatch(
      /\.resources-markdown-preview \.gd-markdown\s*\{[^}]*overflow-wrap:\s*anywhere;/i
    );
    expect(css).toMatch(
      /\.resources-markdown-preview \.gd-markdown code\s*\{[^}]*overflow-wrap:\s*anywhere;/i
    );
  });

  it('steps and clamps image zoom factors', () => {
    expect(getNextImageZoomFactor(1, 'in')).toBe(1.25);
    expect(getNextImageZoomFactor(1, 'out')).toBe(0.75);
    expect(getNextImageZoomFactor(4, 'in')).toBe(4);
    expect(getNextImageZoomFactor(0.25, 'out')).toBe(0.25);
    expect(formatImageZoomFactor(1.25)).toBe('125%');
  });

  it('shows the zoom toolbar only for image files', () => {
    const imageNode = {
      type: 'file',
      name: 'coin.png',
      extension: '.png',
      absolutePath: 'D:\\Project\\coin.png',
      relativePath: 'coin.png',
    };
    const markdownNode = {
      ...imageNode,
      name: 'notes.md',
      extension: '.md',
    };
    const folderNode = {
      ...imageNode,
      type: 'folder',
      name: 'assets',
      extension: '',
    };

    expect(shouldShowWorkingDeskImageZoomToolbar(imageNode)).toBe(true);
    expect(shouldShowWorkingDeskImageZoomToolbar(markdownNode)).toBe(false);
    expect(shouldShowWorkingDeskImageZoomToolbar(folderNode)).toBe(false);
    expect(shouldShowWorkingDeskImageZoomToolbar(null)).toBe(false);
  });

  it('updates the image zoom factor when pressing the zoom controls', () => {
    const imageNode = {
      id: 'coin',
      type: 'file',
      name: 'coin.png',
      extension: '.png',
      absolutePath: 'D:\\Project\\coin.png',
      relativePath: 'coin.png',
    };
    let component;
    act(() => {
      component = renderer.create(
        <WorkingDesk
          project={{}}
          resourcesLoader={{}}
          selectedItem={{ node: imageNode, resource: null }}
          toolTabUpdate={null}
          onProjectFilesChanged={jest.fn()}
        />
      );
    });

    expect(JSON.stringify(component.toJSON())).toContain('100%');

    const iconButtons = component.root.findAllByType(IconButton);
    const zoomInButton = iconButtons[iconButtons.length - 1];
    act(() => {
      zoomInButton.props.onClick();
    });

    expect(JSON.stringify(component.toJSON())).toContain('125%');
  });

  it('applies the zoom factor to both the image scroll extent and image itself', () => {
    expect(getWorkingDeskImageZoomStyles(1, null)).toEqual({
      canvas: {
        width: '100%',
        height: '100%',
      },
      image: {
        width: 'auto',
        height: 'auto',
      },
    });
    expect(
      getWorkingDeskImageZoomStyles(1, { width: 1200, height: 800 })
    ).toEqual({
      canvas: {
        width: '1232px',
        height: '832px',
      },
      image: {
        width: '1200px',
        height: '800px',
      },
    });
    expect(
      getWorkingDeskImageZoomStyles(1.25, { width: 1200, height: 800 })
    ).toEqual({
      canvas: {
        width: '1532px',
        height: '1032px',
      },
      image: {
        width: '1500px',
        height: '1000px',
      },
    });
    expect(
      getWorkingDeskImageZoomStyles(0.75, { width: 1200, height: 800 })
    ).toEqual({
      canvas: {
        width: '932px',
        height: '632px',
      },
      image: {
        width: '900px',
        height: '600px',
      },
    });
  });

  it('keeps image previews at natural size by default', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toMatch(/image:\s*\{[\s\S]*height:\s*'auto',/i);
    expect(source).toMatch(/image:\s*\{[\s\S]*width:\s*'auto',/i);
    expect(source).toMatch(/image:\s*\{[\s\S]*maxWidth:\s*'none',/i);
    expect(source).toMatch(/image:\s*\{[\s\S]*maxHeight:\s*'none',/i);
    expect(source).toContain('setImageNaturalSize');
    expect(source).toContain('naturalWidth');
    expect(source).not.toMatch(/image:\s*\{[^}]*height:\s*'100%',/i);
  });

  it('keeps the zoomed image canvas from shrinking back to the viewport', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toMatch(/imageZoomCanvas:\s*\{[\s\S]*flexShrink:\s*0,/i);
  });

  it('uses a block scroll viewport so image previews can overflow vertically', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );
    const imageScrollAreaStyle = source.slice(
      source.indexOf('imageScrollArea:'),
      source.indexOf('imageZoomCanvas:')
    );

    expect(imageScrollAreaStyle).toContain("display: 'block'");
    expect(imageScrollAreaStyle).toContain("height: '100%'");
    expect(imageScrollAreaStyle).toContain("overflow: 'auto'");
    expect(imageScrollAreaStyle).not.toContain("display: 'flex'");
  });

  it('allows oversized image previews to be panned by dragging', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toContain('imageScrollAreaRef');
    expect(source).toContain('handleImagePointerDown');
    expect(source).toContain('handleImagePointerMove');
    expect(source).toContain('scrollArea.scrollLeft =');
    expect(source).toContain('scrollArea.scrollTop =');
    expect(source).toContain('setPointerCapture');
    expect(source).toContain('releasePointerCapture');
    expect(source).toContain('onPointerDown={handleImagePointerDown}');
    expect(source).toContain('onPointerMove={handleImagePointerMove}');
    expect(source).toContain('draggable="false"');
  });

  it('zooms image previews with the mouse wheel', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toContain('handleImageWheel');
    expect(source).toContain('onWheel={handleImageWheel}');
    expect(source).toContain('event.deltaY < 0 ?');
    expect(source).toContain('setImageZoomFactor(nextZoomFactor)');
    expect(source).toContain('window.requestAnimationFrame');
  });

  it('handles images as single files without auto-detecting sprite sequences', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).not.toContain('detectSequenceFrames');
    expect(source).not.toContain('sequenceFrames');
    expect(source).not.toContain('currentFrameIndex');
    expect(source).not.toContain('isPlayingSequence');
    expect(source).not.toContain('sequenceFps');
    expect(source).not.toContain('Play animation');
    expect(source).not.toContain('Pause animation');
    expect(source).not.toContain('<Trans>FPS</Trans>');
  });

  it('uses closable tabs as the working desk container', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toContain("from '../UI/ClosableTabs'");
    expect(source).toContain('<ClosableTabs');
    expect(source).toContain('<ClosableTab');
  });

  it('clips working desk tabs inside the working desk bounds', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toMatch(/container:\s*\{[\s\S]*minWidth:\s*0,/i);
    expect(source).toMatch(/container:\s*\{[\s\S]*overflow:\s*'hidden',/i);
    expect(source).toMatch(/tabsBar:\s*\{[\s\S]*minWidth:\s*0,/i);
    expect(source).toMatch(/tabsBar:\s*\{[\s\S]*maxWidth:\s*'100%',/i);
    expect(source).toMatch(/tabsBar:\s*\{[\s\S]*overflow:\s*'hidden',/i);
  });

  it('does not render a separate working desk title header above tabs', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).not.toContain('<Trans>Working desk</Trans>');
    expect(source).not.toContain('style={styles.header}');
    expect(source).not.toContain('style={styles.headerActions}');
  });

  it('opens working desk tabs only for selected files and tool task updates', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toContain('toolTabUpdate');
    expect(source).toContain("selectedItem.node.type !== 'file'");
    expect(source).toContain("'nano-banana'");
    expect(source).toContain("'elevenlabs-audio'");
    expect(source).toContain("'local-image'");
  });

  it('uses white text for HTTP request and response details', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'WorkingDesk.js'),
      'utf8'
    );

    expect(source).toMatch(/debugSummary:\s*\{[\s\S]*color:\s*'#fff'/);
    expect(source).toMatch(/debugPre:\s*\{[\s\S]*color:\s*'#fff'/);
  });
});

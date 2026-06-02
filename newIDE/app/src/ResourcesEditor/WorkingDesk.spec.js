// @noflow
import fs from 'fs';
import path from 'path';
import {
  formatImageZoomFactor,
  getNextImageZoomFactor,
  shouldShowWorkingDeskImageZoomToolbar,
} from './WorkingDeskZoomUtils';

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

    expect(source).toMatch(
      /markdownContainer:\s*\{[\s\S]*minWidth:\s*0,/i
    );
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
});

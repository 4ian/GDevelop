// @flow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  archiveStickyNote,
  closeStickyNote,
  createStickyNote,
  deleteArchivedStickyNotes,
  getActiveStickyNotes,
  getArchivedStickyNotes,
  getNextStickyNoteFontSize,
  getOpenStickyNotes,
  getStickyNoteClipboardText,
  getStickyNotePreview,
  getStickyNotesFilePath,
  loadStickyNotesFromProject,
  normalizeStickyNotes,
  openStickyNote,
  saveStickyNotesToProject,
  setStickyNotePinned,
  unpinAllStickyNotes,
  type StickyNote,
} from './index';

const makeStickyNote = (partialNote?: $Shape<StickyNote>): StickyNote => ({
  id: 'note-1',
  title: 'Todo',
  body: 'Tune the jump',
  color: 'yellow',
  fontSize: 'normal',
  textStyle: 'normal',
  x: 24,
  y: 24,
  width: 280,
  height: 220,
  isOpen: true,
  isArchived: false,
  createdAt: 1,
  updatedAt: 1,
  zIndex: 1,
  ...partialNote,
});

describe('StickyNotes', () => {
  it('normalizes persisted notes and filters invalid data', () => {
    expect(
      normalizeStickyNotes({
        notes: [
          {
            id: 'saved-note',
            title: 'Saved',
            body: 'From disk',
            color: 'blue',
            fontSize: 'large',
            textStyle: 'bold',
            x: 42,
            y: 64,
            width: 300,
            height: 230,
            isOpen: false,
            isArchived: true,
            createdAt: 10,
            updatedAt: 12,
            zIndex: 4,
          },
          null,
        ],
      })
    ).toEqual([
      {
        id: 'saved-note',
        title: 'Saved',
        body: 'From disk',
        color: 'blue',
        fontSize: 'large',
        textStyle: 'bold',
        x: 42,
        y: 64,
        width: 300,
        height: 230,
        isOpen: false,
        isArchived: true,
        createdAt: 10,
        updatedAt: 12,
        zIndex: 4,
      },
    ]);
  });

  it('creates notes inside the visible editor bounds', () => {
    expect(
      createStickyNote([], {
        now: 100,
        bounds: { width: 260, height: 180 },
      })
    ).toEqual({
      id: 'sticky-note-100-0',
      title: '',
      body: '',
      color: 'yellow',
      fontSize: 'normal',
      textStyle: 'normal',
      x: 8,
      y: 8,
      width: 280,
      height: 220,
      isOpen: true,
      isArchived: false,
      createdAt: 100,
      updatedAt: 100,
      zIndex: 1,
    });
  });

  it('creates notes on the right side and vertically centered by default', () => {
    expect(
      createStickyNote([], {
        now: 100,
        bounds: { width: 1000, height: 800 },
      })
    ).toEqual({
      id: 'sticky-note-100-0',
      title: '',
      body: '',
      color: 'yellow',
      fontSize: 'normal',
      textStyle: 'normal',
      x: 712,
      y: 290,
      width: 280,
      height: 220,
      isOpen: true,
      isArchived: false,
      createdAt: 100,
      updatedAt: 100,
      zIndex: 1,
    });
  });

  it('separates open, active and archived notes', () => {
    const openNote = makeStickyNote({ id: 'open', updatedAt: 4, zIndex: 2 });
    const closedNote = makeStickyNote({
      id: 'closed',
      isOpen: false,
      updatedAt: 8,
      zIndex: 1,
    });
    const archivedNote = makeStickyNote({
      id: 'archived',
      isArchived: true,
      updatedAt: 12,
      zIndex: 3,
    });

    expect(getOpenStickyNotes([closedNote, archivedNote, openNote])).toEqual([
      openNote,
    ]);
    expect(getActiveStickyNotes([openNote, closedNote, archivedNote])).toEqual([
      closedNote,
      openNote,
    ]);
    expect(
      getArchivedStickyNotes([openNote, closedNote, archivedNote])
    ).toEqual([archivedNote]);
  });

  it('closes, archives and restores notes without losing their content', () => {
    const notes = [makeStickyNote()];

    expect(closeStickyNote(notes, 'note-1', 2)[0]).toEqual({
      ...notes[0],
      isOpen: false,
      updatedAt: 2,
    });
    expect(archiveStickyNote(notes, 'note-1', 3)[0]).toEqual({
      ...notes[0],
      isOpen: false,
      isArchived: true,
      updatedAt: 3,
    });
    expect(
      openStickyNote(
        archiveStickyNote(notes, 'note-1', 3),
        'note-1',
        null,
        4
      )[0]
    ).toEqual({
      ...notes[0],
      isOpen: true,
      isArchived: false,
      updatedAt: 4,
      zIndex: 2,
    });
  });

  it('pins notes without changing their list order metadata', () => {
    const olderNote = makeStickyNote({
      id: 'older',
      isOpen: false,
      updatedAt: 1,
      zIndex: 1,
    });
    const newerNote = makeStickyNote({
      id: 'newer',
      updatedAt: 2,
      zIndex: 2,
    });

    const pinnedNotes = setStickyNotePinned(
      [olderNote, newerNote],
      'older',
      true
    );

    expect(pinnedNotes[0]).toEqual({
      ...olderNote,
      isOpen: true,
    });
    expect(getActiveStickyNotes(pinnedNotes).map(note => note.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('un-pins all open notes without archiving them', () => {
    const openNote = makeStickyNote({
      id: 'open',
      isOpen: true,
      isArchived: false,
    });
    const closedNote = makeStickyNote({
      id: 'closed',
      isOpen: false,
      isArchived: false,
    });
    const archivedOpenNote = makeStickyNote({
      id: 'archived-open',
      isOpen: true,
      isArchived: true,
    });

    expect(
      unpinAllStickyNotes([openNote, closedNote, archivedOpenNote])
    ).toEqual([
      {
        ...openNote,
        isOpen: false,
      },
      closedNote,
      {
        ...archivedOpenNote,
        isOpen: false,
      },
    ]);
  });

  it('deletes all archived notes while keeping active notes', () => {
    const openNote = makeStickyNote({
      id: 'open',
      isOpen: true,
      isArchived: false,
    });
    const closedNote = makeStickyNote({
      id: 'closed',
      isOpen: false,
      isArchived: false,
    });
    const archivedNote = makeStickyNote({
      id: 'archived',
      isOpen: false,
      isArchived: true,
    });

    expect(
      deleteArchivedStickyNotes([openNote, closedNote, archivedNote])
    ).toEqual([openNote, closedNote]);
  });

  it('keeps floating previews readable and copies only the note body', () => {
    const stickyNote = makeStickyNote({
      title: 'Combat tuning',
      body:
        'Increase enemy cooldown before the second attack animation.\nKeep the warning readable.',
    });

    expect(getStickyNotePreview(stickyNote)).toBe(
      'Increase enemy cooldown before the second attack animation.\nKeep the warning readable.'
    );
    expect(getStickyNoteClipboardText(stickyNote)).toBe(
      'Increase enemy cooldown before the second attack animation.\nKeep the warning readable.'
    );
  });

  it('steps sticky note font sizes within the supported range', () => {
    expect(getNextStickyNoteFontSize('normal', 'larger')).toBe('large');
    expect(getNextStickyNoteFontSize('large', 'larger')).toBe('large');
    expect(getNextStickyNoteFontSize('normal', 'smaller')).toBe('small');
    expect(getNextStickyNoteFontSize('small', 'smaller')).toBe('small');
  });

  it('stores notes in a dedicated project sidecar json file', () => {
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'gdevelop-sticky-notes-')
    );
    const project = {
      getProjectFile: () => path.join(temporaryDirectory, 'game.json'),
    };

    try {
      saveStickyNotesToProject(project, [makeStickyNote()]);

      const stickyNotesFilePath = getStickyNotesFilePath(project);
      expect(stickyNotesFilePath).toBe(
        path.join(temporaryDirectory, '.gdevelop-sticky-notes.json')
      );
      expect(
        JSON.parse(fs.readFileSync(stickyNotesFilePath || '', 'utf8')).version
      ).toBe(1);
      expect(loadStickyNotesFromProject(project)).toEqual([makeStickyNote()]);
    } finally {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });

  it('does not store notes when the project has no project file yet', () => {
    const project = {
      getProjectFile: () => '',
    };

    expect(getStickyNotesFilePath(project)).toBe(null);
    expect(() =>
      saveStickyNotesToProject(project, [makeStickyNote()])
    ).not.toThrow();
    expect(loadStickyNotesFromProject(project)).toEqual([]);
  });

  it('keeps the internal notes json out of the resources file tree', () => {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        '..',
        'ResourcesEditor',
        'ProjectFilesPanel.js'
      ),
      'utf8'
    );

    expect(source).toContain(
      "const ignoredFileNames = new Set(['.gdevelop-sticky-notes.json']);"
    );
    expect(source).toContain('ignoredFileNames.has(name)');
  });
});

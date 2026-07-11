// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import BuildIcon from '@material-ui/icons/Build';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import Dialog from '../../UI/Dialog';
import IconButton from '../../UI/IconButton';
import Text from '../../UI/Text';
import TextButton from '../../UI/TextButton';
import { Tabs } from '../../UI/Tabs';
import AddIcon from '../../UI/CustomSvgIcons/Add';
import ArchiveIcon from '../../UI/CustomSvgIcons/Archive';
import CopyIcon from '../../UI/CustomSvgIcons/Copy';
import PinIcon from '../../UI/CustomSvgIcons/Pin';
import RestoreIcon from '../../UI/CustomSvgIcons/Restore';
import TrashIcon from '../../UI/CustomSvgIcons/Trash';
import { copyTextToClipboard } from '../../Utils/Clipboard';
import optionalRequire from '../../Utils/OptionalRequire';
import classes from './StickyNotes.module.css';

const stickyNotesDataVersion = 1;
export const stickyNotesDirectoryName = '.gdevelop';
export const stickyNotesFileName = 'sticky-notes.json';
const defaultNoteWidth = 280;
const defaultNoteHeight = 220;
const noteBoundsMargin = 8;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export type StickyNoteColor =
  | 'yellow'
  | 'orange'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';
export type StickyNoteFontSize = 'small' | 'normal' | 'large';
export type StickyNoteTextStyle = 'normal' | 'bold' | 'italic';
export type StickyNotesManagerTab = 'active' | 'archived';
type CreateStickyNoteOptions = {| showManager?: boolean |};

export type StickyNote = {|
  id: string,
  title: string,
  body: string,
  color: StickyNoteColor,
  fontSize: StickyNoteFontSize,
  textStyle: StickyNoteTextStyle,
  x: number,
  y: number,
  width: number,
  height: number,
  isOpen: boolean,
  isArchived: boolean,
  createdAt: number,
  updatedAt: number,
  zIndex: number,
|};

export type StickyNotesInterface = {|
  createNote: (options?: CreateStickyNoteOptions) => void,
  showManager: () => void,
|};

type StickyNotesBounds = {|
  width: number,
  height: number,
|};

type Props = {|
  project: gdProject,
  isManagerShown: boolean,
  onManagerShownChange: boolean => void,
|};

type ManagerNoteListProps = {|
  notes: Array<StickyNote>,
  isArchived: boolean,
  selectedNoteId: ?string,
  onSelect: string => void,
  onTogglePin: string => void,
  onArchive: string => void,
  onRestore: string => void,
  onDelete: string => void,
|};

const stickyNoteColors: Array<StickyNoteColor> = [
  'yellow',
  'orange',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
  'gray',
];
const stickyNoteFontSizes: Array<StickyNoteFontSize> = [
  'small',
  'normal',
  'large',
];
const stickyNoteTextStyles: Array<StickyNoteTextStyle> = [
  'normal',
  'bold',
  'italic',
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const isStickyNoteColor = (color: any): boolean =>
  stickyNoteColors.includes(color);

const isStickyNoteFontSize = (fontSize: any): boolean =>
  stickyNoteFontSizes.includes(fontSize);

const isStickyNoteTextStyle = (textStyle: any): boolean =>
  stickyNoteTextStyles.includes(textStyle);

const getNumberOrDefault = (
  value: any,
  defaultValue: number,
  min?: number
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return defaultValue;
  return typeof min === 'number' ? Math.max(value, min) : value;
};

export const getStickyNotesFilePath = (project: any): ?string => {
  if (!path || !project || typeof project.getProjectFile !== 'function') {
    return null;
  }

  const projectFile = project.getProjectFile();
  return projectFile
    ? path.join(
        path.dirname(projectFile),
        stickyNotesDirectoryName,
        stickyNotesFileName
      )
    : null;
};

export const normalizeStickyNotes = (
  rawStickyNotesData: any
): Array<StickyNote> => {
  const rawNotes = Array.isArray(rawStickyNotesData)
    ? rawStickyNotesData
    : rawStickyNotesData && Array.isArray(rawStickyNotesData.notes)
    ? rawStickyNotesData.notes
    : [];

  return rawNotes
    .filter(rawNote => rawNote && typeof rawNote === 'object')
    .map((rawNote, index) => {
      const now =
        typeof rawNote.updatedAt === 'number'
          ? rawNote.updatedAt
          : Date.now() + index;
      return {
        id:
          typeof rawNote.id === 'string' && rawNote.id
            ? rawNote.id
            : `sticky-note-${now}-${index}`,
        title: typeof rawNote.title === 'string' ? rawNote.title : '',
        body: typeof rawNote.body === 'string' ? rawNote.body : '',
        color: isStickyNoteColor(rawNote.color) ? rawNote.color : 'yellow',
        fontSize: isStickyNoteFontSize(rawNote.fontSize)
          ? rawNote.fontSize
          : 'normal',
        textStyle: isStickyNoteTextStyle(rawNote.textStyle)
          ? rawNote.textStyle
          : 'normal',
        x: getNumberOrDefault(rawNote.x, 24),
        y: getNumberOrDefault(rawNote.y, 24),
        width: getNumberOrDefault(rawNote.width, defaultNoteWidth, 220),
        height: getNumberOrDefault(rawNote.height, defaultNoteHeight, 160),
        isOpen: typeof rawNote.isOpen === 'boolean' ? rawNote.isOpen : true,
        isArchived:
          typeof rawNote.isArchived === 'boolean' ? rawNote.isArchived : false,
        createdAt:
          typeof rawNote.createdAt === 'number' ? rawNote.createdAt : now,
        updatedAt: now,
        zIndex: getNumberOrDefault(rawNote.zIndex, index + 1, 1),
      };
    });
};

export const loadStickyNotesFromProject = (project: any): Array<StickyNote> => {
  if (!fs) return [];

  const stickyNotesFilePath = getStickyNotesFilePath(project);
  if (!stickyNotesFilePath || !fs.existsSync(stickyNotesFilePath)) return [];

  try {
    const serializedStickyNotes = fs.readFileSync(stickyNotesFilePath, 'utf8');
    return normalizeStickyNotes(JSON.parse(serializedStickyNotes));
  } catch (error) {
    console.warn('Unable to load sticky notes:', error);
    return [];
  }
};

export const saveStickyNotesToProject = (
  project: any,
  stickyNotes: Array<StickyNote>
) => {
  if (!fs) return;

  const stickyNotesFilePath = getStickyNotesFilePath(project);
  if (!stickyNotesFilePath) return;

  try {
    fs.mkdirSync(path.dirname(stickyNotesFilePath), { recursive: true });
    fs.writeFileSync(
      stickyNotesFilePath,
      JSON.stringify(
        {
          version: stickyNotesDataVersion,
          notes: stickyNotes,
        },
        null,
        2
      ),
      'utf8'
    );
  } catch (error) {
    console.warn('Unable to save sticky notes:', error);
  }
};

export const getStickyNoteTitle = (stickyNote: StickyNote): string => {
  const title = stickyNote.title.trim();
  if (title) return title;

  const firstBodyLine = stickyNote.body
    .split('\n')
    .map(line => line.trim())
    .find(line => !!line);
  if (!firstBodyLine) return 'Untitled note';

  return firstBodyLine.length > 48
    ? `${firstBodyLine.slice(0, 45)}...`
    : firstBodyLine;
};

export const getStickyNotePreview = (stickyNote: StickyNote): string => {
  const preview = stickyNote.body.trim();
  if (!preview) return 'No content yet.';

  return preview;
};

export const getStickyNoteClipboardText = (stickyNote: StickyNote): string => {
  return stickyNote.body.trim();
};

export const getActiveStickyNotes = (
  stickyNotes: Array<StickyNote>
): Array<StickyNote> =>
  stickyNotes
    .filter(stickyNote => !stickyNote.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

export const getArchivedStickyNotes = (
  stickyNotes: Array<StickyNote>
): Array<StickyNote> =>
  stickyNotes
    .filter(stickyNote => stickyNote.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

export const getOpenStickyNotes = (
  stickyNotes: Array<StickyNote>
): Array<StickyNote> =>
  stickyNotes
    .filter(stickyNote => !stickyNote.isArchived && stickyNote.isOpen)
    .sort((a, b) => a.zIndex - b.zIndex);

const getNextStickyNoteZIndex = (stickyNotes: Array<StickyNote>): number =>
  stickyNotes.reduce(
    (highestZIndex, stickyNote) => Math.max(highestZIndex, stickyNote.zIndex),
    0
  ) + 1;

const getNextStickyNoteColor = (
  stickyNotes: Array<StickyNote>
): StickyNoteColor =>
  stickyNoteColors[stickyNotes.length % stickyNoteColors.length];

const getDefaultStickyNotePosition = (
  stickyNotes: Array<StickyNote>,
  bounds: ?StickyNotesBounds
): {| x: number, y: number |} => {
  const offset =
    stickyNotes.filter(stickyNote => !stickyNote.isArchived).length % 8;
  const offsetX = offset * 28;
  const offsetY = offset * 22;

  if (!bounds) {
    return {
      x: 24 + offsetX,
      y: 24 + offsetY,
    };
  }

  return {
    x: bounds.width - defaultNoteWidth - noteBoundsMargin + offsetX,
    y: (bounds.height - defaultNoteHeight) / 2 + offsetY,
  };
};

export const clampStickyNotePosition = (
  stickyNote: StickyNote,
  bounds: ?StickyNotesBounds
): StickyNote => {
  if (!bounds) return stickyNote;

  const maxX = Math.max(
    noteBoundsMargin,
    bounds.width - stickyNote.width - noteBoundsMargin
  );
  const maxY = Math.max(
    noteBoundsMargin,
    bounds.height - stickyNote.height - noteBoundsMargin
  );
  return {
    ...stickyNote,
    x: clamp(stickyNote.x, noteBoundsMargin, maxX),
    y: clamp(stickyNote.y, noteBoundsMargin, maxY),
  };
};

export const createStickyNote = (
  stickyNotes: Array<StickyNote>,
  options?: {| now?: number, bounds?: ?StickyNotesBounds |}
): StickyNote => {
  const now =
    options && typeof options.now === 'number' ? options.now : Date.now();
  const bounds = options ? options.bounds : null;
  const position = getDefaultStickyNotePosition(stickyNotes, bounds);
  return clampStickyNotePosition(
    {
      id: `sticky-note-${now}-${stickyNotes.length}`,
      title: '',
      body: '',
      color: getNextStickyNoteColor(stickyNotes),
      fontSize: 'normal',
      textStyle: 'normal',
      x: position.x,
      y: position.y,
      width: defaultNoteWidth,
      height: defaultNoteHeight,
      isOpen: true,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      zIndex: getNextStickyNoteZIndex(stickyNotes),
    },
    bounds
  );
};

export const bringStickyNoteToFront = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string,
  now?: number
): Array<StickyNote> => {
  const nextZIndex = getNextStickyNoteZIndex(stickyNotes);
  const updatedAt = typeof now === 'number' ? now : Date.now();
  return stickyNotes.map(stickyNote =>
    stickyNote.id === stickyNoteId
      ? { ...stickyNote, zIndex: nextZIndex, updatedAt }
      : stickyNote
  );
};

export const openStickyNote = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string,
  bounds?: ?StickyNotesBounds,
  now?: number
): Array<StickyNote> => {
  const nextZIndex = getNextStickyNoteZIndex(stickyNotes);
  const updatedAt = typeof now === 'number' ? now : Date.now();
  return stickyNotes.map(stickyNote => {
    if (stickyNote.id !== stickyNoteId) return stickyNote;

    return clampStickyNotePosition(
      {
        ...stickyNote,
        isOpen: true,
        isArchived: false,
        updatedAt,
        zIndex: nextZIndex,
      },
      bounds || null
    );
  });
};

export const closeStickyNote = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string,
  now?: number
): Array<StickyNote> => {
  const updatedAt = typeof now === 'number' ? now : Date.now();
  return stickyNotes.map(stickyNote =>
    stickyNote.id === stickyNoteId
      ? { ...stickyNote, isOpen: false, updatedAt }
      : stickyNote
  );
};

export const setStickyNotePinned = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string,
  isOpen: boolean,
  bounds?: ?StickyNotesBounds
): Array<StickyNote> =>
  stickyNotes.map(stickyNote => {
    if (stickyNote.id !== stickyNoteId) return stickyNote;

    const updatedStickyNote = {
      ...stickyNote,
      isOpen,
      isArchived: isOpen ? false : stickyNote.isArchived,
    };
    return isOpen
      ? clampStickyNotePosition(updatedStickyNote, bounds || null)
      : updatedStickyNote;
  });

export const unpinAllStickyNotes = (
  stickyNotes: Array<StickyNote>
): Array<StickyNote> =>
  stickyNotes.map(stickyNote =>
    stickyNote.isOpen ? { ...stickyNote, isOpen: false } : stickyNote
  );

export const archiveStickyNote = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string,
  now?: number
): Array<StickyNote> => {
  const updatedAt = typeof now === 'number' ? now : Date.now();
  return stickyNotes.map(stickyNote =>
    stickyNote.id === stickyNoteId
      ? {
          ...stickyNote,
          isOpen: false,
          isArchived: true,
          updatedAt,
        }
      : stickyNote
  );
};

export const deleteStickyNote = (
  stickyNotes: Array<StickyNote>,
  stickyNoteId: string
): Array<StickyNote> =>
  stickyNotes.filter(stickyNote => stickyNote.id !== stickyNoteId);

export const deleteArchivedStickyNotes = (
  stickyNotes: Array<StickyNote>
): Array<StickyNote> =>
  stickyNotes.filter(stickyNote => !stickyNote.isArchived);

const getNoteColorClassName = (color: StickyNoteColor): string => {
  switch (color) {
    case 'orange':
      return classes.noteOrange;
    case 'blue':
      return classes.noteBlue;
    case 'purple':
      return classes.notePurple;
    case 'green':
      return classes.noteGreen;
    case 'teal':
      return classes.noteTeal;
    case 'pink':
      return classes.notePink;
    case 'gray':
      return classes.noteGray;
    case 'yellow':
    default:
      return classes.noteYellow;
  }
};

const getNoteBodyFontSizeClassName = (fontSize: StickyNoteFontSize): string => {
  switch (fontSize) {
    case 'small':
      return classes.noteBodySmall;
    case 'large':
      return classes.noteBodyLarge;
    case 'normal':
    default:
      return classes.noteBodyNormal;
  }
};

const getNoteBodyTextStyleClassName = (
  textStyle: StickyNoteTextStyle
): string => {
  switch (textStyle) {
    case 'bold':
      return classes.noteBodyBold;
    case 'italic':
      return classes.noteBodyItalic;
    case 'normal':
    default:
      return classes.noteBodyRegular;
  }
};

export const getNextStickyNoteFontSize = (
  fontSize: StickyNoteFontSize,
  direction: 'smaller' | 'larger'
): StickyNoteFontSize => {
  const currentIndex = stickyNoteFontSizes.indexOf(fontSize);
  const nextIndex =
    direction === 'larger'
      ? Math.min(stickyNoteFontSizes.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
  return stickyNoteFontSizes[nextIndex];
};

const ManagerNoteList = ({
  notes,
  isArchived,
  selectedNoteId,
  onSelect,
  onTogglePin,
  onArchive,
  onRestore,
  onDelete,
}: ManagerNoteListProps): React.Node => {
  if (!notes.length) {
    return (
      <div className={classes.managerEmptyState}>
        <Text noMargin color="secondary">
          {isArchived ? (
            <Trans>No archived notes.</Trans>
          ) : (
            <Trans>No active notes.</Trans>
          )}
        </Text>
      </div>
    );
  }

  return (
    <div className={classes.managerList}>
      {notes.map(stickyNote => (
        <div
          key={stickyNote.id}
          className={`${classes.managerListItem} ${
            stickyNote.id === selectedNoteId
              ? classes.managerListItemSelected
              : ''
          }`}
        >
          <button
            type="button"
            className={classes.managerListItemSummary}
            onClick={() => onSelect(stickyNote.id)}
          >
            <span
              className={`${classes.noteColorSwatch} ${getNoteColorClassName(
                stickyNote.color
              )}`}
            />
            <span className={classes.managerListItemText}>
              <span className={classes.managerListItemTitle}>
                {getStickyNoteTitle(stickyNote)}
              </span>
              <span className={classes.managerListItemPreview}>
                {getStickyNotePreview(stickyNote)}
              </span>
            </span>
          </button>
          <div className={classes.managerListItemActions}>
            {isArchived ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => onRestore(stickyNote.id)}
                  tooltip={t`Restore note`}
                >
                  <RestoreIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(stickyNote.id)}
                  tooltip={t`Delete note`}
                >
                  <TrashIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={() => onTogglePin(stickyNote.id)}
                  tooltip={
                    stickyNote.isOpen
                      ? t`Hide sticky note`
                      : t`Show sticky note`
                  }
                  selected={stickyNote.isOpen}
                >
                  <PinIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onArchive(stickyNote.id)}
                  tooltip={t`Archive note`}
                >
                  <ArchiveIcon />
                </IconButton>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const StickyNotes: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<StickyNotesInterface>,
}> = React.forwardRef<Props, StickyNotesInterface>(
  ({ project, isManagerShown, onManagerShownChange }: Props, ref) => {
    const [stickyNotes, setStickyNotes] = React.useState<Array<StickyNote>>(
      () => loadStickyNotesFromProject(project)
    );
    const [managerTab, setManagerTab] = React.useState<StickyNotesManagerTab>(
      'active'
    );
    const [editingNoteId, setEditingNoteId] = React.useState<?string>(null);
    const containerRef = React.useRef<?HTMLDivElement>(null);

    React.useEffect(
      () => {
        setStickyNotes(loadStickyNotesFromProject(project));
      },
      [project]
    );

    const getContainerBounds = React.useCallback((): ?StickyNotesBounds => {
      const container = containerRef.current;
      if (!container) return null;

      return {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    }, []);

    const setAndPersistStickyNotes = React.useCallback(
      (
        updater: Array<StickyNote> | ((Array<StickyNote>) => Array<StickyNote>)
      ) => {
        setStickyNotes(currentStickyNotes => {
          const nextStickyNotes =
            typeof updater === 'function'
              ? updater(currentStickyNotes)
              : updater;
          saveStickyNotesToProject(project, nextStickyNotes);
          return nextStickyNotes;
        });
      },
      [project]
    );

    const createNote = React.useCallback(
      (options?: CreateStickyNoteOptions) => {
        setManagerTab('active');
        setAndPersistStickyNotes(currentStickyNotes => {
          const stickyNote = createStickyNote(currentStickyNotes, {
            bounds: getContainerBounds(),
          });
          setEditingNoteId(stickyNote.id);
          if (!options || options.showManager !== false) {
            onManagerShownChange(true);
          }
          return [...currentStickyNotes, stickyNote];
        });
      },
      [getContainerBounds, onManagerShownChange, setAndPersistStickyNotes]
    );

    const showManager = React.useCallback(
      () => {
        onManagerShownChange(true);
      },
      [onManagerShownChange]
    );

    const closeManager = React.useCallback(
      (event?: any) => {
        if (event && typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }

        onManagerShownChange(false);
      },
      [onManagerShownChange]
    );

    const openManagerForNote = React.useCallback(
      (stickyNoteId: string) => {
        setManagerTab('active');
        setEditingNoteId(stickyNoteId);
        onManagerShownChange(true);
      },
      [onManagerShownChange]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        createNote,
        showManager,
      }),
      [createNote, showManager]
    );

    const updateNote = React.useCallback(
      (stickyNoteId: string, updater: StickyNote => StickyNote) => {
        setAndPersistStickyNotes(currentStickyNotes =>
          currentStickyNotes.map(stickyNote =>
            stickyNote.id === stickyNoteId ? updater(stickyNote) : stickyNote
          )
        );
      },
      [setAndPersistStickyNotes]
    );

    const handleTogglePinNote = React.useCallback(
      (stickyNoteId: string) => {
        setAndPersistStickyNotes(currentStickyNotes => {
          const stickyNote = currentStickyNotes.find(
            stickyNote => stickyNote.id === stickyNoteId
          );
          return setStickyNotePinned(
            currentStickyNotes,
            stickyNoteId,
            stickyNote ? !stickyNote.isOpen : true,
            getContainerBounds()
          );
        });
      },
      [getContainerBounds, setAndPersistStickyNotes]
    );

    const handleUnpinAllNotes = React.useCallback(
      () => {
        setAndPersistStickyNotes(currentStickyNotes =>
          unpinAllStickyNotes(currentStickyNotes)
        );
      },
      [setAndPersistStickyNotes]
    );

    const handleDeleteAllArchivedNotes = React.useCallback(
      () => {
        setAndPersistStickyNotes(currentStickyNotes =>
          deleteArchivedStickyNotes(currentStickyNotes)
        );
      },
      [setAndPersistStickyNotes]
    );

    const handleSelectNote = React.useCallback((stickyNoteId: string) => {
      setEditingNoteId(stickyNoteId);
    }, []);

    const handleArchiveNote = React.useCallback(
      (stickyNoteId: string) => {
        setAndPersistStickyNotes(currentStickyNotes =>
          archiveStickyNote(currentStickyNotes, stickyNoteId)
        );
      },
      [setAndPersistStickyNotes]
    );

    const handleRestoreNote = React.useCallback(
      (stickyNoteId: string) => {
        setManagerTab('active');
        setEditingNoteId(stickyNoteId);
        setAndPersistStickyNotes(currentStickyNotes =>
          openStickyNote(currentStickyNotes, stickyNoteId, getContainerBounds())
        );
      },
      [getContainerBounds, setAndPersistStickyNotes]
    );

    const handleDeleteNote = React.useCallback(
      (stickyNoteId: string) => {
        if (stickyNoteId === editingNoteId) setEditingNoteId(null);
        setAndPersistStickyNotes(currentStickyNotes =>
          deleteStickyNote(currentStickyNotes, stickyNoteId)
        );
      },
      [editingNoteId, setAndPersistStickyNotes]
    );

    const handleCopyNote = React.useCallback((stickyNote: StickyNote) => {
      copyTextToClipboard(getStickyNoteClipboardText(stickyNote)).catch(
        error => {
          console.warn('Unable to copy sticky note:', error);
        }
      );
    }, []);

    const bringNoteToFront = React.useCallback(
      (stickyNoteId: string) => {
        setAndPersistStickyNotes(currentStickyNotes =>
          bringStickyNoteToFront(currentStickyNotes, stickyNoteId)
        );
      },
      [setAndPersistStickyNotes]
    );

    const startNoteDrag = React.useCallback(
      (event: SyntheticMouseEvent<HTMLElement>, stickyNote: StickyNote) => {
        if (event.button !== 0) return;

        event.preventDefault();
        event.stopPropagation();
        bringNoteToFront(stickyNote.id);

        const bounds = getContainerBounds();
        const eventDocument = event.currentTarget.ownerDocument || document;
        const startClientX = event.clientX;
        const startClientY = event.clientY;
        const startX = stickyNote.x;
        const startY = stickyNote.y;

        const onMouseMove = (mouseEvent: MouseEvent) => {
          const x = startX + mouseEvent.clientX - startClientX;
          const y = startY + mouseEvent.clientY - startClientY;
          updateNote(stickyNote.id, currentStickyNote =>
            clampStickyNotePosition(
              {
                ...currentStickyNote,
                x,
                y,
                updatedAt: Date.now(),
              },
              bounds
            )
          );
        };

        const onMouseUp = () => {
          eventDocument.removeEventListener('mousemove', onMouseMove);
          eventDocument.removeEventListener('mouseup', onMouseUp);
        };

        eventDocument.addEventListener('mousemove', onMouseMove);
        eventDocument.addEventListener('mouseup', onMouseUp);
      },
      [bringNoteToFront, getContainerBounds, updateNote]
    );

    const updateNoteColor = React.useCallback(
      (stickyNoteId: string, color: StickyNoteColor) => {
        updateNote(stickyNoteId, currentStickyNote => ({
          ...currentStickyNote,
          color,
          updatedAt: Date.now(),
        }));
      },
      [updateNote]
    );

    const updateNoteFontSize = React.useCallback(
      (stickyNoteId: string, direction: 'smaller' | 'larger') => {
        updateNote(stickyNoteId, currentStickyNote => ({
          ...currentStickyNote,
          fontSize: getNextStickyNoteFontSize(
            currentStickyNote.fontSize,
            direction
          ),
          updatedAt: Date.now(),
        }));
      },
      [updateNote]
    );

    const updateNoteTextStyle = React.useCallback(
      (stickyNoteId: string, textStyle: StickyNoteTextStyle) => {
        updateNote(stickyNoteId, currentStickyNote => ({
          ...currentStickyNote,
          textStyle:
            currentStickyNote.textStyle === textStyle ? 'normal' : textStyle,
          updatedAt: Date.now(),
        }));
      },
      [updateNote]
    );

    const openStickyNotes = getOpenStickyNotes(stickyNotes);
    const activeStickyNotes = getActiveStickyNotes(stickyNotes);
    const archivedStickyNotes = getArchivedStickyNotes(stickyNotes);
    const managerNotes =
      managerTab === 'active' ? activeStickyNotes : archivedStickyNotes;
    const selectedManagerNote = editingNoteId
      ? managerNotes.find(stickyNote => stickyNote.id === editingNoteId)
      : null;
    const editedStickyNote = selectedManagerNote || managerNotes[0] || null;
    const selectedNoteId = editedStickyNote ? editedStickyNote.id : null;

    return (
      <>
        {isManagerShown && (
          <Dialog
            title={
              <span className={classes.managerTitle}>
                <span>
                  <Trans>Sticky notes</Trans>
                </span>
                <TextButton
                  icon={<AddIcon />}
                  label={<Trans>Add note</Trans>}
                  onClick={() => createNote()}
                  style={{ marginLeft: 16 }}
                />
                <TextButton
                  icon={<PinIcon />}
                  label={<Trans>Un-pin all</Trans>}
                  onClick={handleUnpinAllNotes}
                  disabled={!openStickyNotes.length}
                />
                <TextButton
                  icon={<TrashIcon />}
                  label={<Trans>Delete all archived</Trans>}
                  onClick={handleDeleteAllArchivedNotes}
                  disabled={!archivedStickyNotes.length}
                />
              </span>
            }
            open={isManagerShown}
            onRequestClose={closeManager}
            flexBody
            disableContentScroll
            maxWidth="md"
            id="sticky-notes-dialog"
          >
            <div className={classes.managerBody}>
              <div className={classes.managerSidebar}>
                <Tabs
                  value={managerTab}
                  onChange={setManagerTab}
                  options={[
                    {
                      label: (
                        <>
                          <Trans>Active</Trans> ({activeStickyNotes.length})
                        </>
                      ),
                      value: 'active',
                    },
                    {
                      label: (
                        <>
                          <Trans>Archived</Trans> ({archivedStickyNotes.length})
                        </>
                      ),
                      value: 'archived',
                    },
                  ]}
                />
                <ManagerNoteList
                  notes={managerNotes}
                  isArchived={managerTab === 'archived'}
                  selectedNoteId={selectedNoteId}
                  onSelect={handleSelectNote}
                  onTogglePin={handleTogglePinNote}
                  onArchive={handleArchiveNote}
                  onRestore={handleRestoreNote}
                  onDelete={handleDeleteNote}
                />
              </div>
              <div className={classes.managerEditor}>
                {editedStickyNote ? (
                  <I18n>
                    {({ i18n }) => (
                      <>
                        <input
                          className={classes.managerEditorTitleInput}
                          value={editedStickyNote.title}
                          placeholder={i18n._(t`Untitled note`)}
                          onChange={event => {
                            const title = event.currentTarget.value;
                            updateNote(
                              editedStickyNote.id,
                              currentStickyNote => ({
                                ...currentStickyNote,
                                title,
                                updatedAt: Date.now(),
                              })
                            );
                          }}
                        />
                        <div className={classes.managerEditorToolbar}>
                          <div className={classes.managerEditorPalette}>
                            {stickyNoteColors.map(color => (
                              <button
                                key={color}
                                type="button"
                                className={`${
                                  classes.notePaletteButton
                                } ${getNoteColorClassName(color)} ${
                                  editedStickyNote.color === color
                                    ? classes.notePaletteButtonSelected
                                    : ''
                                }`}
                                aria-label={`Use ${color} note color`}
                                onClick={() =>
                                  updateNoteColor(editedStickyNote.id, color)
                                }
                              />
                            ))}
                          </div>
                          <div className={classes.managerEditorTextActions}>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyNote(editedStickyNote)}
                              tooltip={t`Copy note`}
                            >
                              <CopyIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateNoteFontSize(
                                  editedStickyNote.id,
                                  'smaller'
                                )
                              }
                              tooltip={t`Smaller text`}
                            >
                              <span className={classes.noteTextTool}>A-</span>
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateNoteFontSize(
                                  editedStickyNote.id,
                                  'larger'
                                )
                              }
                              tooltip={t`Larger text`}
                            >
                              <span className={classes.noteTextTool}>A+</span>
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateNoteTextStyle(editedStickyNote.id, 'bold')
                              }
                              tooltip={t`Bold`}
                              selected={editedStickyNote.textStyle === 'bold'}
                            >
                              <span className={classes.noteTextToolBold}>
                                B
                              </span>
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateNoteTextStyle(
                                  editedStickyNote.id,
                                  'italic'
                                )
                              }
                              tooltip={t`Italic`}
                              selected={editedStickyNote.textStyle === 'italic'}
                            >
                              <span className={classes.noteTextToolItalic}>
                                I
                              </span>
                            </IconButton>
                          </div>
                        </div>
                        <textarea
                          className={`${
                            classes.managerEditorBodyInput
                          } ${getNoteBodyFontSizeClassName(
                            editedStickyNote.fontSize
                          )} ${getNoteBodyTextStyleClassName(
                            editedStickyNote.textStyle
                          )}`}
                          value={editedStickyNote.body}
                          placeholder={i18n._(t`Write a note...`)}
                          onChange={event => {
                            const body = event.currentTarget.value;
                            updateNote(
                              editedStickyNote.id,
                              currentStickyNote => ({
                                ...currentStickyNote,
                                body,
                                updatedAt: Date.now(),
                              })
                            );
                          }}
                        />
                      </>
                    )}
                  </I18n>
                ) : (
                  <div className={classes.managerEditorEmptyState}>
                    <Text noMargin color="secondary">
                      <Trans>Select or create a sticky note.</Trans>
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Dialog>
        )}
        <div className={classes.notesLayer} ref={containerRef}>
          {openStickyNotes.map(stickyNote => (
            <div
              key={stickyNote.id}
              className={`${classes.note} ${getNoteColorClassName(
                stickyNote.color
              )}`}
              style={{
                left: stickyNote.x,
                top: stickyNote.y,
                width: stickyNote.width,
                height: stickyNote.height,
                zIndex: 20 + stickyNote.zIndex,
              }}
              onMouseDown={() => bringNoteToFront(stickyNote.id)}
            >
              <div className={classes.noteHeader}>
                <I18n>
                  {({ i18n }) => (
                    <input
                      className={classes.noteTitleInput}
                      value={stickyNote.title}
                      placeholder={i18n._(t`Untitled note`)}
                      onMouseDown={event => event.stopPropagation()}
                      onFocus={() => bringNoteToFront(stickyNote.id)}
                      onChange={event => {
                        const title = event.currentTarget.value;
                        updateNote(stickyNote.id, currentStickyNote => ({
                          ...currentStickyNote,
                          title,
                          updatedAt: Date.now(),
                        }));
                      }}
                    />
                  )}
                </I18n>
                <div
                  className={classes.noteHeaderActions}
                  onMouseDown={event => event.stopPropagation()}
                  onDoubleClick={event => event.stopPropagation()}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopyNote(stickyNote)}
                    tooltip={t`Copy note`}
                    className={classes.noteIconButton}
                  >
                    <CopyIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleTogglePinNote(stickyNote.id)}
                    tooltip={t`Hide sticky note`}
                    className={classes.noteIconButton}
                  >
                    <PinIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => openManagerForNote(stickyNote.id)}
                    tooltip={t`Edit sticky note`}
                    className={classes.noteIconButton}
                  >
                    <BuildIcon className={classes.noteWrenchIcon} />
                  </IconButton>
                  <button
                    type="button"
                    className={classes.noteDragButton}
                    aria-label="Drag sticky note"
                    onMouseDown={event => startNoteDrag(event, stickyNote)}
                    onDoubleClick={event => event.stopPropagation()}
                  >
                    <OpenWithIcon className={classes.noteDragIcon} />
                  </button>
                </div>
              </div>
              <I18n>
                {({ i18n }) => (
                  <textarea
                    className={`${
                      classes.noteBodyInput
                    } ${getNoteBodyFontSizeClassName(
                      stickyNote.fontSize
                    )} ${getNoteBodyTextStyleClassName(stickyNote.textStyle)}`}
                    value={stickyNote.body}
                    placeholder={i18n._(t`Write a note...`)}
                    onMouseDown={event => event.stopPropagation()}
                    onFocus={() => bringNoteToFront(stickyNote.id)}
                    onChange={event => {
                      const body = event.currentTarget.value;
                      updateNote(stickyNote.id, currentStickyNote => ({
                        ...currentStickyNote,
                        body,
                        updatedAt: Date.now(),
                      }));
                    }}
                  />
                )}
              </I18n>
            </div>
          ))}
        </div>
      </>
    );
  }
);

export default StickyNotes;

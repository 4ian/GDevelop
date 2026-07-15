// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import AddIcon from '../UI/CustomSvgIcons/Add';
import CopyIcon from '../UI/CustomSvgIcons/Copy';
import DownloadIcon from '../UI/CustomSvgIcons/Download';
import FileWithLinesIcon from '../UI/CustomSvgIcons/FileWithLines';
import MinimizeIcon from '../UI/CustomSvgIcons/Minimize';
import SearchIcon from '../UI/CustomSvgIcons/Search';
import SettingsIcon from '../UI/CustomSvgIcons/Settings';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import UploadIcon from '../UI/CustomSvgIcons/Upload';
import { copyTextToClipboard } from '../Utils/Clipboard';
import {
  parseStaticDataFromToml,
  serializeStaticDataToToml,
} from '../ProjectsStorage/MultiFileProjectFormat';

type StaticDataRoot = { [string]: any };
type RawEditorMode = 'json' | 'toml';
type SelectedCell = {|
  sheetName: string,
  rowKey: string,
  columnKey?: string,
|};

type Props = {|
  project: gdProject,
  open?: boolean,
  onApply?: () => void,
  onCancel?: () => void,
  embedded?: boolean,
  onChange?: (staticData: StaticDataRoot) => void,
|};

const gridMinColumnWidth = 80;
const gridMaxColumnWidth = 300;
const gridCellHorizontalPadding = 22;
const gridHeaderActionWidth = 42;

let textMeasurementCanvas: ?HTMLCanvasElement = null;

const measureGridTextWidth = (text: any): number => {
  if (text === undefined || text === null) return 0;

  const textValue = String(text);
  if (!textValue) return 0;
  if (typeof document === 'undefined') return textValue.length * 8;

  if (!textMeasurementCanvas) {
    textMeasurementCanvas = document.createElement('canvas');
  }

  const context = textMeasurementCanvas.getContext('2d');
  if (!context) return textValue.length * 8;

  context.font = '600 16px sans-serif';
  return textValue
    .split(/\r?\n/)
    .reduce(
      (widestLineWidth, line) =>
        Math.max(widestLineWidth, context.measureText(line).width),
      0
    );
};

const clampGridColumnWidth = (width: number): number =>
  Math.max(gridMinColumnWidth, Math.min(gridMaxColumnWidth, Math.ceil(width)));

const clampRowKeyColumnWidth = (width: number): number =>
  Math.max(gridMinColumnWidth, Math.ceil(width));

const makeColumnWidthStyle = (width: number): Object => ({
  width,
  minWidth: width,
  maxWidth: width,
});

const styles: { [string]: Object } = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: '100%',
    width: '100%',
    backgroundColor: '#1f232b',
    color: '#f5f7fb',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexShrink: 0,
    padding: '10px 14px',
    borderBottom: '1px solid #3b4452',
    backgroundColor: '#252b35',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    minWidth: 160,
    height: 34,
    border: '1px solid #4d5868',
    borderRadius: 4,
    backgroundColor: '#1f242d',
    color: '#aeb7c4',
    padding: '0 10px',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    backgroundColor: 'transparent',
    font: 'inherit',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  hiddenFileInput: {
    display: 'none',
  },
  sheetPanel: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    margin: 12,
    border: '1px solid #3d4654',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#242934',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.28)',
  },
  tabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    flexShrink: 0,
    overflowX: 'auto',
    padding: '3px 10px 0 10px',
    borderBottom: '1px solid #3d4654',
    backgroundColor: '#222832',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    border: 'none',
    borderBottom: '2px solid transparent',
    borderRadius: '4px 4px 0 0',
    color: '#aeb7c4',
    backgroundColor: 'transparent',
    padding: '4px 10px 5px 10px',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 600,
    minHeight: 28,
    whiteSpace: 'nowrap',
  },
  tabNameInput: {
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    color: 'inherit',
    backgroundColor: 'transparent',
    padding: 0,
    font: 'inherit',
    fontWeight: 'inherit',
    lineHeight: '20px',
  },
  selectedTab: {
    color: '#ffffff',
    borderBottomColor: '#62a8ff',
    backgroundColor: '#2d3542',
  },
  addSheetTab: {
    flexShrink: 0,
    marginBottom: 0,
  },
  gridScroller: {
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
    backgroundColor: '#1d222b',
  },
  table: {
    borderCollapse: 'collapse',
    width: 'max-content',
    tableLayout: 'fixed',
  },
  cornerCell: {
    position: 'sticky',
    left: 0,
    top: 0,
    zIndex: 3,
    boxSizing: 'border-box',
    height: 38,
    backgroundColor: '#303846',
    borderRight: '1px solid #465064',
    borderBottom: '1px solid #465064',
    color: '#f5f7fb',
    padding: '0 10px',
    fontWeight: 600,
    textAlign: 'left',
  },
  cornerCellContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
    height: '100%',
    position: 'relative',
  },
  cornerCellLabel: {
    whiteSpace: 'nowrap',
    paddingRight: 28,
  },
  addRowButton: {
    position: 'absolute',
    top: '50%',
    right: -4,
    transform: 'translateY(-50%)',
  },
  columnHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    height: 38,
    backgroundColor: '#303846',
    borderRight: '1px solid #465064',
    borderBottom: '1px solid #465064',
    color: '#f5f7fb',
    padding: '0 6px 0 10px',
    fontWeight: 600,
    textAlign: 'left',
  },
  columnHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minWidth: 0,
  },
  columnName: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    color: 'inherit',
    backgroundColor: 'transparent',
    padding: 0,
    font: 'inherit',
    fontWeight: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionHeader: {
    position: 'sticky',
    top: 0,
    right: 0,
    zIndex: 3,
    width: 44,
    minWidth: 44,
    height: 38,
    backgroundColor: '#303846',
    borderBottom: '1px solid #465064',
    color: '#f5f7fb',
    padding: 0,
  },
  rowHeader: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    boxSizing: 'border-box',
    height: 36,
    backgroundColor: '#272e3a',
    borderRight: '1px solid #465064',
    borderBottom: '1px solid #394252',
    color: '#f3f3f7',
    padding: '0 10px',
    fontWeight: 600,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  rowNameLabel: {
    display: 'block',
    whiteSpace: 'nowrap',
  },
  rowNameInput: {
    width: '100%',
    minWidth: 0,
    border: 'none',
    outline: 'none',
    color: 'inherit',
    backgroundColor: 'transparent',
    padding: 0,
    font: 'inherit',
    fontWeight: 'inherit',
    whiteSpace: 'nowrap',
  },
  cell: {
    borderRight: '1px solid #394252',
    borderBottom: '1px solid #394252',
    height: 36,
    padding: 0,
    backgroundColor: '#222832',
  },
  selectedCell: {
    outline: '2px solid #62a8ff',
    outlineOffset: -2,
    backgroundColor: '#273449',
  },
  actionCell: {
    position: 'sticky',
    right: 0,
    zIndex: 1,
    width: 44,
    minWidth: 44,
    height: 36,
    padding: 0,
    textAlign: 'center',
    backgroundColor: '#242b36',
    borderBottom: '1px solid #394252',
  },
  input: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    backgroundColor: 'transparent',
    padding: '0 10px',
    font: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pathBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    flexShrink: 0,
    padding: '9px 12px',
    borderTop: '1px solid #3d4654',
    backgroundColor: '#242a35',
  },
  pathLabel: {
    color: '#aeb7c4',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '16px',
  },
  code: {
    color: '#ffffff',
    backgroundColor: '#171b22',
    border: '1px solid #3f4b5d',
    borderRadius: 4,
    padding: '4px 7px',
    fontFamily: 'monospace',
    fontSize: 12,
    overflowWrap: 'anywhere',
    maxWidth: '100%',
  },
  rawToggleSpacer: {
    flex: 1,
    minWidth: 12,
  },
  rawPanel: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 1 42%',
    minHeight: 128,
    borderTop: '1px solid #3d4654',
    padding: '10px 12px 12px 12px',
    backgroundColor: '#202631',
    overflow: 'hidden',
  },
  rawHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    gap: 8,
    marginBottom: 8,
  },
  rawTextArea: {
    width: '100%',
    flex: 1,
    minHeight: 80,
    boxSizing: 'border-box',
    resize: 'none',
    border: '1px solid #4d5868',
    borderRadius: 4,
    color: '#ffffff',
    backgroundColor: '#151922',
    padding: 8,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: '18px',
  },
  rawFooter: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
    marginTop: 8,
  },
  error: {
    color: '#ff8d8d',
  },
  emptyState: {
    padding: 24,
  },
};

const isPlainObject = (value: any): boolean =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const readProjectStaticData = (project: gdProject): StaticDataRoot => {
  const projectWithStaticData: any = project;
  const json =
    typeof projectWithStaticData.getStaticDataJson === 'function'
      ? projectWithStaticData.getStaticDataJson()
      : '{}';

  try {
    const parsed = JSON.parse(json || '{}');
    return isPlainObject(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
};

const parseCellValue = (text: string): any => {
  const trimmedText = text.trim();
  if (trimmedText === '') return '';
  if (trimmedText === 'true') return true;
  if (trimmedText === 'false') return false;
  if (trimmedText === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmedText)) return Number(trimmedText);

  const firstCharacter = trimmedText[0];
  if (
    firstCharacter === '{' ||
    firstCharacter === '[' ||
    firstCharacter === '"'
  ) {
    try {
      return JSON.parse(trimmedText);
    } catch (error) {
      return text;
    }
  }

  return text;
};

const formatCellValue = (value: any): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    return '';
  }
};

const getUniqueName = (
  baseName: string,
  existingNames: $ReadOnlyArray<string>
): string => {
  if (!existingNames.includes(baseName)) return baseName;

  let index = 2;
  while (existingNames.includes(baseName + index)) {
    index++;
  }
  return baseName + index;
};

const getRowKeys = (sheet: any): Array<string> => {
  if (Array.isArray(sheet)) return sheet.map((_, index) => String(index));
  if (isPlainObject(sheet)) return ((Object.keys(sheet): any): Array<string>);
  return [];
};

const getColumnKeys = (sheet: any, rowKeys: Array<string>): Array<string> => {
  const columns: Set<string> = new Set();
  rowKeys.forEach(rowKey => {
    const rowValue = Array.isArray(sheet)
      ? sheet[Number(rowKey)]
      : sheet[rowKey];
    if (isPlainObject(rowValue)) {
      Object.keys(rowValue).forEach(columnName => columns.add(columnName));
    } else {
      columns.add('value');
    }
  });
  return Array.from(columns);
};

const formatPathSegment = (
  segment: string,
  isFirstSegment: boolean
): string => {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(segment)) {
    return isFirstSegment ? segment : '.' + segment;
  }

  return '["' + segment.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';
};

const getSelectedPath = (
  selectedCell: ?SelectedCell,
  staticData: StaticDataRoot
) => {
  if (!selectedCell) return '';
  const sheet = staticData[selectedCell.sheetName];
  const rowValue = Array.isArray(sheet)
    ? sheet[Number(selectedCell.rowKey)]
    : isPlainObject(sheet)
    ? sheet[selectedCell.rowKey]
    : undefined;
  const columnKey = selectedCell.columnKey;
  const columnPath = columnKey
    ? columnKey === 'value' && !isPlainObject(rowValue)
      ? ''
      : formatPathSegment(columnKey, false)
    : '';

  return (
    formatPathSegment(selectedCell.sheetName, true) +
    (Array.isArray(sheet)
      ? '[' + selectedCell.rowKey + ']'
      : formatPathSegment(selectedCell.rowKey, false)) +
    columnPath
  );
};

const getSelectedRowJson = (
  selectedCell: ?SelectedCell,
  staticData: StaticDataRoot
): string => {
  if (!selectedCell || selectedCell.columnKey) return '';

  const sheet = staticData[selectedCell.sheetName];
  const rowValue = Array.isArray(sheet)
    ? sheet[Number(selectedCell.rowKey)]
    : isPlainObject(sheet)
    ? sheet[selectedCell.rowKey]
    : undefined;
  if (rowValue === undefined) return '';

  try {
    return JSON.stringify(rowValue).trim();
  } catch (error) {
    return '';
  }
};

const StaticDataDialog = ({
  project,
  open = true,
  onApply = () => {},
  onCancel = () => {},
  embedded = false,
  onChange,
}: Props): React.Node => {
  const [staticData, setStaticData] = React.useState<StaticDataRoot>(() =>
    readProjectStaticData(project)
  );
  const [selectedSheet, setSelectedSheet] = React.useState<string>(() => {
    const staticData = readProjectStaticData(project);
    return Object.keys(staticData)[0] || '';
  });
  const [selectedCell, setSelectedCell] = React.useState<?SelectedCell>(null);
  const [searchText, setSearchText] = React.useState('');
  const [rawJson, setRawJson] = React.useState(() =>
    JSON.stringify(readProjectStaticData(project), null, 2)
  );
  const [rawJsonError, setRawJsonError] = React.useState('');
  const [rawToml, setRawToml] = React.useState(() => {
    try {
      return serializeStaticDataToToml(readProjectStaticData(project));
    } catch (error) {
      return '';
    }
  });
  const [rawTomlError, setRawTomlError] = React.useState('');
  const [rawEditorMode, setRawEditorMode] = React.useState<?RawEditorMode>(
    null
  );
  const [isMinimized, setIsMinimized] = React.useState(false);
  const importInputRef = React.useRef<?HTMLInputElement>(null);

  const commitStaticData = React.useCallback(
    (nextStaticData: StaticDataRoot) => {
      setStaticData(nextStaticData);
      if (!embedded) return;

      const projectWithStaticData: any = project;
      projectWithStaticData.setStaticDataJson(JSON.stringify(nextStaticData));
      if (onChange) onChange(nextStaticData);
    },
    [embedded, onChange, project]
  );

  const sheetNames = React.useMemo(() => Object.keys(staticData), [staticData]);
  const sheet: any = selectedSheet ? staticData[selectedSheet] : null;
  const rowKeys: Array<string> = React.useMemo(() => getRowKeys(sheet), [
    sheet,
  ]);
  const columnKeys: Array<string> = React.useMemo(
    () => getColumnKeys(sheet, rowKeys),
    [rowKeys, sheet]
  );
  const normalizedSearchText = searchText.trim().toLowerCase();
  const visibleRowKeys: Array<string> = React.useMemo(
    () => {
      if (!normalizedSearchText) return rowKeys;

      return rowKeys.filter(rowKey => {
        const rowValue = Array.isArray(sheet)
          ? sheet[Number(rowKey)]
          : sheet[rowKey];
        const rowTextParts = [selectedSheet, rowKey, ...columnKeys];

        if (isPlainObject(rowValue)) {
          Object.keys(rowValue).forEach(columnKey => {
            rowTextParts.push(columnKey);
            rowTextParts.push(formatCellValue(rowValue[columnKey]));
          });
        } else {
          rowTextParts.push(formatCellValue(rowValue));
        }

        return (
          rowTextParts
            .join(' ')
            .toLowerCase()
            .indexOf(normalizedSearchText) !== -1
        );
      });
    },
    [columnKeys, normalizedSearchText, rowKeys, selectedSheet, sheet]
  );
  const rowKeyColumnWidth = React.useMemo(
    () => {
      const headerWidth =
        measureGridTextWidth(t`Row key`) + gridCellHorizontalPadding;
      const widestRowKeyWidth = rowKeys.reduce(
        (widestWidth, rowKey) =>
          Math.max(
            widestWidth,
            measureGridTextWidth(rowKey) + gridCellHorizontalPadding
          ),
        headerWidth
      );

      return clampRowKeyColumnWidth(widestRowKeyWidth);
    },
    [rowKeys]
  );
  const columnWidths: { [string]: number } = React.useMemo(
    () => {
      const widths: { [string]: number } = {};

      columnKeys.forEach(columnKey => {
        let widestWidth =
          measureGridTextWidth(columnKey) +
          gridCellHorizontalPadding +
          gridHeaderActionWidth;

        visibleRowKeys.forEach(rowKey => {
          const rowValue = Array.isArray(sheet)
            ? sheet[Number(rowKey)]
            : sheet[rowKey];
          const value =
            columnKey === 'value' && !isPlainObject(rowValue)
              ? rowValue
              : isPlainObject(rowValue)
              ? rowValue[columnKey]
              : undefined;

          widestWidth = Math.max(
            widestWidth,
            measureGridTextWidth(formatCellValue(value)) +
              gridCellHorizontalPadding
          );
        });

        widths[columnKey] = clampGridColumnWidth(widestWidth);
      });

      return widths;
    },
    [columnKeys, sheet, visibleRowKeys]
  );

  React.useEffect(
    () => {
      if (!selectedSheet || !staticData[selectedSheet]) {
        setSelectedSheet(sheetNames[0] || '');
      }
    },
    [staticData, selectedSheet, sheetNames]
  );

  React.useEffect(
    () => {
      setRawJson(JSON.stringify(staticData, null, 2));
      try {
        setRawToml(serializeStaticDataToToml(staticData));
        setRawTomlError('');
      } catch (error) {
        setRawToml('');
        setRawTomlError(error.message);
      }
    },
    [staticData]
  );

  const addSheet = React.useCallback(
    () => {
      const sheetName = getUniqueName('sheet', sheetNames);

      commitStaticData({
        ...staticData,
        [sheetName]: {},
      });
      setSelectedSheet(sheetName);
    },
    [commitStaticData, staticData, sheetNames]
  );

  const addRow = React.useCallback(
    () => {
      if (!selectedSheet) return;

      const nextStaticData = { ...staticData };
      if (Array.isArray(sheet)) {
        nextStaticData[selectedSheet] = [...sheet, {}];
      } else {
        const rowName = getUniqueName(
          'row',
          isPlainObject(sheet) ? Object.keys(sheet) : []
        );
        nextStaticData[selectedSheet] = {
          ...(isPlainObject(sheet) ? sheet : {}),
          [rowName]: {},
        };
      }
      commitStaticData(nextStaticData);
    },
    [commitStaticData, staticData, selectedSheet, sheet]
  );

  const addColumn = React.useCallback(
    () => {
      if (!selectedSheet) return;
      const columnName = getUniqueName('column', columnKeys);

      const nextStaticData = { ...staticData };
      const nextSheet: any = Array.isArray(sheet)
        ? [...sheet]
        : { ...(isPlainObject(sheet) ? sheet : {}) };

      rowKeys.forEach(rowKey => {
        const rowIndex = Number(rowKey);
        const rowValue = Array.isArray(nextSheet)
          ? nextSheet[rowIndex]
          : nextSheet[rowKey];
        const nextRowValue: StaticDataRoot = isPlainObject(rowValue)
          ? { ...rowValue }
          : {};
        if (nextRowValue[columnName] === undefined)
          nextRowValue[columnName] = '';
        if (Array.isArray(nextSheet)) nextSheet[rowIndex] = nextRowValue;
        else nextSheet[rowKey] = nextRowValue;
      });

      nextStaticData[selectedSheet] = nextSheet;
      commitStaticData(nextStaticData);
    },
    [columnKeys, commitStaticData, staticData, rowKeys, selectedSheet, sheet]
  );

  const renameSheet = React.useCallback(
    (sheetName: string, nextSheetNameText: string) => {
      const nextSheetName = nextSheetNameText.trim();
      if (!nextSheetName || nextSheetName === sheetName) return;

      const targetSheetName = getUniqueName(
        nextSheetName,
        sheetNames.filter(name => name !== sheetName)
      );
      const nextStaticData: StaticDataRoot = {};
      Object.keys(staticData).forEach(currentSheetName => {
        nextStaticData[
          currentSheetName === sheetName ? targetSheetName : currentSheetName
        ] = staticData[currentSheetName];
      });

      commitStaticData(nextStaticData);
      setSelectedSheet(currentSelectedSheet =>
        currentSelectedSheet === sheetName
          ? targetSheetName
          : currentSelectedSheet
      );
      setSelectedCell(currentSelectedCell =>
        currentSelectedCell && currentSelectedCell.sheetName === sheetName
          ? { ...currentSelectedCell, sheetName: targetSheetName }
          : currentSelectedCell
      );
    },
    [commitStaticData, staticData, sheetNames]
  );

  const renameRow = React.useCallback(
    (sheetName: string, rowKey: string, nextRowKeyText: string) => {
      const nextRowKey = nextRowKeyText.trim();
      if (!nextRowKey || nextRowKey === rowKey) return;

      const targetSheet = staticData[sheetName];
      if (!isPlainObject(targetSheet)) return;

      const targetRowKey = getUniqueName(
        nextRowKey,
        Object.keys(targetSheet).filter(
          currentRowKey => currentRowKey !== rowKey
        )
      );
      const nextSheet: StaticDataRoot = {};
      Object.keys(targetSheet).forEach(currentRowKey => {
        nextSheet[currentRowKey === rowKey ? targetRowKey : currentRowKey] =
          targetSheet[currentRowKey];
      });

      commitStaticData({
        ...staticData,
        [sheetName]: nextSheet,
      });
      setSelectedCell(currentSelectedCell =>
        currentSelectedCell &&
        currentSelectedCell.sheetName === sheetName &&
        currentSelectedCell.rowKey === rowKey
          ? { ...currentSelectedCell, rowKey: targetRowKey }
          : currentSelectedCell
      );
    },
    [commitStaticData, staticData]
  );

  const renameColumn = React.useCallback(
    (sheetName: string, columnKey: string, nextColumnKeyText: string) => {
      const nextColumnKey = nextColumnKeyText.trim();
      if (!nextColumnKey || nextColumnKey === columnKey) return;

      const targetSheet = staticData[sheetName];
      const targetRowKeys = getRowKeys(targetSheet);
      const targetColumnKey = getUniqueName(
        nextColumnKey,
        getColumnKeys(targetSheet, targetRowKeys).filter(
          currentColumnKey => currentColumnKey !== columnKey
        )
      );
      const nextSheet: any = Array.isArray(targetSheet)
        ? [...targetSheet]
        : { ...(isPlainObject(targetSheet) ? targetSheet : {}) };

      targetRowKeys.forEach(rowKey => {
        const rowIndex = Number(rowKey);
        const rowValue = Array.isArray(nextSheet)
          ? nextSheet[rowIndex]
          : nextSheet[rowKey];
        if (!isPlainObject(rowValue) || rowValue[columnKey] === undefined) {
          return;
        }

        const nextRowValue: StaticDataRoot = {};
        Object.keys(rowValue).forEach(currentColumnKey => {
          nextRowValue[
            currentColumnKey === columnKey ? targetColumnKey : currentColumnKey
          ] = rowValue[currentColumnKey];
        });
        if (Array.isArray(nextSheet)) nextSheet[rowIndex] = nextRowValue;
        else nextSheet[rowKey] = nextRowValue;
      });

      commitStaticData({
        ...staticData,
        [sheetName]: nextSheet,
      });
      setSelectedCell(currentSelectedCell =>
        currentSelectedCell &&
        currentSelectedCell.sheetName === sheetName &&
        currentSelectedCell.columnKey === columnKey
          ? { ...currentSelectedCell, columnKey: targetColumnKey }
          : currentSelectedCell
      );
    },
    [commitStaticData, staticData]
  );

  const handleNameInputKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLInputElement>, originalName: string) => {
      if (event.key === 'Enter') {
        event.currentTarget.blur();
      } else if (event.key === 'Escape') {
        event.currentTarget.value = originalName;
        event.currentTarget.blur();
      }
    },
    []
  );

  const updateCell = React.useCallback(
    (rowKey: string, columnKey: string, text: string) => {
      if (!selectedSheet) return;

      const nextStaticData = { ...staticData };
      const nextSheet: any = Array.isArray(sheet)
        ? [...sheet]
        : { ...(isPlainObject(sheet) ? sheet : {}) };
      const rowIndex = Number(rowKey);
      const rowValue = Array.isArray(nextSheet)
        ? nextSheet[rowIndex]
        : nextSheet[rowKey];

      if (columnKey === 'value' && !isPlainObject(rowValue)) {
        if (Array.isArray(nextSheet))
          nextSheet[rowIndex] = parseCellValue(text);
        else nextSheet[rowKey] = parseCellValue(text);
      } else {
        const nextRowValue: StaticDataRoot = isPlainObject(rowValue)
          ? { ...rowValue }
          : {};
        nextRowValue[columnKey] = parseCellValue(text);
        if (Array.isArray(nextSheet)) nextSheet[rowIndex] = nextRowValue;
        else nextSheet[rowKey] = nextRowValue;
      }

      nextStaticData[selectedSheet] = nextSheet;
      commitStaticData(nextStaticData);
    },
    [commitStaticData, staticData, selectedSheet, sheet]
  );

  const deleteRow = React.useCallback(
    (sheetName: string, rowKey: string) => {
      const nextStaticData = { ...staticData };
      const targetSheet = nextStaticData[sheetName];
      if (Array.isArray(targetSheet)) {
        nextStaticData[sheetName] = targetSheet.filter(
          (_, index) => String(index) !== rowKey
        );
      } else if (isPlainObject(targetSheet)) {
        const nextSheet = { ...targetSheet };
        delete nextSheet[rowKey];
        nextStaticData[sheetName] = nextSheet;
      }
      commitStaticData(nextStaticData);
      setSelectedCell(null);
    },
    [commitStaticData, staticData]
  );

  const deleteColumn = React.useCallback(
    (sheetName: string, columnKey: string) => {
      const nextStaticData = { ...staticData };
      const targetSheet = nextStaticData[sheetName];
      const nextSheet: any = Array.isArray(targetSheet)
        ? [...targetSheet]
        : { ...targetSheet };
      const targetRowKeys = Array.isArray(targetSheet)
        ? targetSheet.map((_, index) => String(index))
        : isPlainObject(targetSheet)
        ? Object.keys(targetSheet)
        : [];

      targetRowKeys.forEach(rowKey => {
        const rowIndex = Number(rowKey);
        const rowValue = Array.isArray(nextSheet)
          ? nextSheet[rowIndex]
          : nextSheet[rowKey];
        if (!isPlainObject(rowValue)) return;

        const nextRowValue = { ...rowValue };
        delete nextRowValue[columnKey];
        if (Array.isArray(nextSheet)) nextSheet[rowIndex] = nextRowValue;
        else nextSheet[rowKey] = nextRowValue;
      });
      nextStaticData[sheetName] = nextSheet;
      commitStaticData(nextStaticData);
      setSelectedCell(null);
    },
    [commitStaticData, staticData]
  );

  const replaceStaticDataFromJson = React.useCallback(
    (jsonText: string) => {
      try {
        const parsed = JSON.parse(jsonText || '{}');
        if (!isPlainObject(parsed)) {
          setRawJsonError('The root value must be a JSON object.');
          return;
        }
        commitStaticData(parsed);
        setRawJsonError('');
      } catch (error) {
        setRawJsonError(error.message);
      }
    },
    [commitStaticData]
  );

  const applyRawJson = React.useCallback(
    () => {
      replaceStaticDataFromJson(rawJson);
    },
    [rawJson, replaceStaticDataFromJson]
  );

  const applyRawToml = React.useCallback(
    () => {
      try {
        commitStaticData(parseStaticDataFromToml(rawToml));
        setRawTomlError('');
      } catch (error) {
        setRawTomlError(error.message);
      }
    },
    [commitStaticData, rawToml]
  );

  const importJson = React.useCallback(
    (event: SyntheticInputEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      const file = files && files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const jsonText = typeof result === 'string' ? result : '';
        setRawJson(jsonText);
        replaceStaticDataFromJson(jsonText);
      };
      reader.readAsText(file);
      event.currentTarget.value = '';
    },
    [replaceStaticDataFromJson]
  );

  const exportJson = React.useCallback(
    () => {
      const blob = new Blob([JSON.stringify(staticData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'static-data.json';
      anchor.click();
      URL.revokeObjectURL(url);
    },
    [staticData]
  );

  const selectedPath = getSelectedPath(selectedCell, staticData);
  const selectedPlaceholder = selectedPath ? '{{' + selectedPath + '}}' : '';
  const selectedRowJson = getSelectedRowJson(selectedCell, staticData);
  const rawEditorError = rawEditorMode === 'toml' ? rawTomlError : rawJsonError;

  const copyText = React.useCallback((text: string) => {
    if (!text) return;
    try {
      copyTextToClipboard(text).catch(() => {});
    } catch (error) {
      // Ignore clipboard failures: the placeholder text remains selectable.
    }
  }, []);

  const applyChanges = React.useCallback(
    () => {
      const projectWithStaticData: any = project;
      projectWithStaticData.setStaticDataJson(JSON.stringify(staticData));
      onApply();
    },
    [staticData, onApply, project]
  );

  const content = (
    <>
      {!isMinimized && (
        <div style={styles.root}>
          <div style={styles.topBar}>
            <div style={styles.searchBox}>
              <SearchIcon />
              <input
                style={styles.searchInput}
                value={searchText}
                placeholder="Search"
                onChange={event => setSearchText(event.currentTarget.value)}
              />
            </div>
            <div style={styles.topActions}>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                style={styles.hiddenFileInput}
                onChange={importJson}
              />
              <FlatButton
                label={<Trans>Import</Trans>}
                leftIcon={<UploadIcon />}
                onClick={() => {
                  if (importInputRef.current) importInputRef.current.click();
                }}
              />
              <FlatButton
                label={<Trans>Export</Trans>}
                leftIcon={<DownloadIcon />}
                onClick={exportJson}
              />
            </div>
          </div>
          <div style={styles.sheetPanel}>
            <div style={styles.tabs}>
              {sheetNames.map(sheetName => (
                <div
                  key={sheetName}
                  style={{
                    ...styles.tab,
                    ...(sheetName === selectedSheet ? styles.selectedTab : {}),
                  }}
                  onClick={() => setSelectedSheet(sheetName)}
                >
                  <input
                    style={{
                      ...styles.tabNameInput,
                      width: Math.max(sheetName.length, 4) + 'ch',
                    }}
                    aria-label={t`Sheet name`}
                    defaultValue={sheetName}
                    title={sheetName}
                    onFocus={() => setSelectedSheet(sheetName)}
                    onBlur={event =>
                      renameSheet(sheetName, event.currentTarget.value)
                    }
                    onKeyDown={event =>
                      handleNameInputKeyDown(event, sheetName)
                    }
                  />
                </div>
              ))}
              <span style={styles.addSheetTab}>
                <IconButton
                  size="small"
                  color="default"
                  tooltip={t`Add sheet`}
                  onClick={addSheet}
                >
                  <AddIcon />
                </IconButton>
              </span>
            </div>
            <div style={styles.gridScroller}>
              {!selectedSheet ? (
                <div style={styles.emptyState}>
                  <Text>
                    <Trans>Create a sheet to start editing static data.</Trans>
                  </Text>
                </div>
              ) : (
                <table style={styles.table}>
                  <colgroup>
                    <col style={makeColumnWidthStyle(rowKeyColumnWidth)} />
                    {columnKeys.map(columnKey => (
                      <col
                        key={columnKey}
                        style={makeColumnWidthStyle(
                          columnWidths[columnKey] || gridMinColumnWidth
                        )}
                      />
                    ))}
                    <col style={makeColumnWidthStyle(44)} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        style={{
                          ...styles.cornerCell,
                          ...makeColumnWidthStyle(rowKeyColumnWidth),
                        }}
                      >
                        <div style={styles.cornerCellContent}>
                          <span style={styles.cornerCellLabel}>
                            <Trans>Row key</Trans>
                          </span>
                          <IconButton
                            style={styles.addRowButton}
                            size="small"
                            color="default"
                            tooltip={t`Add row`}
                            onClick={addRow}
                            disabled={!selectedSheet}
                          >
                            <AddIcon />
                          </IconButton>
                        </div>
                      </th>
                      {columnKeys.map(columnKey => (
                        <th
                          key={columnKey}
                          style={{
                            ...styles.columnHeader,
                            ...makeColumnWidthStyle(
                              columnWidths[columnKey] || gridMinColumnWidth
                            ),
                          }}
                        >
                          <div style={styles.columnHeaderContent}>
                            <input
                              style={styles.columnName}
                              aria-label={t`Column name`}
                              defaultValue={columnKey}
                              title={columnKey}
                              onBlur={event =>
                                renameColumn(
                                  selectedSheet,
                                  columnKey,
                                  event.currentTarget.value
                                )
                              }
                              onKeyDown={event =>
                                handleNameInputKeyDown(event, columnKey)
                              }
                            />
                            <IconButton
                              size="small"
                              color="default"
                              tooltip={t`Delete column`}
                              onClick={() =>
                                deleteColumn(selectedSheet, columnKey)
                              }
                            >
                              <TrashIcon />
                            </IconButton>
                          </div>
                        </th>
                      ))}
                      <th style={styles.actionHeader}>
                        <IconButton
                          size="small"
                          color="default"
                          tooltip={t`Add column`}
                          onClick={addColumn}
                          disabled={!selectedSheet}
                        >
                          <AddIcon />
                        </IconButton>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRowKeys.map(rowKey => {
                      const rowValue = Array.isArray(sheet)
                        ? sheet[Number(rowKey)]
                        : sheet[rowKey];
                      const isSelectedRow =
                        !!selectedCell &&
                        selectedCell.sheetName === selectedSheet &&
                        selectedCell.rowKey === rowKey &&
                        !selectedCell.columnKey;

                      return (
                        <tr key={rowKey}>
                          <th
                            style={{
                              ...styles.rowHeader,
                              ...makeColumnWidthStyle(rowKeyColumnWidth),
                              ...(isSelectedRow ? styles.selectedCell : {}),
                            }}
                            onClick={() =>
                              setSelectedCell({
                                sheetName: selectedSheet,
                                rowKey,
                              })
                            }
                          >
                            {Array.isArray(sheet) ? (
                              <span style={styles.rowNameLabel} title={rowKey}>
                                {rowKey}
                              </span>
                            ) : (
                              <input
                                style={styles.rowNameInput}
                                aria-label={t`Row key`}
                                defaultValue={rowKey}
                                title={rowKey}
                                onFocus={() =>
                                  setSelectedCell({
                                    sheetName: selectedSheet,
                                    rowKey,
                                  })
                                }
                                onBlur={event =>
                                  renameRow(
                                    selectedSheet,
                                    rowKey,
                                    event.currentTarget.value
                                  )
                                }
                                onKeyDown={event =>
                                  handleNameInputKeyDown(event, rowKey)
                                }
                              />
                            )}
                          </th>
                          {columnKeys.map(columnKey => {
                            const value =
                              columnKey === 'value' && !isPlainObject(rowValue)
                                ? rowValue
                                : isPlainObject(rowValue)
                                ? rowValue[columnKey]
                                : undefined;
                            const isSelected =
                              !!selectedCell &&
                              selectedCell.sheetName === selectedSheet &&
                              selectedCell.rowKey === rowKey &&
                              selectedCell.columnKey === columnKey;

                            return (
                              <td
                                key={columnKey}
                                style={{
                                  ...styles.cell,
                                  ...makeColumnWidthStyle(
                                    columnWidths[columnKey] ||
                                      gridMinColumnWidth
                                  ),
                                  ...(isSelected ? styles.selectedCell : {}),
                                }}
                              >
                                <input
                                  style={styles.input}
                                  value={formatCellValue(value)}
                                  title={formatCellValue(value)}
                                  onFocus={() =>
                                    setSelectedCell({
                                      sheetName: selectedSheet,
                                      rowKey,
                                      columnKey,
                                    })
                                  }
                                  onChange={event =>
                                    updateCell(
                                      rowKey,
                                      columnKey,
                                      event.currentTarget.value
                                    )
                                  }
                                />
                              </td>
                            );
                          })}
                          <td style={styles.actionCell}>
                            <IconButton
                              size="small"
                              color="default"
                              tooltip={t`Delete row`}
                              onClick={() => deleteRow(selectedSheet, rowKey)}
                            >
                              <TrashIcon />
                            </IconButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div style={styles.pathBar}>
              <span style={styles.pathLabel}>
                <Trans>Placeholder</Trans>
              </span>
              <span style={styles.code}>{selectedPlaceholder || '-'}</span>
              <IconButton
                size="small"
                color="default"
                tooltip={t`Copy placeholder`}
                onClick={() => copyText(selectedPlaceholder)}
                disabled={!selectedPlaceholder}
              >
                <CopyIcon />
              </IconButton>
              {selectedRowJson ? (
                <FlatButton
                  label={<Trans>Copy JSON</Trans>}
                  leftIcon={<CopyIcon />}
                  onClick={() => copyText(selectedRowJson)}
                />
              ) : null}
              <span style={styles.rawToggleSpacer} />
              <FlatButton
                label={<Trans>Raw TOML</Trans>}
                leftIcon={<FileWithLinesIcon />}
                primary={rawEditorMode === 'toml'}
                onClick={() =>
                  setRawEditorMode(rawEditorMode === 'toml' ? null : 'toml')
                }
              />
              <FlatButton
                label={<Trans>Raw JSON</Trans>}
                leftIcon={<SettingsIcon />}
                primary={rawEditorMode === 'json'}
                onClick={() =>
                  setRawEditorMode(rawEditorMode === 'json' ? null : 'json')
                }
              />
            </div>
            {rawEditorMode && (
              <div style={styles.rawPanel}>
                <div style={styles.rawHeader}>
                  <Text noMargin color="secondary">
                    {rawEditorMode === 'toml' ? (
                      <Trans>Raw TOML</Trans>
                    ) : (
                      <Trans>Raw JSON</Trans>
                    )}
                  </Text>
                  <FlatButton
                    label={
                      rawEditorMode === 'toml' ? (
                        <Trans>Apply TOML</Trans>
                      ) : (
                        <Trans>Apply JSON</Trans>
                      )
                    }
                    onClick={
                      rawEditorMode === 'toml' ? applyRawToml : applyRawJson
                    }
                  />
                </div>
                <textarea
                  style={styles.rawTextArea}
                  value={rawEditorMode === 'toml' ? rawToml : rawJson}
                  onChange={event =>
                    rawEditorMode === 'toml'
                      ? setRawToml(event.currentTarget.value)
                      : setRawJson(event.currentTarget.value)
                  }
                />
                <div style={styles.rawFooter}>
                  {rawEditorError ? (
                    <Text noMargin style={styles.error}>
                      {rawEditorError}
                    </Text>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <Dialog
      title={<Trans>Static Data</Trans>}
      open={open}
      onRequestClose={onCancel}
      onApply={applyChanges}
      titleActions={
        <IconButton
          onClick={() => setIsMinimized(!isMinimized)}
          size="small"
          tooltip={isMinimized ? t`Restore` : t`Minimize`}
        >
          <MinimizeIcon />
        </IconButton>
      }
      actions={
        isMinimized
          ? []
          : [
              <FlatButton
                key="cancel"
                label={<Trans>Cancel</Trans>}
                onClick={onCancel}
              />,
              <DialogPrimaryButton
                key="apply"
                label={<Trans>Apply</Trans>}
                primary
                onClick={applyChanges}
              />,
            ]
      }
      flexColumnBody
      fullHeight={!isMinimized}
      maxWidth="xl"
      id="static-data-dialog"
      noPadding
    >
      {content}
    </Dialog>
  );
};

export const StaticDataEditor = ({
  project,
  onChange,
}: {|
  project: gdProject,
  onChange: (staticData: StaticDataRoot) => void,
|}): React.Node => (
  <StaticDataDialog project={project} embedded onChange={onChange} />
);

export default StaticDataDialog;

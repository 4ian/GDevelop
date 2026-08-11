// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import ScrollView from '../UI/ScrollView';
import EmptyMessage from '../UI/EmptyMessage';
import Text from '../UI/Text';
import {
  getEditorOperationHistory,
  subscribeToEditorOperationHistory,
  type EditorOperation,
} from '../Utils/EditorOperationHistory';

const styles = {
  scrollView: {
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    gap: 2,
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 10px',
    borderRadius: 4,
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
};

const useEditorOperationHistory = (): Array<EditorOperation> => {
  const [history, setHistory] = React.useState<Array<EditorOperation>>(
    getEditorOperationHistory()
  );

  React.useEffect(() => {
    const updateHistory = () => {
      setHistory(getEditorOperationHistory());
    };

    updateHistory();
    return subscribeToEditorOperationHistory(updateHistory);
  }, []);

  return history;
};

const getActionTypeLabel = (
  i18n: I18nType,
  actionType?: 'ADD' | 'DELETE' | 'EDIT'
): string => {
  switch (actionType) {
    case 'ADD':
      return i18n._(t`Added`);
    case 'DELETE':
      return i18n._(t`Deleted`);
    case 'EDIT':
      return i18n._(t`Edited`);
    default:
      return i18n._(t`Changed`);
  }
};

const getOperationLabel = (
  i18n: I18nType,
  operation: EditorOperation
): string => {
  const operationLabel =
    operation.changeContext &&
    typeof operation.changeContext.operationLabel === 'string'
      ? operation.changeContext.operationLabel
      : getActionTypeLabel(i18n, operation.actionType);
  if (operation.kind === 'undo') {
    return `${i18n._(t`Undo`)}: ${operationLabel}`;
  }
  if (operation.kind === 'redo') {
    return `${i18n._(t`Redo`)}: ${operationLabel}`;
  }

  return operationLabel;
};

const getOperationSourceLabel = (
  i18n: I18nType,
  operation: EditorOperation
): string => {
  const historyContext = operation.historyContext;
  if (!historyContext) return i18n._(t`Editor`);

  return historyContext.subject
    ? `${historyContext.editor} - ${historyContext.subject}`
    : historyContext.editor;
};

const EditorOperationHistoryRow = ({
  operation,
  i18n,
}: {|
  operation: EditorOperation,
  i18n: I18nType,
|}) => (
  <div style={styles.row}>
    <div style={styles.rowHeader}>
      <Text noMargin size="body2" style={{ fontWeight: 'bold' }}>
        {getOperationLabel(i18n, operation)}
      </Text>
      <Text noMargin size="body-small" color="secondary" noShrink>
        {i18n.date(operation.timestamp, {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        })}
      </Text>
    </div>
    <Text
      noMargin
      size="body-small"
      color="secondary"
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {getOperationSourceLabel(i18n, operation)}
    </Text>
  </div>
);

const EditorOperationHistory = (): React.Node => {
  const operations = useEditorOperationHistory();

  return (
    <I18n>
      {({ i18n }) =>
        operations.length ? (
          <ScrollView style={styles.scrollView}>
            <div style={styles.container}>
              {operations.map(operation => (
                <EditorOperationHistoryRow
                  key={operation.id}
                  operation={operation}
                  i18n={i18n}
                />
              ))}
            </div>
          </ScrollView>
        ) : (
          <EmptyMessage>
            <Trans>No editor operation recorded yet.</Trans>
          </EmptyMessage>
        )
      }
    </I18n>
  );
};

export default EditorOperationHistory;

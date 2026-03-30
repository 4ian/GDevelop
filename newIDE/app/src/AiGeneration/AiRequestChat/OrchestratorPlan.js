// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import Check from '../../UI/CustomSvgIcons/Check';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import classes from './OrchestratorPlan.module.css';
import { FunctionCallRow } from './FunctionCallRow';
import { ChatBubble } from './ChatBubble';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestPlanTask,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorCallbacks } from '../../EditorFunctions';
import { ChatMarkdownText } from './ChatMarkdownText';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { type FunctionCallItem } from './Utils';

type Props = {|
  tasks: Array<AiRequestPlanTask>,
  messageId: string,
  followingText?: string,
  feedbackButtons?: React.Node,
  functionCallItemsByTaskId: Map<string, Array<FunctionCallItem>>,
  project: ?gdProject,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{| ignore?: boolean |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
|};

// A set of natural-sounding intro phrases for the plan header.
// One is picked deterministically based on the plan's messageId so it stays
// consistent across React re-renders (same plan → same phrase).
const PLAN_INTRO_PHRASES = [
  t`I've mapped out a plan — here's what I'll do:`,
  t`Alright, here's my approach:`,
  t`I've broken this into steps — let me walk you through it:`,
  t`Here's how I'll tackle this:`,
  t`Got it! I've put together a plan:`,
  t`Let me lay out the steps:`,
  t`I've thought this through — here's the plan:`,
];

const StatusIcon = ({
  status,
}: {|
  status: 'pending' | 'in_progress' | 'done' | 'voided',
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  switch (status) {
    case 'done':
      return (
        <div className={classes.statusIconFixed}>
          <Check fontSize="small" htmlColor={gdevelopTheme.message.valid} />
        </div>
      );
    case 'in_progress':
      return (
        <div className={classes.statusIconFixed}>
          <div className={classes.filledCircle} />
        </div>
      );
    case 'pending':
      return (
        <div className={classes.statusIconFixed}>
          <div className={classes.emptyCircle} />
        </div>
      );
    case 'voided':
      return null;
    default:
      return null;
  }
};

const TaskRow = ({
  task,
  isLast,
  functionCallItems,
  project,
  onProcessFunctionCalls,
  editorCallbacks,
}: {|
  task: AiRequestPlanTask,
  isLast: boolean,
  functionCallItems: Array<FunctionCallItem>,
  project: ?gdProject,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{| ignore?: boolean |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
|}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasLinkedFunctionCalls =
    functionCallItems.length > 0 && task.status !== 'pending';
  const hasExpandableContent = hasLinkedFunctionCalls || !!task.description;

  // Auto-expand when the task is in_progress and has function calls (or gains new ones).
  React.useEffect(
    () => {
      if (functionCallItems.length > 0 && task.status === 'in_progress') {
        setIsExpanded(true);
      }
    },
    [functionCallItems.length, task.status]
  );

  const toggle = () => {
    if (hasExpandableContent) setIsExpanded(expanded => !expanded);
  };

  return (
    <div className={classes.taskRow}>
      <Line noMargin>
        <div className={classes.statusIconContainer}>
          <StatusIcon status={task.status} />
          {!isLast && <div className={classes.lineSegmentBottom} />}
        </div>
        <Column noMargin expand>
          <div
            className={
              hasExpandableContent
                ? `${classes.taskRowHeader} ${classes.taskRowClickable}`
                : classes.taskRowHeader
            }
            onClick={toggle}
            role={hasExpandableContent ? 'button' : undefined}
            tabIndex={hasExpandableContent ? 0 : undefined}
            onKeyDown={
              hasExpandableContent
                ? e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle();
                    }
                  }
                : undefined
            }
          >
            {hasExpandableContent && (
              <div className={classes.chevron}>
                {isExpanded ? (
                  <ChevronArrowBottom fontSize="small" />
                ) : (
                  <ChevronArrowRight fontSize="small" />
                )}
              </div>
            )}
            <Text
              noMargin
              size="body-small"
              style={
                task.status === 'in_progress'
                  ? { fontWeight: 'bold' }
                  : undefined
              }
            >
              {task.title}
            </Text>
          </div>
          {isExpanded &&
            (hasLinkedFunctionCalls ? (
              <div className={classes.functionCallsContainer}>
                {functionCallItems.map(
                  ({
                    key,
                    messageContent,
                    existingFunctionCallOutput,
                    editorFunctionCallResult,
                  }) => (
                    <FunctionCallRow
                      key={key}
                      project={project}
                      functionCall={messageContent}
                      existingFunctionCallOutput={existingFunctionCallOutput}
                      editorFunctionCallResult={editorFunctionCallResult}
                      onProcessFunctionCalls={onProcessFunctionCalls}
                      editorCallbacks={editorCallbacks}
                    />
                  )
                )}
              </div>
            ) : task.description ? (
              <div className={classes.descriptionContainer}>
                <Text size="body-small" color="secondary">
                  {task.description}
                </Text>
              </div>
            ) : null)}
        </Column>
      </Line>
    </div>
  );
};

export const OrchestratorPlan = ({
  tasks,
  messageId,
  followingText,
  feedbackButtons,
  functionCallItemsByTaskId,
  project,
  onProcessFunctionCalls,
  editorCallbacks,
}: Props): React.Node => {
  // Filter out voided tasks
  const visibleTasks = tasks.filter(task => task.status !== 'voided');

  // Pick a phrase deterministically from the plan's messageId so it stays
  // stable across React re-renders (same plan message → same phrase).
  const phraseIndex = React.useMemo(
    () =>
      messageId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      PLAN_INTRO_PHRASES.length,
    [messageId]
  );

  const allPending = visibleTasks.every(task => task.status === 'pending');

  if (visibleTasks.length === 0) {
    // All tasks were voided. Still render followingText if present (the absorbed
    // sibling item won't render on its own since it's in absorbedMessageContentIndices).
    if (!followingText) return null;
    return (
      <ChatBubble role="assistant" feedbackButtons={feedbackButtons}>
        <ChatMarkdownText source={followingText} />
      </ChatBubble>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <ChatBubble role="assistant" feedbackButtons={feedbackButtons}>
          <Column expand noMargin>
            <Line noMargin>
              <ChatMarkdownText
                source={
                  !allPending
                    ? i18n._(t`Implementation steps:`)
                    : i18n._(PLAN_INTRO_PHRASES[phraseIndex])
                }
              />
            </Line>
            <div className={classes.tasksContainer}>
              {visibleTasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isLast={index === visibleTasks.length - 1}
                  functionCallItems={
                    functionCallItemsByTaskId.get(task.id) || []
                  }
                  project={project}
                  onProcessFunctionCalls={onProcessFunctionCalls}
                  editorCallbacks={editorCallbacks}
                />
              ))}
            </div>
            {followingText && (
              <Line noMargin>
                <ChatMarkdownText source={followingText} />
              </Line>
            )}
          </Column>
        </ChatBubble>
      )}
    </I18n>
  );
};

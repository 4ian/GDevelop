// @flow
import { Trans, t } from '@lingui/macro';
import {
  buildRunTestSpeedMenuTemplate,
  type GameplayTestRunSpeedOptions,
} from './GameplayTestEditorToolbar';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line, Spacer, marginsSize } from '../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import ScrollView from '../UI/ScrollView';
import ErrorBoundary from '../UI/ErrorBoundary';
import FlatButton from '../UI/FlatButton';
import LinearProgress from '../UI/LinearProgress';
import CompactTextField from '../UI/CompactTextField';
import { CompactTextAreaField } from '../UI/CompactTextAreaField';
import { TopLevelCollapsibleSection } from '../CompactPropertiesEditor/TopLevelCollapsibleSection';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import useForceUpdate from '../Utils/UseForceUpdate';
import { getRelativeOrAbsoluteDisplayDate } from '../Utils/DateDisplay';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import StopIcon from '../UI/CustomSvgIcons/Stop';
import CheckIcon from '../UI/CustomSvgIcons/Check';
import CrossIcon from '../UI/CustomSvgIcons/Cross';
import RobotIcon from '../ProjectCreation/RobotIcon';
import {
  type GameplayTestResult,
  type GameplayTestScope,
} from './GameplayTestRunner';
import {
  formatRunDuration,
  GameplayTestStatusChip,
  getDisplayStatusFromTest,
  type GameplayTestDisplayStatus,
} from './GameplayTestStatusIndicator';
import {
  GameplayTestOutputPanel,
  type GameplayTestOutputLine,
} from './GameplayTestOutputPanel';
import classes from './GameplayTestProperties.module.css';

const styles = {
  icon: { fontSize: 18 },
  scrollView: { paddingTop: marginsSize, overflowX: 'hidden' },
};

/** A row of the result summary: a dimmed label, and its value on the right. */
const SummaryRow = ({
  label,
  children,
}: {|
  label: React.Node,
  children: React.Node,
|}) => (
  <LineStackLayout
    noMargin
    alignItems="center"
    justifyContent="space-between"
    expand
  >
    <Text noMargin size="body-small" color="secondary">
      {label}
    </Text>
    <Text
      noMargin
      size="body-small"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {children}
    </Text>
  </LineStackLayout>
);

const AssertionRow = ({
  passed,
  message,
}: {|
  passed: boolean,
  message: string,
|}) => (
  <div
    className={
      passed
        ? `${classes.assertion} ${classes.assertionPassed}`
        : `${classes.assertion} ${classes.assertionFailed}`
    }
  >
    {passed ? (
      <CheckIcon className={classes.assertionIcon} />
    ) : (
      <CrossIcon className={classes.assertionIcon} />
    )}
    <Text noMargin size="body-small" color="primary" allowSelection>
      {message}
    </Text>
  </div>
);

type SectionName =
  | 'description'
  | 'result'
  | 'assertions'
  | 'errors'
  | 'console'
  | 'screenshots';

const defaultFoldedSections: { [SectionName]: boolean } = {
  description: false,
  result: false,
  assertions: false,
  errors: false,
  console: true,
  screenshots: false,
};

type Props = {|
  test: gdTest,
  scope: GameplayTestScope,
  isRunning: boolean,
  /** The frame currently reached by the running test, if known. */
  runningFrame?: number | null,
  lastResult: GameplayTestResult | null,
  onRunTest: (options: GameplayTestRunSpeedOptions) => void | Promise<void>,
  onStopTest: () => void,
  onEditWithAi: () => void,
  onTestModified: () => void,
|};

/**
 * The properties panel of a gameplay test: its name/description, the button to
 * run it and everything showing the outcome of the last run (status,
 * assertions, errors, console logs and screenshots).
 */
export const GameplayTestProperties = ({
  test,
  scope,
  isRunning,
  runningFrame,
  lastResult,
  onRunTest,
  onStopTest,
  onEditWithAi,
  onTestModified,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();
  const [foldedSections, setFoldedSections] = React.useState<{
    [SectionName]: boolean,
  }>(defaultFoldedSections);
  const toggleSection = React.useCallback((sectionName: SectionName) => {
    setFoldedSections(foldedSections => ({
      ...foldedSections,
      [sectionName]: !foldedSections[sectionName],
    }));
  }, []);

  const status: GameplayTestDisplayStatus = isRunning
    ? runningFrame != null
      ? 'running'
      : 'launching'
    : lastResult
    ? lastResult.status
    : getDisplayStatusFromTest(test);

  const assertions = lastResult ? lastResult.assertions : [];
  const passedAssertionsCount = assertions.filter(assertion => assertion.passed)
    .length;

  const errorLines: Array<GameplayTestOutputLine> = (lastResult
    ? lastResult.errors
    : []
  ).map(error => ({ level: 'error', message: error }));
  const consoleLines: Array<GameplayTestOutputLine> = (lastResult
    ? lastResult.consoleLogs
    : []
  ).map(consoleLog => ({
    level: consoleLog.level === 'log' ? 'log' : consoleLog.level,
    message: consoleLog.message,
  }));
  const screenshots = lastResult ? lastResult.screenshots : [];

  // The last run summary persisted on the test is used when the test was not
  // run in this editor session (`lastResult` is only kept in memory).
  const lastRunAt = test.getLastRunAt();
  const durationMs = lastResult
    ? lastResult.durationMs
    : test.getLastRunDurationMs();
  const framesExecuted = lastResult
    ? lastResult.framesExecuted
    : test.getLastRunFramesExecuted();
  const hasRunSummary = status !== 'never-run' && !isRunning;

  return (
    <ErrorBoundary
      componentTitle={<Trans>Gameplay test properties</Trans>}
      scope="gameplay-test-editor-properties"
    >
      <ScrollView autoHideScrollbar style={styles.scrollView}>
        <Column expand noMargin noOverflowParent id="gameplay-test-properties">
          <ColumnStackLayout expand noOverflowParent>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                <PreviewIcon style={styles.icon} />
                <Text size="body" noMargin>
                  <Trans>Gameplay test</Trans>
                </Text>
              </LineStackLayout>
              <GameplayTestStatusChip size="small" status={status} />
            </LineStackLayout>
            <CompactTextField
              value={test.getName()}
              onChange={() => {}}
              disabled
            />
            <Text noMargin size="body-small" color="secondary">
              {scope.type === 'project' ? (
                <Trans>Test of the project</Trans>
              ) : (
                <Trans>Test of the extension {scope.extensionName}</Trans>
              )}
            </Text>
            {isRunning ? (
              <ColumnStackLayout noMargin>
                <FlatButton
                  fullWidth
                  primary
                  leftIcon={<StopIcon />}
                  label={<Trans>Stop the test</Trans>}
                  onClick={onStopTest}
                />
                <Line noMargin alignItems="center">
                  <LinearProgress variant="indeterminate" />
                </Line>
                <Text noMargin size="body-small" color="secondary">
                  {runningFrame != null ? (
                    <Trans>Playing the game - frame {runningFrame}</Trans>
                  ) : (
                    <Trans>Starting the game...</Trans>
                  )}
                </Text>
              </ColumnStackLayout>
            ) : (
              <RaisedButtonWithSplitMenu
                primary
                fullWidth
                icon={<PreviewIcon />}
                label={<Trans>Run the test</Trans>}
                onClick={() => onRunTest({ speedFactor: null })}
                buildMenuTemplate={i18n =>
                  buildRunTestSpeedMenuTemplate(i18n, onRunTest)
                }
              />
            )}
            <FlatButton
              fullWidth
              color="ai"
              leftIcon={<RobotIcon size={16} />}
              label={<Trans>Edit with AI</Trans>}
              onClick={onEditWithAi}
            />
          </ColumnStackLayout>
          <TopLevelCollapsibleSection
            title={<Trans>Description</Trans>}
            isFolded={foldedSections.description}
            toggleFolded={() => toggleSection('description')}
            renderContent={() => (
              <CompactTextAreaField
                value={test.getDescription()}
                onChange={(text: string) => {
                  test.setDescription(text);
                  onTestModified();
                  forceUpdate();
                }}
                rows={3}
                placeholder={t`What does this test verify?`}
              />
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Last run</Trans>}
            isFolded={foldedSections.result}
            toggleFolded={() => toggleSection('result')}
            renderContent={() => (
              <ColumnStackLayout noMargin noOverflowParent>
                <Line noMargin>
                  <GameplayTestStatusChip status={status} />
                </Line>
                {hasRunSummary ? (
                  <ColumnStackLayout noMargin noOverflowParent>
                    {!!lastRunAt && (
                      <SummaryRow label={<Trans>Ran</Trans>}>
                        <I18n>
                          {({ i18n }) =>
                            getRelativeOrAbsoluteDisplayDate({
                              i18n,
                              dateAsNumber: lastRunAt,
                              relativeLimit: 'currentWeek',
                              sameDayFormat: 'timeAgo',
                              sameWeekFormat: 'timeAgo',
                              dayBeforeFormat: 'yesterdayAndHour',
                            })
                          }
                        </I18n>
                      </SummaryRow>
                    )}
                    <SummaryRow label={<Trans>Duration</Trans>}>
                      {formatRunDuration(durationMs)}
                    </SummaryRow>
                    <SummaryRow label={<Trans>Frames played</Trans>}>
                      {framesExecuted || 0}
                    </SummaryRow>
                    {!!assertions.length && (
                      <SummaryRow label={<Trans>Assertions</Trans>}>
                        <Trans>
                          {passedAssertionsCount} of {assertions.length} passed
                        </Trans>
                      </SummaryRow>
                    )}
                  </ColumnStackLayout>
                ) : (
                  !isRunning && (
                    <Text noMargin size="body-small" color="secondary">
                      <Trans>
                        Run the test to see here how the game behaved.
                      </Trans>
                    </Text>
                  )
                )}
              </ColumnStackLayout>
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Assertions</Trans>}
            isFolded={foldedSections.assertions}
            toggleFolded={() => toggleSection('assertions')}
            renderContent={() =>
              assertions.length ? (
                <div className={classes.assertionsList}>
                  {assertions.map((assertion, index) => (
                    <AssertionRow
                      key={index}
                      passed={assertion.passed}
                      message={assertion.message}
                    />
                  ))}
                </div>
              ) : (
                <Text noMargin size="body-small" color="secondary">
                  {lastResult ? (
                    <Trans>This run did not check anything.</Trans>
                  ) : (
                    <Trans>
                      The checks made by the test (with `harness.assert`) will
                      be listed here.
                    </Trans>
                  )}
                </Text>
              )
            }
          />
          <TopLevelCollapsibleSection
            title={<Trans>Errors</Trans>}
            isFolded={foldedSections.errors}
            toggleFolded={() => toggleSection('errors')}
            renderContent={() => (
              <GameplayTestOutputPanel
                lines={errorLines}
                canCopy
                placeholder={
                  lastResult ? (
                    <Trans>No error: the test ran until the end.</Trans>
                  ) : (
                    <Trans>
                      Errors of the test and of the game will be shown here.
                    </Trans>
                  )
                }
              />
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Console</Trans>}
            isFolded={foldedSections.console}
            toggleFolded={() => toggleSection('console')}
            renderContent={() => (
              <GameplayTestOutputPanel
                lines={consoleLines}
                canCopy
                placeholder={
                  lastResult ? (
                    <Trans>
                      The game did not log anything during this run.
                    </Trans>
                  ) : (
                    <Trans>
                      Everything logged by the game with `console.log` while the
                      test runs will be shown here.
                    </Trans>
                  )
                }
              />
            )}
          />
          {!!screenshots.length && (
            <TopLevelCollapsibleSection
              title={<Trans>Screenshots</Trans>}
              isFolded={foldedSections.screenshots}
              toggleFolded={() => toggleSection('screenshots')}
              renderContent={() => (
                <div className={classes.screenshotsList}>
                  {screenshots.map((screenshot, index) => (
                    <div className={classes.screenshot} key={index}>
                      <img
                        className={classes.screenshotImage}
                        src={`data:image/jpeg;base64,${screenshot.jpegBase64}`}
                        alt={screenshot.label}
                      />
                      <Text
                        noMargin
                        size="body-small"
                        color="secondary"
                        style={textEllipsisStyle}
                      >
                        {screenshot.label || (
                          <Trans>Frame {screenshot.frame}</Trans>
                        )}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            />
          )}
          <Spacer />
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};

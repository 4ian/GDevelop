// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type { GuidedCourseChapter } from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line, Spacer } from '../UI/Grid';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { Divider } from '@material-ui/core';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import GuidedCourseChapterTaskItem from './GuidedCourseChapterTaskItem';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  stickyTitle: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    display: 'flex',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
};

type Props = {|
  guidedCourseChapter: GuidedCourseChapter,
  onOpenTemplate: (url: string) => void,
|};

const GuidedCourseChapterView = ({
  guidedCourseChapter,
  onOpenTemplate,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const isMobilePortrait = isMobile && !isLandscape;
  const [openTasks, setOpenTasks] = React.useState<boolean>(false);
  const completion = { done: 10, total: guidedCourseChapter.tasks.length };
  const isFinished = completion.done === completion.total;
  return (
    <ColumnStackLayout expand noMargin>
      <div
        style={{
          ...styles.titleContainer,
          flexDirection: isMobilePortrait ? 'column-reverse' : 'row',
          alignItems: isMobilePortrait ? 'flex-start' : 'center',
          justifyContent: 'space-between',
        }}
      >
        <LineStackLayout noMargin alignItems="center" expand>
          <Text size="title">{guidedCourseChapter.title}</Text>
          {isFinished && !isMobilePortrait && (
            <div
              style={{
                color: gdevelopTheme.statusIndicator.success,
              }}
            >
              <CheckCircle />
            </div>
          )}
        </LineStackLayout>
        {isFinished ? (
          <div
            style={{
              ...styles.statusContainer,
              color: gdevelopTheme.statusIndicator.success,
            }}
          >
            {isMobilePortrait && <CheckCircle />}
            <Text color="inherit" noMargin>
              <Trans>Finished</Trans>
            </Text>
          </div>
        ) : (
          <Text color="secondary" noMargin>
            <Trans>
              {completion.done} of {completion.total} completed
            </Trans>
          </Text>
        )}
      </div>
      <ResponsiveLineStackLayout expand noResponsiveLandscape>
        {/* TODO: Video */}
        <Column expand />
        <ColumnStackLayout noMargin>
          <Text size="sub-title">Lesson materials</Text>
          <Paper background="medium" style={{ padding: 10 }}>
            <ColumnStackLayout>
              <Text>
                <Trans>Template</Trans>
              </Text>
              <RaisedButton
                primary
                label={<Trans>Open template</Trans>}
                onClick={() => onOpenTemplate(guidedCourseChapter.templateUrl)}
              />
            </ColumnStackLayout>
          </Paper>
        </ColumnStackLayout>
      </ResponsiveLineStackLayout>
      <div
        style={{
          ...styles.stickyTitle,
          backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
        }}
      >
        <Divider />
        <Spacer />
        <Line alignItems="center" justifyContent="space-between" noMargin>
          <Text size="block-title">
            <Trans>Tasks</Trans>
          </Text>
          <FlatButton
            primary
            label={
              openTasks ? <Trans>Close tasks</Trans> : <Trans>Open tasks</Trans>
            }
            leftIcon={
              openTasks ? (
                <ChevronArrowTop size="small" />
              ) : (
                <ChevronArrowBottom size="small" />
              )
            }
            onClick={() => setOpenTasks(!openTasks)}
          />
        </Line>
        <Spacer />
        <Divider />
      </div>
      {guidedCourseChapter.tasks.map((item, index) => (
        <GuidedCourseChapterTaskItem
          guidedCourseChapterTask={item}
          key={index.toString()}
          isOpen={openTasks}
          onCheck={() => {}}
          isComplete={false}
          onComplete={() => {}}
        />
      ))}
    </ColumnStackLayout>
  );
};

export default GuidedCourseChapterView;

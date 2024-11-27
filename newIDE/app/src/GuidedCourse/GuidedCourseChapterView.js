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
import { Column, Line } from '../UI/Grid';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { Divider } from '@material-ui/core';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import GuidedCourseChapterTaskItem from './GuidedCourseChapterTaskItem';

type Props = {|
  guidedCourseChapter: GuidedCourseChapter,
  onOpenTemplate: (url: string) => void,
|};

const GuidedCourseChapterView = ({
  guidedCourseChapter,
  onOpenTemplate,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [openTasks, setOpenTasks] = React.useState<boolean>(false);
  const completion = { done: 5, total: guidedCourseChapter.tasks.length };
  const isFinished = completion.done === completion.total;
  return (
    <ColumnStackLayout expand noMargin>
      <LineStackLayout
        noMargin
        alignItems="center"
        justifyContent="space-beween"
        expand
      >
        <LineStackLayout noMargin alignItems="center" expand>
          <Text size="title">{guidedCourseChapter.title}</Text>
          {isFinished && (
            <div
              style={{
                color: gdevelopTheme.statusIndicator.success,
              }}
            >
              <CheckCircle color="success" />
            </div>
          )}
        </LineStackLayout>
        {isFinished ? (
          <div
            style={{
              color: gdevelopTheme.statusIndicator.success,
            }}
          >
            <Text color="inherit">
              <Trans>Finished</Trans>
            </Text>
          </div>
        ) : (
          <Text color="secondary">
            <Trans>
              {completion.done} of {completion.total} completed
            </Trans>
          </Text>
        )}
      </LineStackLayout>
      <ResponsiveLineStackLayout expand>
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
      <Divider />
      <Column expand>
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
      </Column>
      <Divider />
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

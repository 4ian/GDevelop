// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type {
  TextBasedCourseChapter,
  Course,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line } from '../UI/Grid';
import Cloud from '../UI/CustomSvgIcons/Cloud';
import { rankLabel } from '../Utils/Ordinal';
import type { CourseChapterCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import LockedCourseChapterPreview from './LockedCourseChapterPreview';
import CourseChapterTitle from './CourseChapterTitle';
import TextBasedCourseChapterItems from './TextBasedCourseChapterItems';

const styles = {
  icon: {
    fontSize: 18,
  },
  videoAndMaterialsContainer: {
    display: 'flex',
    marginTop: 8,
    gap: 8,
    alignItems: 'stretch',
    flexWrap: 'wrap',
    marginBottom: 8,
    flex: 1,
    minWidth: 0,
  },
  sideBar: { padding: 16, display: 'flex' },
  image: {
    maxWidth: '100%',
  },
};

type Props = {|
  chapterIndex: number,
  course: Course,
  courseChapter: TextBasedCourseChapter,
  onOpenTemplate: (templateId?: string) => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  onClickUnlock: () => void,
|};

const TextBasedCourseChapterView = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      chapterIndex,
      courseChapter,
      course,
      onOpenTemplate,
      onCompleteTask,
      isTaskCompleted,
      getChapterCompletion,
      onClickUnlock,
    },
    ref
  ) => {
    return (
      <ColumnStackLayout expand noMargin>
        <CourseChapterTitle
          course={course}
          chapterIndex={chapterIndex}
          courseChapter={courseChapter}
          getChapterCompletion={getChapterCompletion}
          ref={ref}
        />
        {courseChapter.isLocked ? (
          <LockedCourseChapterPreview
            course={course}
            courseChapter={courseChapter}
            onClickUnlock={onClickUnlock}
          />
        ) : courseChapter.templates.length > 0 ? (
          <div style={styles.videoAndMaterialsContainer}>
            <ColumnStackLayout noMargin>
              <Text size="sub-title" noMargin>
                <Trans>Chapter materials</Trans>
              </Text>
              <Paper background="medium" style={styles.sideBar}>
                <ColumnStackLayout noMargin>
                  {courseChapter.templates.map(template => (
                    <Line noMargin alignItems="center" key={template.id}>
                      <Text noMargin>{rankLabel[chapterIndex + 1]}</Text>
                      &nbsp;
                      <Text noMargin>
                        <Trans>Chapter</Trans>
                      </Text>
                      &nbsp;-&nbsp;
                      {template.title && (
                        <Text noMargin>{template.title}&nbsp;</Text>
                      )}
                      <Text noMargin>
                        <Trans>Template</Trans>
                      </Text>
                      <Column>
                        <RaisedButton
                          primary
                          icon={<Cloud fontSize="small" />}
                          label={<Trans>Open template</Trans>}
                          onClick={() => onOpenTemplate(template.id)}
                        />
                      </Column>
                    </Line>
                  ))}
                </ColumnStackLayout>
              </Paper>
            </ColumnStackLayout>
          </div>
        ) : null}

        <Column>
          {!courseChapter.isLocked && (
            <TextBasedCourseChapterItems
              items={courseChapter.items}
              onCompleteTask={(index: number, completed: boolean) =>
                onCompleteTask(courseChapter.id, index, completed)
              }
              isTaskCompleted={(index: number) =>
                isTaskCompleted(courseChapter.id, index)
              }
            />
          )}
        </Column>
      </ColumnStackLayout>
    );
  }
);

export default TextBasedCourseChapterView;

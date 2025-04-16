// @flow
import * as React from 'react';

import type {
  TextBasedCourseChapterTaskItem as TextBasedCourseChapterTaskItemType,
  TextBasedCourseChapterTextItem as TextBasedCourseChapterTextItemType,
  TextBasedCourseChapterImageItem as TextBasedCourseChapterImageItemType,
  TextBasedCourseChapterVideoItem as TextBasedCourseChapterVideoItemType,
} from '../Utils/GDevelopServices/Asset';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { MarkdownText } from '../UI/MarkdownText';
import ImageWithZoom from '../UI/ImageWithZoom';
import TextBasedCourseChapterTaskItem from './TextBasedCourseChapterTaskItem';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';

const styles = {
  media: {
    maxWidth: '80%',
  },
};

type Props = {|
  onCompleteTask?: (taskIndex: number, completed: boolean) => void,
  isTaskCompleted?: (taskIndex: number) => boolean,
  items:
    | Array<
        | TextBasedCourseChapterTaskItemType
        | TextBasedCourseChapterTextItemType
        | TextBasedCourseChapterImageItemType
        | TextBasedCourseChapterVideoItemType
      >
    | Array<
        | TextBasedCourseChapterTextItemType
        | TextBasedCourseChapterImageItemType
        | TextBasedCourseChapterVideoItemType
      >,
|};
const TextBasedCourseChapterItems = ({
  items,
  onCompleteTask,
  isTaskCompleted,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  // $FlowFixMe - map does not recognize time of items.
  return (
    <Line>
      <Column noMargin>
        {items.map((item, itemIndex) => {
          if (item.type === 'text') {
            return (
              <MarkdownText
                key={itemIndex.toString()}
                allowParagraphs
                source={item.text}
              />
            );
          }
          if (item.type === 'image') {
            return (
              <ColumnStackLayout key={itemIndex.toString()} alignItems="center">
                <ImageWithZoom width="90%" alt="" src={item.url} />
                {item.caption && (
                  <div style={{ color: gdevelopTheme.text.color.secondary }}>
                    <MarkdownText source={item.caption} />
                  </div>
                )}
              </ColumnStackLayout>
            );
          }
          if (item.type === 'video') {
            return (
              <ColumnStackLayout key={itemIndex.toString()} alignItems="center">
                <video src={item.url} style={styles.media} controls />
                {item.caption && (
                  <div style={{ color: gdevelopTheme.text.color.secondary }}>
                    <MarkdownText source={item.caption} />
                  </div>
                )}
              </ColumnStackLayout>
            );
          }
          if (item.type === 'task' && isTaskCompleted && onCompleteTask) {
            const isTaskComplete = isTaskCompleted(itemIndex);
            return (
              <TextBasedCourseChapterTaskItem
                key={itemIndex.toString()}
                task={item}
                isComplete={isTaskComplete}
                onComplete={() => onCompleteTask(itemIndex, !isTaskComplete)}
              />
            );
          }
          return null;
        })}
      </Column>
    </Line>
  );
};

export default TextBasedCourseChapterItems;

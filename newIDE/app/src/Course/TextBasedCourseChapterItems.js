// @flow
import * as React from 'react';

import type {
  TextBasedCourseChapterTaskItem as TextBasedCourseChapterTaskItemType,
  TextBasedCourseChapterTextItem as TextBasedCourseChapterTextItemType,
  TextBasedCourseChapterImageItem as TextBasedCourseChapterImageItemType,
} from '../Utils/GDevelopServices/Asset';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { MarkdownText } from '../UI/MarkdownText';
import ImageWithZoom from '../UI/ImageWithZoom';
import TextBasedCourseChapterTaskItem from './TextBasedCourseChapterTaskItem';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';

const styles = {
  image: {
    maxWidth: '100%',
  },
};
const TextBasedCourseChapterItems = ({
  items,
}: {
  items:
    | Array<
        | TextBasedCourseChapterTaskItemType
        | TextBasedCourseChapterTextItemType
        | TextBasedCourseChapterImageItemType
      >
    | Array<
        TextBasedCourseChapterTextItemType | TextBasedCourseChapterImageItemType
      >,
}) => {
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
              <ColumnStackLayout key={itemIndex.toString()}>
                <ImageWithZoom style={styles.image} alt="" src={item.url} />
                {item.caption && (
                  <div style={{ color: gdevelopTheme.text.color.secondary }}>
                    <MarkdownText source={item.caption} />
                  </div>
                )}
              </ColumnStackLayout>
            );
          }
          if (item.type === 'task') {
            return (
              <TextBasedCourseChapterTaskItem
                key={itemIndex.toString()}
                task={item}
                isComplete={false}
                onComplete={() => {}}
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

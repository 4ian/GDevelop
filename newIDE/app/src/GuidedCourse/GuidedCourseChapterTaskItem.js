// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import type { GuidedCourseChapterTask } from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Hint from '../UI/Hint';

type Props = {|
  guidedCourseChapterTask: GuidedCourseChapterTask,
  onCheck: () => void,
  isOpen: boolean,
  isComplete: boolean,
  onComplete: boolean => void,
|};

const GuidedCourseChapterTaskItem = ({
  guidedCourseChapterTask,
  onCheck,
  isOpen,
  isComplete,
  onComplete,
}: Props) => {
  return (
    <LineStackLayout alignItems="flex-start">
      <Column noMargin>
        <Line>
          <Checkbox
            checked={isComplete}
            onCheck={() => onComplete(!isComplete)}
          />
        </Line>
      </Column>
      <ColumnStackLayout expand noMargin>
        <Text size="sub-title">{guidedCourseChapterTask.title}</Text>
        {guidedCourseChapterTask.text && (
          <Text>{guidedCourseChapterTask.text}</Text>
        )}
        {isOpen &&
          guidedCourseChapterTask.imageUrls &&
          guidedCourseChapterTask.imageUrls.map(imageUrl => (
            <CorsAwareImage key={imageUrl} src={imageUrl} />
          ))}
        {isOpen && guidedCourseChapterTask.hint && (
          <Hint text={guidedCourseChapterTask.hint} />
        )}
        {isOpen && guidedCourseChapterTask.answer && (
          <Accordion>
            <AccordionHeader>
              <Text>
                <Trans>Answer</Trans>
              </Text>
            </AccordionHeader>
            <AccordionBody>
              {!!guidedCourseChapterTask.answer.text && (
                <Text>{guidedCourseChapterTask.answer.text}</Text>
              )}
              {!!guidedCourseChapterTask.answer.imageUrls &&
                guidedCourseChapterTask.answer.imageUrls.map(imageUrl => (
                  <CorsAwareImage key={imageUrl} src={imageUrl} />
                ))}
            </AccordionBody>
          </Accordion>
        )}
      </ColumnStackLayout>
    </LineStackLayout>
  );
};

export default GuidedCourseChapterTaskItem;

// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { type AnswerData, type QuestionData } from './Questionnaire';
import { Column, Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Paper from '../../../../UI/Paper';
import { ButtonBase, GridList, GridListTile } from '@material-ui/core';
import InlineCheckbox from '../../../../UI/InlineCheckbox';
import { t } from '@lingui/macro';
import { LineStackLayout } from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';

type AnswerProps = {|
  answerData: AnswerData,
  onSelect: string => void,
  selected: boolean,
  i18n: I18nType,
  showCheckbox: boolean,
|};

const Answer = ({
  answerData,
  i18n,
  onSelect,
  selected,
  showCheckbox,
}: AnswerProps) => {
  const { imageSource, text, code } = answerData;
  return (
    <ButtonBase
      style={{
        border: `1px solid ${selected ? 'white' : 'grey'}`,
        borderRadius: 10,
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
      onClick={() => onSelect(code)}
    >
      <Paper
        square={false}
        background="light"
        style={{ width: '100%', height: '100%' }}
      >
        <img
          src={imageSource}
          style={{
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            width: '100%',
          }}
          alt={`Illustration for option ${i18n._(text)}`}
        />
        <Line justifyContent="center">
          {showCheckbox ? <InlineCheckbox checked={selected} /> : null}
          <Column justifyContent="center">
            <Text noMargin>{i18n._(text)}</Text>
          </Column>
        </Line>
      </Paper>
    </ButtonBase>
  );
};

type Props = {|
  questionData: QuestionData,
  onSelectAnswer: string => void,
  selectedAnswers: string[],
  showNextButton?: boolean,
  onClickNext: () => void,
|};

const PersonalizationQuestion = ({
  questionData,
  onSelectAnswer,
  selectedAnswers,
  showNextButton,
  onClickNext,
}: Props) => {
  const { text, answers, multi } = questionData;

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          <Text size="block-title">{i18n._(text)}</Text>
          {multi ? (
            <Text>{i18n._(t`You can select more than one.`)}</Text>
          ) : null}
          <GridList cols={3} spacing={15} cellHeight="auto">
            {answers.map(answerData => (
              <GridListTile>
                <Answer
                  answerData={answerData}
                  i18n={i18n}
                  key={answerData.code}
                  onSelect={onSelectAnswer}
                  selected={selectedAnswers.includes(answerData.code)}
                  showCheckbox={!!multi}
                />
              </GridListTile>
            ))}
          </GridList>
          {showNextButton && (
            <LineStackLayout justifyContent="flex-end">
              <RaisedButton
                primary
                label={i18n._(t`Next`)}
                onClick={onClickNext}
              />
            </LineStackLayout>
          )}
        </Column>
      )}
    </I18n>
  );
};

export default PersonalizationQuestion;

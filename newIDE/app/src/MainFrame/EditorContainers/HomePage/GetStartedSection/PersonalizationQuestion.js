// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { type AnswerData, type QuestionData } from './Questionnaire';
import { Column, Line } from '../../../../UI/Grid';
import Text from '../../../../UI/Text';
import Paper from '../../../../UI/Paper';
import InlineCheckbox from '../../../../UI/InlineCheckbox';
import { LineStackLayout } from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';

import ButtonBase from '@material-ui/core/ButtonBase';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { darken, lighten, useTheme } from '@material-ui/core/styles';

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
    default:
      return 4;
  }
};

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
  const muiTheme = useTheme();
  const unselectedModifier =
    muiTheme.palette.type === 'dark' ? darken : lighten;
  return (
    <ButtonBase
      style={{
        border: 'solid',
        borderWidth: 1,
        borderColor: unselectedModifier(
          muiTheme.palette.text.primary,
          selected ? 0 : 0.7
        ),
        borderRadius: 8,
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
        <Line justifyContent={showCheckbox ? 'flex-start' : 'center'}>
          {showCheckbox ? (
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 'calc(50% - 9px)',
                }}
              >
                <InlineCheckbox checked={selected} paddingSize="small" />
              </div>
            </div>
          ) : null}
          <Column justifyContent="center" alignItems="center" expand>
            <div style={{ marginLeft: 25, marginRight: 25 }}>
              <Text noMargin>{i18n._(text)}</Text>
            </div>
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
  const windowWidth = useResponsiveWindowWidth();

  return (
    <I18n>
      {({ i18n }) => (
        <Column>
          <Text size="block-title">{i18n._(text)}</Text>
          {multi ? (
            <Text>{i18n._(t`You can select more than one.`)}</Text>
          ) : null}
          <GridList
            cols={getColumnsFromWidth(windowWidth)}
            spacing={15}
            cellHeight="auto"
          >
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

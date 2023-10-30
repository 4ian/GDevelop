// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import questionnaire, {
  firstQuestion,
  type QuestionData,
  type AnswerData,
} from './Questionnaire';
import PersonalizationQuestion, {
  TitleAndSubtitle,
} from './PersonalizationQuestion';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import SectionContainer, {
  type SectionContainerInterface,
} from '../SectionContainer';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { Column, Line } from '../../../../UI/Grid';
import ScrollView, {
  type ScrollViewInterface,
} from '../../../../UI/ScrollView';
import FlatButton from '../../../../UI/FlatButton';
import RaisedButton from '../../../../UI/RaisedButton';

const STEP_MAX_COUNT = 7;

export const isOnlyOneFreeAnswerPossible = (
  answers: Array<AnswerData>
): boolean => answers.length === 1 && 'isFree' in answers[0];

const styles = {
  navigationDot: {
    height: 8,
    width: 8,
    borderRadius: '50%',
    margin: 5,
  },
  subTitle: { opacity: 0.6 },
};

type UserAnswers = Array<{|
  questionId: string,
  answers: string[],
  userInput?: string,
|}>;

const NavigationStep = ({ stepIndex }: {| stepIndex: number |}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Line justifyContent="center">
      {new Array(STEP_MAX_COUNT).fill(0).map((_, index) => {
        return (
          <div
            key={index}
            style={{
              ...styles.navigationDot,
              backgroundColor:
                index === stepIndex
                  ? gdevelopTheme.text.color.primary
                  : gdevelopTheme.text.color.disabled,
            }}
          />
        );
      })}
    </Line>
  );
};

type DisplayProps = {|
  userAnswers: UserAnswers,
  onSelectAnswer: (string, string) => void,
  goToNextQuestion: QuestionData => void,
  onClickSend: string => void,
  onChangeUserInputValue: (string, string) => void,
  questionId: string,
|};

const DesktopDisplay = ({
  userAnswers,
  onSelectAnswer,
  goToNextQuestion,
  onClickSend,
  onChangeUserInputValue,
  questionId,
}: DisplayProps) => {
  const questionData = questionnaire[questionId];
  const sectionContainerRef = React.useRef<?SectionContainerInterface>(null);

  const scrollToBottom = React.useCallback(() => {
    // If no timeout, the container does not scroll to the very bottom, even
    // if called by layout effect.
    setTimeout(() => {
      if (sectionContainerRef.current) {
        sectionContainerRef.current.scrollToBottom({ smooth: true });
      }
    }, 100);
  }, []);

  React.useEffect(
    () => {
      scrollToBottom();
    },
    [questionId, scrollToBottom]
  );

  const questionsToRender: React.Node[] = userAnswers.map(
    (userAnswer, index) => {
      const relatedQuestionData = questionnaire[userAnswer.questionId];
      return (
        <PersonalizationQuestion
          key={userAnswer.questionId}
          questionData={relatedQuestionData}
          selectedAnswers={userAnswer.answers}
          onSelectAnswer={answer =>
            onSelectAnswer(userAnswer.questionId, answer)
          }
          showNextButton={
            (relatedQuestionData.multi ||
              isOnlyOneFreeAnswerPossible(relatedQuestionData.answers)) &&
            index === userAnswers.length - 1 &&
            questionId === userAnswer.questionId
          }
          onClickNext={() => goToNextQuestion(relatedQuestionData)}
          showQuestionText={true}
          onClickSend={
            userAnswer.questionId === firstQuestion ? onClickSend : undefined
          }
          userInputValue={userAnswer.userInput || ''}
          onChangeUserInputValue={value =>
            onChangeUserInputValue(userAnswer.questionId, value)
          }
        />
      );
    }
  );

  // When answering a multi answer question, the first click on an answer adds an item to
  // user answers. The question is then displayed through userAnswers and should not
  // be rendered a second time as a question.
  const shouldDisplayQuestion =
    questionData &&
    (!questionData.multi ||
      userAnswers[userAnswers.length - 1].questionId !== questionId) &&
    !(
      userAnswers[userAnswers.length - 1] &&
      userAnswers[userAnswers.length - 1].questionId === firstQuestion &&
      userAnswers[userAnswers.length - 1].answers[0] === 'input'
    ) &&
    !isOnlyOneFreeAnswerPossible(questionData.answers);

  if (shouldDisplayQuestion) {
    const questionData = questionnaire[questionId];
    questionsToRender.push(
      <PersonalizationQuestion
        key={questionId}
        questionData={questionData}
        selectedAnswers={[]}
        onSelectAnswer={answer => onSelectAnswer(questionId, answer)}
        onClickNext={() => goToNextQuestion(questionData)}
        showNextButton={questionData.multi}
        showQuestionText={true}
      />
    );
  }
  return (
    <SectionContainer
      title={null} // Let the content handle the title.
      flexBody
      ref={sectionContainerRef}
    >
      <ColumnStackLayout noMargin>{questionsToRender}</ColumnStackLayout>
    </SectionContainer>
  );
};

type MobileDisplayProps = {|
  ...DisplayProps,
  goToPreviousQuestion: () => void,
|};

const MobileDisplay = ({
  userAnswers,
  onSelectAnswer,
  goToNextQuestion,
  goToPreviousQuestion,
  onClickSend,
  questionId,
  onChangeUserInputValue,
}: MobileDisplayProps) => {
  const scrollViewRef = React.useRef<?ScrollViewInterface>();

  React.useEffect(
    () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToPosition(0);
      }
    },
    [questionId]
  );

  const questionData = questionnaire[questionId];
  if (!questionData) return null;

  const userAnswer = userAnswers.find(
    answer => answer.questionId === questionId
  );

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          title={null} // Let the content handle the title.
          flexBody
          noScroll
        >
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Column noMargin alignItems="center">
              <TitleAndSubtitle
                i18n={i18n}
                multi={questionData.multi}
                answers={questionData.answers}
                text={questionData.text}
                textAlign="center"
              />
            </Column>
            <ScrollView ref={scrollViewRef}>
              <PersonalizationQuestion
                key={questionId}
                questionData={questionData}
                selectedAnswers={userAnswer ? userAnswer.answers : []}
                onSelectAnswer={answer => onSelectAnswer(questionId, answer)}
                onClickNext={() => goToNextQuestion(questionData)}
                showNextButton={false}
                showQuestionText={false}
                onClickSend={
                  questionId === firstQuestion ? onClickSend : undefined
                }
                userInputValue={
                  userAnswer ? userAnswer.userInput || '' : undefined
                }
                onChangeUserInputValue={value =>
                  onChangeUserInputValue(questionId, value)
                }
              />
            </ScrollView>
            <Column noMargin>
              <LineStackLayout justifyContent="stretch" expand>
                {questionId !== firstQuestion && (
                  <FlatButton
                    fullWidth
                    label={i18n._(t`Back`)}
                    onClick={goToPreviousQuestion}
                  />
                )}
                {(questionData.multi ||
                  isOnlyOneFreeAnswerPossible(questionData.answers)) && (
                  <RaisedButton
                    primary
                    fullWidth
                    label={i18n._(t`Next`)}
                    onClick={() => goToNextQuestion(questionData)}
                    disabled={
                      userAnswer ? userAnswer.answers.length === 0 : true
                    }
                  />
                )}
              </LineStackLayout>

              <NavigationStep
                stepIndex={
                  userAnswers.length +
                  (questionData.multi &&
                  userAnswers[userAnswers.length - 1].questionId === questionId
                    ? -1
                    : 0)
                }
              />
            </Column>
          </div>
        </SectionContainer>
      )}
    </I18n>
  );
};

type Props = {| onQuestionnaireFinished: () => void |};

const PersonalizationFlow = ({ onQuestionnaireFinished }: Props) => {
  const [questionId, setQuestionId] = React.useState<string>(firstQuestion);
  const windowWidth = useResponsiveWindowWidth();
  const [userAnswers, setUserAnswers] = React.useState<UserAnswers>([]);

  const goToNextQuestion = React.useCallback(
    (questionData: QuestionData, answerData?: AnswerData) => {
      if (answerData && answerData.nextQuestion) {
        setQuestionId(answerData.nextQuestion);
        return;
      }
      if (questionData.nextQuestion) {
        setQuestionId(questionData.nextQuestion);
        return;
      }
      if (questionData.getNextQuestion) {
        const nextQuestionId = questionData.getNextQuestion(userAnswers);
        if (nextQuestionId) {
          setQuestionId(nextQuestionId);
          return;
        }
      }
      onQuestionnaireFinished();
    },
    [userAnswers, onQuestionnaireFinished]
  );

  const onChangeUserInputValue = React.useCallback(
    (questionId: string, value: string) => {
      const matchingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.questionId === questionId
      );
      if (matchingUserAnswerIndex < 0) return;
      const newUserAnswers = [...userAnswers];
      newUserAnswers[matchingUserAnswerIndex].userInput = value;
      setUserAnswers(newUserAnswers);
    },
    [userAnswers]
  );

  React.useEffect(
    () => {
      // On each questionId change, check if new question only has one free answer possible.
      // If that's the case, automatically add an answer to user answers.
      const questionData = questionnaire[questionId];
      if (!questionData) return;
      const { answers } = questionData;
      if (
        isOnlyOneFreeAnswerPossible(answers) &&
        userAnswers.every(userAnswer => userAnswer.questionId !== questionId)
      ) {
        setUserAnswers([
          ...userAnswers,
          { questionId, userInput: '', answers: [answers[0].id] },
        ]);
      }
    },
    [questionId, userAnswers]
  );

  const onSelectAnswer = React.useCallback(
    (questionId: string, answerId: string) => {
      const questionData = questionnaire[questionId];
      const { multi } = questionData;
      const existingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.questionId === questionId
      );
      const shouldGoToNextQuestion = answerId !== 'input';
      if (existingUserAnswerIndex >= 0) {
        // User is coming back to a previous question
        if (multi) {
          // Add or remove answer to multi-choice question
          const newUserAnswers = [...userAnswers];
          const answerIndex = newUserAnswers[
            existingUserAnswerIndex
          ].answers.indexOf(answerId);
          if (answerIndex >= 0) {
            newUserAnswers[existingUserAnswerIndex].answers.splice(
              answerIndex,
              1
            );
          } else {
            newUserAnswers[existingUserAnswerIndex].answers.push(answerId);
          }
          setUserAnswers(newUserAnswers);
        } else {
          // Handle new answer (that could be the same as before).
          const hasAnswerChanged =
            userAnswers[existingUserAnswerIndex].answers[0] !== answerId;
          if (!hasAnswerChanged) return;
          const newUserAnswers = [...userAnswers];
          newUserAnswers[existingUserAnswerIndex].answers = [answerId];
          const doesAnswerChangesFollowingQuestion =
            !questionData.nextQuestion ||
            (questionId === firstQuestion && answerId === 'input');
          if (doesAnswerChangesFollowingQuestion) {
            newUserAnswers.splice(
              existingUserAnswerIndex + 1,
              userAnswers.length - existingUserAnswerIndex
            );
          }
          setUserAnswers(newUserAnswers);
          if (doesAnswerChangesFollowingQuestion) {
            const answerData = questionData.answers.find(
              answerData => answerData.id === answerId
            );
            if (shouldGoToNextQuestion) {
              goToNextQuestion(questionData, answerData);
            }
          } else {
            if (shouldGoToNextQuestion) {
              goToNextQuestion(questionData);
            }
          }
        }
      } else {
        setUserAnswers([...userAnswers, { questionId, answers: [answerId] }]);
        const answerData = questionData.answers.find(
          answerData => answerData.id === answerId
        );
        if (!multi && shouldGoToNextQuestion) {
          goToNextQuestion(questionData, answerData);
        }
      }
    },
    [userAnswers, goToNextQuestion]
  );

  const goToPreviousQuestion = React.useCallback(
    () => {
      const currentAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.questionId === questionId
      );
      if (currentAnswerIndex === -1) {
        setQuestionId(userAnswers[userAnswers.length - 1].questionId);
      } else if (currentAnswerIndex >= 1) {
        setQuestionId(userAnswers[currentAnswerIndex - 1].questionId);
      }
    },
    [userAnswers, questionId]
  );

  if (windowWidth === 'small') {
    return (
      <MobileDisplay
        questionId={questionId}
        goToNextQuestion={goToNextQuestion}
        goToPreviousQuestion={goToPreviousQuestion}
        onSelectAnswer={onSelectAnswer}
        userAnswers={userAnswers}
        onClickSend={content => console.log(content)}
        onChangeUserInputValue={onChangeUserInputValue}
      />
    );
  }

  return (
    <DesktopDisplay
      questionId={questionId}
      goToNextQuestion={goToNextQuestion}
      onSelectAnswer={onSelectAnswer}
      userAnswers={userAnswers}
      onClickSend={content => console.log(content)}
      onChangeUserInputValue={onChangeUserInputValue}
    />
  );
};

export default PersonalizationFlow;

// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import questionnaire, {
  firstQuestion,
  type QuestionData,
  type AnswerData,
} from './Questionnaire';
import PersonalizationQuestion from './PersonalizationQuestion';
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
import Text from '../../../../UI/Text';
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
  stepName: string,
  answers: string[],
  /** Used to store user input in question with showOther */
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
  step: string,
|};

const DesktopDisplay = ({
  userAnswers,
  onSelectAnswer,
  goToNextQuestion,
  onClickSend,
  onChangeUserInputValue,
  step,
}: DisplayProps) => {
  const questionData = questionnaire[step];
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
    [step, scrollToBottom]
  );

  const questionsToRender: React.Node[] = userAnswers.map(
    (userAnswer, index) => {
      const relatedQuestionData = questionnaire[userAnswer.stepName];
      return (
        <PersonalizationQuestion
          key={userAnswer.stepName}
          questionData={relatedQuestionData}
          selectedAnswers={userAnswer.answers}
          onSelectAnswer={answer => onSelectAnswer(userAnswer.stepName, answer)}
          showNextButton={
            (relatedQuestionData.multi ||
              isOnlyOneFreeAnswerPossible(relatedQuestionData.answers)) &&
            index === userAnswers.length - 1 &&
            step === userAnswer.stepName
          }
          onClickNext={() => goToNextQuestion(relatedQuestionData)}
          showQuestionText={true}
          onClickSend={
            userAnswer.stepName === firstQuestion ? onClickSend : undefined
          }
          userInputValue={userAnswer.userInput || ''}
          onChangeUserInputValue={value =>
            onChangeUserInputValue(userAnswer.stepName, value)
          }
        />
      );
    }
  );

  // When answering a multi answer question, the first click on an answer adds an item to
  // user answers. The question is then displayed through userAnswers and should not
  // be rendered a second time as a question.
  const shouldDisplayStep =
    questionData &&
    (!questionData.multi ||
      userAnswers[userAnswers.length - 1].stepName !== step) &&
    !(
      userAnswers[userAnswers.length - 1] &&
      userAnswers[userAnswers.length - 1].stepName === firstQuestion &&
      userAnswers[userAnswers.length - 1].answers[0] === 'otherWithInput'
    ) &&
    !isOnlyOneFreeAnswerPossible(questionData.answers);

  if (shouldDisplayStep) {
    const questionData = questionnaire[step];
    questionsToRender.push(
      <PersonalizationQuestion
        key={step}
        questionData={questionData}
        selectedAnswers={[]}
        onSelectAnswer={answer => onSelectAnswer(step, answer)}
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
  step,
  onChangeUserInputValue,
}: MobileDisplayProps) => {
  const scrollViewRef = React.useRef<?ScrollViewInterface>();

  React.useEffect(
    () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToPosition(0);
      }
    },
    [step]
  );

  const questionData = questionnaire[step];
  if (!questionData) return null;

  const userAnswer = userAnswers.find(answer => answer.stepName === step);

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
              <Text align="center" size="block-title">
                {i18n._(questionData.text)}
              </Text>
              {questionData.multi ? (
                <Text align="center" style={styles.subTitle}>
                  {i18n._(t`You can select more than one.`)}
                </Text>
              ) : isOnlyOneFreeAnswerPossible(questionData.answers) ? (
                <Text align="center" style={styles.subTitle}>
                  {i18n._(
                    t`The more descriptive you are, the better we can match the content we’ll recommend.`
                  )}
                </Text>
              ) : null}
            </Column>
            <ScrollView ref={scrollViewRef}>
              <PersonalizationQuestion
                key={step}
                questionData={questionData}
                selectedAnswers={userAnswer ? userAnswer.answers : []}
                onSelectAnswer={answer => onSelectAnswer(step, answer)}
                onClickNext={() => goToNextQuestion(questionData)}
                showNextButton={false}
                showQuestionText={false}
                onClickSend={step === firstQuestion ? onClickSend : undefined}
                userInputValue={
                  userAnswer ? userAnswer.userInput || '' : undefined
                }
                onChangeUserInputValue={value =>
                  onChangeUserInputValue(step, value)
                }
              />
            </ScrollView>
            <Column noMargin>
              <LineStackLayout justifyContent="stretch" expand>
                {step !== firstQuestion && (
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
                  userAnswers[userAnswers.length - 1].stepName === step
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
  const [step, setStep] = React.useState<string>(firstQuestion);
  const windowWidth = useResponsiveWindowWidth();
  const [userAnswers, setUserAnswers] = React.useState<UserAnswers>([]);

  const goToNextQuestion = React.useCallback(
    (questionData: QuestionData, answerData?: AnswerData) => {
      if (answerData && answerData.nextQuestion) {
        setStep(answerData.nextQuestion);
        return;
      }
      if (questionData.nextQuestion) {
        setStep(questionData.nextQuestion);
        return;
      }
      if (questionData.getNextQuestion) {
        const nextStep = questionData.getNextQuestion(userAnswers);
        if (nextStep) {
          setStep(nextStep);
          return;
        }
      }
      onQuestionnaireFinished();
    },
    [userAnswers, onQuestionnaireFinished]
  );

  const onChangeUserInputValue = React.useCallback(
    (step: string, value: string) => {
      const matchingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.stepName === step
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
      // On each step change, check if new question only has one free answer possible.
      // If that's the case, automatically add an answer to user answers.
      const questionData = questionnaire[step];
      if (!questionData) return;
      const { answers } = questionData;
      if (
        isOnlyOneFreeAnswerPossible(answers) &&
        userAnswers.every(userAnswer => userAnswer.stepName !== step)
      ) {
        setUserAnswers([
          ...userAnswers,
          { stepName: step, userInput: '', answers: [answers[0].id] },
        ]);
      }
    },
    [step, userAnswers]
  );

  const onSelectAnswer = React.useCallback(
    (step: string, answerId: string) => {
      const questionData = questionnaire[step];
      const { multi } = questionData;
      const existingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.stepName === step
      );
      const shouldGoToNextQuestion = answerId !== 'otherWithInput';
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
          const newUserAnswers = [...userAnswers];
          newUserAnswers[existingUserAnswerIndex].answers = [answerId];
          const doesAnswerChangesFollowingQuestion =
            !questionData.nextQuestion ||
            (step === firstQuestion && answerId === 'otherWithInput');
          if (doesAnswerChangesFollowingQuestion && hasAnswerChanged) {
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
        setUserAnswers([
          ...userAnswers,
          { stepName: step, answers: [answerId] },
        ]);
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
        userAnswer => userAnswer.stepName === step
      );
      if (currentAnswerIndex === -1) {
        setStep(userAnswers[userAnswers.length - 1].stepName);
      } else if (currentAnswerIndex >= 1) {
        setStep(userAnswers[currentAnswerIndex - 1].stepName);
      }
    },
    [userAnswers, step]
  );

  if (windowWidth === 'small') {
    return (
      <MobileDisplay
        step={step}
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
      step={step}
      goToNextQuestion={goToNextQuestion}
      onSelectAnswer={onSelectAnswer}
      userAnswers={userAnswers}
      onClickSend={content => console.log(content)}
      onChangeUserInputValue={onChangeUserInputValue}
    />
  );
};

export default PersonalizationFlow;

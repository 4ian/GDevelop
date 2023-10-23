// @flow

import * as React from 'react';
import questionnaire, {
  firstQuestion,
  type QuestionData,
  type AnswerData,
} from './Questionnaire';
import PersonalizationQuestion from './PersonalizationQuestion';
import { ColumnStackLayout } from '../../../../UI/Layout';

type Props = {||};

const PersonalizationFlow = (props: Props) => {
  const [step, setStep] = React.useState<string>(firstQuestion);
  const [userAnswers, setUserAnswers] = React.useState<
    Array<{| stepName: string, answers: string[] |}>
  >([]);
  const questionData = questionnaire[step];

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
      setStep('over');
    },
    []
  );

  const onSelectAnswer = React.useCallback(
    (step: string, answer: string) => {
      const questionData = questionnaire[step];
      const { multi } = questionData;
      console.log(questionData);
      const existingUserAnswerIndex = userAnswers.findIndex(
        userAnswer => userAnswer.stepName === step
      );
      if (existingUserAnswerIndex >= 0) {
        if (multi) {
          const newUserAnswers = [...userAnswers];
          const answerIndex = newUserAnswers[
            existingUserAnswerIndex
          ].answers.indexOf(answer);
          if (answerIndex >= 0) {
            newUserAnswers[existingUserAnswerIndex].answers.splice(
              answerIndex,
              1
            );
          } else {
            newUserAnswers[existingUserAnswerIndex].answers.push(answer);
          }
          setUserAnswers(newUserAnswers);
        } else {
          const newUserAnswers = [...userAnswers];
          newUserAnswers[existingUserAnswerIndex].answers = [answer];
          setUserAnswers(newUserAnswers);
        }
      } else {
        setUserAnswers([...userAnswers, { stepName: step, answers: [answer] }]);
        const answerData = questionData.answers.find(
          answerData => answerData.code === answer
        );
        if (!multi) {
          goToNextQuestion(questionData, answerData);
        }
      }
    },
    [userAnswers, goToNextQuestion]
  );

  userAnswers.forEach(answer => {
    console.log(answer.stepName, answer.answers);
  });

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
            relatedQuestionData.multi &&
            index === userAnswers.length - 1 &&
            step === userAnswer.stepName
          }
          onClickNext={() => goToNextQuestion(relatedQuestionData)}
        />
      );
    }
  );

  // When answering a multi answer question, the first click on an answer adds an item to
  // user answers. The question is then displayed through questionsToRender and should not
  // be rendered a second time.
  const shouldDisplayStep =
    questionData &&
    (!questionData.multi ||
      userAnswers[userAnswers.length - 1].stepName !== step);

  if (shouldDisplayStep) {
    const questionData = questionnaire[step];
    questionsToRender.push(
      <PersonalizationQuestion
        key={step}
        questionData={questionData}
        selectedAnswers={[]}
        onSelectAnswer={answer => onSelectAnswer(step, answer)}
        onClickNext={() => goToNextQuestion(questionData)}
      />
    );
  }
  return <ColumnStackLayout noMargin>{questionsToRender}</ColumnStackLayout>;
};

export default PersonalizationFlow;

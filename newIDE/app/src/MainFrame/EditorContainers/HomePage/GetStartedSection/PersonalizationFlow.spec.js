// @flow

import { formatUserAnswers } from './PersonalizationFlow';

describe('formatUserAnswers', () => {
  test('it formats a complex user answers', () => {
    const userAnswers = [
      {
        questionId: 'creationGoal',
        answers: ['building'],
      },
      {
        questionId: 'buildingKindOfProjects',
        answers: ['videoGame', 'interactiveContent'],
      },
      {
        questionId: 'projectDescription',
        userInput: 'Best video game',
        answers: ['input'],
      },
      {
        questionId: 'workingTeam',
        answers: ['onePlus'],
      },
      {
        questionId: 'painPoints',
        answers: ['lackGraphics', 'lackSound', 'input'],
        userInput: 'Better ideas',
      },
      {
        questionId: 'targetDate',
        answers: ['1MonthOrLess'],
      },
      {
        questionId: 'gameDevelopmentExperience',
        answers: ['someNoCode'],
      },
      {
        questionId: 'targetPlatform',
        answers: ['client', 'androidApp', 'console'],
      },
    ];
    const expectedUSerSurvey = {
      creationGoal: ['building'],
      kindOfProjects: ['videoGame', 'interactiveContent'],
      projectDescription: 'Best video game',
      workingTeam: ['onePlus'],
      painPoints: ['lackGraphics', 'lackSound'],
      painPointsInput: 'Better ideas',
      targetDate: ['1MonthOrLess'],
      gameDevelopmentExperience: ['someNoCode'],
      targetPlatform: ['client', 'androidApp', 'console'],
    };
    expect(formatUserAnswers(userAnswers)).toEqual(expectedUSerSurvey);
  });
});

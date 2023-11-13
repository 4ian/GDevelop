// @flow

import { formatUserAnswers } from './UserSurvey';

describe('formatUserAnswers', () => {
  test('it sets projectDescription as string even if user answer is empty', () => {
    const userAnswers = [
      {
        questionId: 'projectDescription',
        userInput: '',
        answers: ['input'],
      },
    ];

    expect(formatUserAnswers(userAnswers)).toEqual({
      projectDescription: '',
    });
  });

  test('it removes creationGoal answer when choosing other at first question', () => {
    const userAnswers = [
      {
        questionId: 'creationGoal',
        answers: ['input'],
        userInput: 'Bonjour  ',
      },
    ];

    expect(formatUserAnswers(userAnswers)).toEqual({
      creationGoalInput: 'Bonjour',
    });
  });
  test('it does not set input if value is spaces only', () => {
    const userAnswers = [
      {
        questionId: 'painPoints',
        answers: ['lackGraphics', 'lackSound', 'input'],
        userInput: '    ',
      },
    ];

    expect(formatUserAnswers(userAnswers)).toEqual({
      painPoints: ['lackGraphics', 'lackSound'],
    });
  });

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

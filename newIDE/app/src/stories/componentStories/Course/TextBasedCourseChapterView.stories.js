// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import type { UnlockedTextBasedCourseChapter } from '../../../Utils/GDevelopServices/Asset';
import TextBasedCourseChapterView from '../../../Course/TextBasedCourseChapterView';

import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Course/TextBasedCourseChapterView',
  component: TextBasedCourseChapterView,
  decorators: [paperDecorator],
};

const courseChapter1: UnlockedTextBasedCourseChapter = {
  title: 'Introduction',
  templates: [],
  items: [
    {
      type: 'text',
      text:
        "Welcome to this comprehensive course on User Interface (UI) and User Experience (UX)! Whether you're a solo developer or part of a small team, understanding these principles is crucial for creating cohesive UI controllers, designing smooth experiences, and testing with your players before the official launch of your game.",
    },
    {
      type: 'text',
      text:
        "Throughout this course, we'll explore the fundamental concepts of UI and UX design, breaking down complex theory and topics into practical easy-to-apply guidelines. You’ll also receive practical tools and data bases available online for free to enhance your game development process.",
    },
    {
      type: 'text',
      text:
        "While we won't dive into advanced design concepts and practices, you'll gain enough knowledge to make informed decisions about your game's interface and game progression. By the end of this course, you'll have a solid foundation in UI/UX principles like visual hierarchy, typography, color theory, and how these elements work together to create intuitive game interfaces. ",
    },
    {
      type: 'text',
      text:
        "Let's start by understanding the basics of UI and UX, and how they contribute to creating successful games:",
    },
    {
      type: 'text',
      text:
        '- **What is the role of UI and UX to make good games?**\n\n  A game UI is made up game assets and sprites; while game mechanics, game play and level of difficulty are UX. Imagine a game without game art and without sounds. You will probably be clicking buttons without any feedback on your progress. That wouldn’t be fun.\n\n  However, with beautiful art and animations (UI), good sound design, motivating game progression and feedback on your progress (UX), what could be “just clicking buttons” becomes fun and exciting!  This is why video-games are the perfect example of UI/UX!',
    },
    {
      type: 'image',
      url:
        'https://public-resources.gdevelop.io/staging/course/images/0426867a-ae95-485a-885d-16a46bb9886f.png',
      caption: '*Monstra by Game Creator MOHMOH available on gd.games*',
    },
    {
      type: 'text',
      text:
        "- **Ok, but what is User Interface and what's its purpose?**\n\n  A game's UI consists of buttons, progress bars, character animations, settings screens, and stats. These components communicate essential information to players clearly and simply, helping them understand the game state and make informed decisions.",
    },
    {
      type: 'text',
      text:
        '- **And what is “User Experience”, and what’s its purpose?**\n\n  It’s the overall experience of a player while they interact with a game or application. It includes how intuitive, enjoyable, and accessible the experience feels from the moment they launch the game to when they stop playing.',
    },
    {
      type: 'text',
      text:
        '- **What are the visual elements of UI interfaces?**\n\n  The main blocks of UI design are Letters, color and Shape. But when we talk about interaction we also have Sound and Movement.',
    },
    {
      type: 'text',
      text:
        '- **Let’s quickly talk about letters:**\n\n  Did you know that ”making letters” is a job? “Typography Designers” -which is their official name- create letters to fit physical supports like print, desktop and mobile. They also make sure they can be read up close or far away, as well as by people with cognitive disabilities. For example: it has been proven that people with dyslexia can benefit from specific traits in letter design, which is how the font “Dyslexie” was designed.',
    },
    {
      type: 'image',
      url:
        'https://public-resources.gdevelop.io/staging/course/images/2e9daaf5-c2a8-4401-8446-6b7bd6f38771.png',
    },
    {
      type: 'text',
      text:
        "&#9;While you don't need to be a type designer to select fonts, this course will provide practical guidelines to ensure your chosen font family creates a positive experience for your players.",
    },
    { type: 'text', text: '- **Let’s talk about color**' },
    {
      type: 'text',
      text:
        '&#9;Color is a fascinating phenomenon that occurs when surfaces reflect light, which our eyes then perceive. What makes color especially interesting is that it exists in our eyes—meaning different people can perceive the same color in different ways:',
    },
    {
      type: 'text',
      text:
        '&#9;In 2015 *this* dress became viral because certain people saw a red/golden dress, while others saw a blue/black dress… ',
    },
    {
      type: 'image',
      url:
        'https://public-resources.gdevelop.io/staging/course/images/d079a8a9-4ebf-4933-b02a-6fc9b95e0d46.png',
    },
    {
      type: 'text',
      text:
        '&#9;During this course you will learn how to understand and work with color and color palette models, as well as creating for people perceiving color differently.',
    },
    {
      type: 'task',
      title: 'Task:',
      items: [
        {
          type: 'text',
          text:
            'Look at how your eyes process color: stare at the red dot in this Mona Lisa image for 20 seconds, then close your eyes.\n\nWhat causes you to see the image in different colors when your eyes are closed?',
        },
        {
          type: 'image',
          url:
            'https://public-resources.gdevelop.io/staging/course/images/f97e3d55-326b-49a2-9fa3-49673822115c.jpg',
        },
      ],
      answer: {
        items: [
          {
            type: 'text',
            text:
              'The image has its original colors inverted: dark colors appear lighter, and light sections appear darker. When you stare at the image for 20 seconds, the photoreceptors in your eyes become overstimulated, causing fatigue and loss of sensitivity. This is why you see a different image when your eyes are closed and resting.\n\nThese same photoreceptors are what cause people with color blindness to see colors differently than you do. At the end of this course, you will learn how to include them in your color palette choices.',
          },
        ],
      },
    },
  ],
  id: 'intro',
  shortTitle: 'Introduction',
};

export const Chapter1 = () => {
  return (
    <TextBasedCourseChapterView
      courseChapter={courseChapter1}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};

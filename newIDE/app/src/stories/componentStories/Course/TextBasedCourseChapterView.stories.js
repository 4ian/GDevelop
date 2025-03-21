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

const courseChapter: UnlockedTextBasedCourseChapter = {
  id: 'intro',
  title: 'Introduction',
  templateUrls: [],
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0426867a-ae95-485a-885d-16a46bb9886f/monstra.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666SRUJDQG%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T155735Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIQDp%2Bn6IRFVdC74N2D%2BXMvRL8BVbjkj9VqHHpNU9z9NNygIgWyaoKOTaJcivSGAeAygwO7BHMvgfwzk5%2FN8%2BGYzM1LUqiAQIqP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDGqEXCnSpi7bWnsdeSrcA2tQkybb52F8qRZF3yXmvp8ArkGpVwI6ZNU1qGwLBj04ROLY1%2B0oe0qsllzX2Bn1QCm%2B7IPF%2Bfoftm%2FCczqT04fiSnT10ycfq1PMkqcZ028ba78stdhYFAj8oyiyxYQV4ODLDSWupUNLGS%2FDC800siuOLeME7cfI31yN%2F3FWMwmyJ4uOfFQw1bk5tR1kh%2BhPvblUrZZT4I299QL8wesfSrsX4O17V7cOihqB52uDNMYTFuzlkGFeFiV3wx0a45R4lTLDTXiWt28b1%2Bbejy45g91o9zegZ5kbF0LkRpIHGHVrzrX94vXAIdT%2Fp2q%2BLfZ60DxxF4cKzQenXwgNWtMVuwHqnSSEkFjQt3CBxX73vJwJ5r3yEPfAMn4iFETbBU2XGoddZSwqcSj2Jzj%2FuKoOIAGzHurys3gOCZtw32cwI0t5lXKUF4fBku3tKtWZUW9MlRWKwBSiiNoaP8VmxYQ7Ap5NXbk5m8mD3oakclgi8JgNzTCrSseeH%2BNE6vfvLICvV9DagG51hJIXIEuROpgnEyiThECBbvcAnJHcfIo6WatIqJRdsJum2REFYiymf3j7r8GWsxEH4vQxjo3Ybt6W2q5WvbpP8LO%2FuVMmFMlbxkTWNMFsFjyiOd%2BI%2BTimMOb59b4GOqUB3XcTXbVOZRr%2BPrzOynhLXucZJEqNvmljSYNCeFAfBopJt2%2FmCm4yTvR752qgZrrM8J5I0Fde1ju5OXKiBwSGsbAZbsN1Bkjz0Gm5VXmmPlBDbGvVt0lcd04310toPQ4SkfywTIzq%2B9xlEKCP4bZBbzAnK0BI3xVymvCOrUgOzwOaoe21aMHWUEt9%2Bss4DPp2OH%2BWjZijGYPQblGd7SIkzT%2BO8Dpv&X-Amz-Signature=cbada25f72c8bf6b2ef2c676523c1e8bc2ba72ef049b55bb3d687716f5aa414b&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/2e9daaf5-c2a8-4401-8446-6b7bd6f38771/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466SK7SSOEU%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T155738Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJIMEYCIQCx8kuM5SLK3MPvj1JtPjBnGywcc9M6sP6WvTIE4OpsSgIhAPQyLdta83ebjBHeEbA6A7SQzl9SP5lVHvS7b2VEJ6Z9KogECKj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgzWEOEjJBKTmReGkvQq3AMNolCxXncG5501B3TwuwkJawvbQW6MVBYXKPi09BV6HtI5WBm79H9JL8AJIXhKAdDZ925YVFPOmzGt9UV3LlhR2AKz1ZvMUwCFcteiNStU3ShYbnHK6eDggS%2FDv%2BFUo%2BVvlIAdN4G9kAzKfmn9hIuwU8dak32UR4a3ke1XruaBkFUfBiFFM1pBsbVeTxIi%2F5VkCy2VlPvHwrXLIVcHVC3H1vkuj3ZzepB3XgIDPOmg1OBm7BKHjOjdV9FlAIimKruD4Qq3wsO1Q3IzTefREyVREbI5%2BhTbt5NTH6BRdZbrbWeRrNGn8JAtBtaVUBMGnJ2dQgcT9KJUYo0C%2BvfwfsTfqJ%2BaE%2BRYPfsrRzuHA14i%2F2qx0dUTZIpChcAoH9IPRnsmt4EYpwnlXBw%2FHu%2Bx8%2FGYTks805AaezvWkZUQOW2OHkTRgF7zO8Yc0%2BBczon0vPE0rVd5hnyQbLkJoNU2R8CpbLjwxLkhaWdsUtO7DRpspG2o7cXefOlZgDdTSJS61fU1ZU7yMKdhD1BddGU9ZMh7GGR6X0eIsDCpPr7ggzeLyQxXJkyOnR7%2FJ%2Bhp4PY8YSXHLlcklzwxGpbaJ8Om28BajPM4HbcXms2WE%2BLFbyIUftr4CQkLc%2FzRmQ5C5TDEhfa%2BBjqkAWsRE%2B8xMIrnPaswA0d8CB1m39Hyz7O82xnjgRTE7ss6%2Bi09nrpyr8J0FL%2BZEjn%2BddRW4cPSGrMovqnJ7aahlM8pBD2y7SxrOs0%2F7i%2BRX5ehqKAKF42wx68raTTYl%2F%2F0GejuGFtc29qQ7m%2BkvGLc9TRag81doPJolmKaoPViWdAgg%2Fpq5nEOPzFw4c1aBA5PCn8sJzp6CqZwtqEIiXOz6jiYr18l&X-Amz-Signature=e9f41e8cd270452ff3f23c6c3c05788e19684dcd105c449ce334b289066e4298&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/d079a8a9-4ebf-4933-b02a-6fc9b95e0d46/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466UPW2CJDX%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T155738Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIQCqHfJlbKHXvn2NXge9BGGeIUiWQWiZ40toit0ZnHqkEgIgOpASUHAkbJuh%2BbbSOApzU1OAVobhIa3BQsJPV7g20h8qiAQIqP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDN9whFnMSPoVQaCQ4yrcA1iIYFBj7OTXxLYvnx48DaXGXfpN7wIppwG6QMED7oKcBpH%2FEJFGbUCzl1TzSvBvUmUS2gpzUtZHzIBWNkR27ozinS9f0xdfZN5AH4fn35SYnxTdpdjTO9ZOWB5M37OWLllmLzVb8UPb%2BvwkwI94bfo%2FDkM7RQI5rGP0qrPOmAVQG2CKSC%2FhdEuMMB7VImdkXOs%2FcOeqCUhoidYlPKUNhg79dBxuIoshWB8SqrL95UQMckYreZli7NMgrsxTdMPPxLdLNdg9vzQi5u8CxTfGzQW5j2dI1g7kzt3hoVafExMWoNY21Mk%2FjWGzPvb8DKCUuiYoWs%2Bp9A%2F1u1dKgWJ%2BCCCok6teeJxVFR2I9rq2nlJ2Id%2BAn6udNmwwIyHzdW163dDFOJAlTmiiXzI6WLeDnP%2FejNK4W%2FaNhVscFb1nEmLQJbl6AveCT9vtgsxsQYmgPdCAy%2F8zTsUJlHY2hcKSJP0j5p%2FuUocAySK3xacGLjFj%2Bx8Whhl%2FERlpfUNPS4tFKQx74RjtThEA%2BgqtM7ebJEw41jTW6VYYsOOI14sBFstYjddBpC5oRGItHD06FwrzAuHpd4C23KkuzgjLRv0%2BfVfroWjKn1nQmWl1PbZa%2FOjoKmA6GOZI1e5QRqe%2BMO%2F59b4GOqUBwc3l7TMT2U%2FxE88QmUwyoQGaPzP5Obg93jnkPj%2BrZ4Utc7YagHu%2BNobvPfTFy2An3xtUbLunwK4Oi8T9YuyZV7v6aFPNpakb70R0oQUzzBH3qm%2FsgfubXqnJRlWwTyjPRNwIPzVG9dNvDE0mJMisjnw3Py0bpkhYFJnVzsvpM06I89DNCxNzTbKQGUCNq9G2T4Af3f4NrtT%2BxVeQJGr4uXhPAwYY&X-Amz-Signature=990eb3624067653bb08637188ff99bddd78bc9461853e6b0d76febe322ed1a50&X-Amz-SignedHeaders=host&x-id=GetObject',
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
            'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/f97e3d55-326b-49a2-9fa3-49673822115c/Monalisa.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666SRUJDQG%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T155735Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEE8aCXVzLXdlc3QtMiJHMEUCIQDp%2Bn6IRFVdC74N2D%2BXMvRL8BVbjkj9VqHHpNU9z9NNygIgWyaoKOTaJcivSGAeAygwO7BHMvgfwzk5%2FN8%2BGYzM1LUqiAQIqP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDGqEXCnSpi7bWnsdeSrcA2tQkybb52F8qRZF3yXmvp8ArkGpVwI6ZNU1qGwLBj04ROLY1%2B0oe0qsllzX2Bn1QCm%2B7IPF%2Bfoftm%2FCczqT04fiSnT10ycfq1PMkqcZ028ba78stdhYFAj8oyiyxYQV4ODLDSWupUNLGS%2FDC800siuOLeME7cfI31yN%2F3FWMwmyJ4uOfFQw1bk5tR1kh%2BhPvblUrZZT4I299QL8wesfSrsX4O17V7cOihqB52uDNMYTFuzlkGFeFiV3wx0a45R4lTLDTXiWt28b1%2Bbejy45g91o9zegZ5kbF0LkRpIHGHVrzrX94vXAIdT%2Fp2q%2BLfZ60DxxF4cKzQenXwgNWtMVuwHqnSSEkFjQt3CBxX73vJwJ5r3yEPfAMn4iFETbBU2XGoddZSwqcSj2Jzj%2FuKoOIAGzHurys3gOCZtw32cwI0t5lXKUF4fBku3tKtWZUW9MlRWKwBSiiNoaP8VmxYQ7Ap5NXbk5m8mD3oakclgi8JgNzTCrSseeH%2BNE6vfvLICvV9DagG51hJIXIEuROpgnEyiThECBbvcAnJHcfIo6WatIqJRdsJum2REFYiymf3j7r8GWsxEH4vQxjo3Ybt6W2q5WvbpP8LO%2FuVMmFMlbxkTWNMFsFjyiOd%2BI%2BTimMOb59b4GOqUB3XcTXbVOZRr%2BPrzOynhLXucZJEqNvmljSYNCeFAfBopJt2%2FmCm4yTvR752qgZrrM8J5I0Fde1ju5OXKiBwSGsbAZbsN1Bkjz0Gm5VXmmPlBDbGvVt0lcd04310toPQ4SkfywTIzq%2B9xlEKCP4bZBbzAnK0BI3xVymvCOrUgOzwOaoe21aMHWUEt9%2Bss4DPp2OH%2BWjZijGYPQblGd7SIkzT%2BO8Dpv&X-Amz-Signature=2ef51a659a7a2c43abef5564c300ba13c8153c8088b52c0e1f205dd266829bdd&X-Amz-SignedHeaders=host&x-id=GetObject',
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
};

export const Default = () => {
  return (
    <TextBasedCourseChapterView
      courseChapter={courseChapter}
      onOpenTemplate={action('open template')}
      onCompleteTask={action('onCompleteTask')}
      isTaskCompleted={action('isTaskCompleted')}
      getChapterCompletion={action('getChapterCompletion')}
      chapterIndex={0}
      onBuyWithCredits={action('onBuyWithCredits')}
    />
  );
};

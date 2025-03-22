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
  id: 'intro',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0426867a-ae95-485a-885d-16a46bb9886f/monstra.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=7eb6697a2dea497ff86d6b0fcd711061ab766d821e214b4ffe8d0997c0914f41&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/2e9daaf5-c2a8-4401-8446-6b7bd6f38771/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667X43HVKG%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJGMEQCIGzCA%2BZrAc0mCIFkdz9s4vRD%2FIn%2FfIt7PWwZtmbIPMLPAiBG4E80%2FUvfLhGub%2FZIEiAR5DxJgE%2FFAbo%2FHezl2ipIJCqIBAiw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIM66kdZFYkUTXue%2BEdKtwD%2Fj6S9sdPdJ%2F4xE4%2B%2BH3266%2FYZ66js21CZ33ly4SeuW5P3VdwBid%2FymKGLY9Wh5HtU%2FdKU88cZJGTbCT%2FNq3MDZpGno2ucKyEewQ5zSq0L821sn1hRTcHDo8vi8iInPm7ievqoNv4cxQX8bLPqI665e6KJlrC41ioCWP2gwvttY2Q3ApYAMzhbyviFcmSHzwUJZsv%2BbZhTggdnN9yqK%2BoCPL4cgg7XzXuRr5c9CRKhNWwgYZBcaqbjxwsJLUc0Yn%2BauGPDbtfUz%2B8Asj4aLYRE40xYF00Y66wvWxJs7%2BkShtjWBwvU%2FmFOgMhndXt%2Bxrcd1x9p7rRJ239WQZzzTLeiN1YQx2j%2F04JmMFgdo3taUvm0FSY15okV%2B4yLxkXcBg7VEoHOF9qMXKXD%2FIjSXv9sfQ7fq2HZ6LL6FbV%2BYgtpvx9Y2YH2x3%2FD8Ocf6iolOOKJjpNJUGE3LrfQvUnetfiPNPbqlSyynjfIUc24It3c1Js6G7UbU05bKuODEmzDuTBJyz1dgD0KX2zCL04nVJ5xkyOptC1kbtSChIXZ0YIFfjj4LRT1IFAT0%2Bnfy%2BlFMfRTDysLsAfvJGxTKKhUPB2T2%2FHd3QXPYwVSYJCd5IOsz%2BoQbTry1%2FBvo8RCZow09b3vgY6pgEw%2BEgIm%2FbLW5Ovp2pMnMobq%2BjN3QSPs5dCBM8p9ZRuzAmAat1K47%2Fuy4CV4iKvJk0USUG7Gjw8HtinjZRbZ7CyjEakDPJcPO4nYbFC1jFQlnFVe2pmu4zUdqBTqG7JUc2gqYp4AfI3HKyRKFc048CgVc2Z%2Fy4sVsyQYSB5g%2FQak5TO5fA7eesFsyRpApRydmQfPiHNPTB1iaR%2BFVINt0C07LOwI1aX&X-Amz-Signature=5a47ca020916b102f41a0847c6c8deec45181ced61c2cb6243c153e1fdf44395&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/d079a8a9-4ebf-4933-b02a-6fc9b95e0d46/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466THYDE25S%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233355Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJHMEUCIEZOJJCTdEbIPxv8tEvek%2FbB52ZYoDAkloHjVLr1LknzAiEA5QLM7k30oqPh9YLiNriFQYmHtGEY%2ByIaGzxyfaWKXfwqiAQIsP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDBlB%2BD5kKYSniCM53ircAxXnOjTss67MqJWWV2v3siCH3HA7NBAVSB9PSDUAqXmlaasmQyuPUvc5IzV0PQcsP0B6VLJYj%2F5iKIiXf9JUQbBGgZ479Tt%2F2CUWxFVJoxigqogcKBz5Jq4wExYFfIigXrrDqlEArD6DtDrpLpSt2S8Taw5zQes8vEDStGc%2FCQ%2FZ8znTwhUz7%2F2UpqkDWSwSJRZba%2B73BMTXmYDlI%2FEprPRJWPOVYn2SkyGBeshW9jsEB9C%2Bu7xYcUxhVHzWz2dczVp%2FDhTwA2nZt5tpfNFbhGnM%2FsY9vq1rDqfnytM2F6gGDApMbSI5oWzNkEXs9c0eSQ61kyAvKDMEFlloDbeSd8AF6p5oxqT90XDizdHiqaHqSGlqBXvNBsS9aYJ%2B66%2FlSMFRzTBAN44WIy1OCUxttZzcn7y55Xu4qP076urJlGUyH0zB1VJnlmhDVL8tL9fzPTXOv4EK5%2F0AosBOStfhaH7Zj5%2B74OQn8fycexcVVPR6OQwyaZE7xNNXXMnuCZI0Q9P94oITZYLsk60aqa2QcHfGGMn9TmO5zcBqT%2BkgK8hnq4x9OQD%2F7UcgUlNCVrbgZ%2FgoCKwdoe9IaTxVT%2FhqIEGhc3U%2BEtEP9u0gUUO4r7kxZ44np7wlu2L0wJe4MPbW974GOqUBurV2wj7hpg%2FQZpomlxFfokUEYx5fu2sku3RG9QUzWTrJOrJl1U7rtYkof9fxztlvvHXYKi8Zq1CEwpqr9qZsWUu3oOSNzUhI1nCoDkZy3tWQ%2BX8AR69XwZ26WPk1WwaZgxkgEMvhiXcrRNBtclbCSZf6CFVonS1t%2FrimexnVWYIyaweVxSoSaeuZ4If7T4leo9exIDs%2BVOPNzR4MSdiHSfBAJ6dK&X-Amz-Signature=f516389fee295f5605e2999ff794dd1d3f1ddc6b83e1e5cd81cb85fd5e260853&X-Amz-SignedHeaders=host&x-id=GetObject',
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
            'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/f97e3d55-326b-49a2-9fa3-49673822115c/Monalisa.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666KF36RKA%2F20250321%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250321T233352Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFcaCXVzLXdlc3QtMiJIMEYCIQC6ALd%2FSfLxXnfeHPwLpMosGrPadmhTJrSZPdT1ZRdkVAIhAJsAuB1M5blc73SqsYBYboIW2jGSjNi7oRCjpFk3oZO8KogECLD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwdpI7FtHRoSretxXAq3AO4nPDEZCkWiKYzJqcwxM0sFoHhdFw0XCNQqR7t2p2VeAEeCtfbj827plsPuPd7AqbHLPAsbmuuS5HfRZlBB2bNn16ywSVQYLJf1pKGNPIm7nfGeij5yF%2B02ba8PmZfiHPQWjZ9IXzoKUio9aWtKRdb3oSY277TG9WmmrzcA6gFB1tkgDP3bwV6VNRLYlC2bEfl0SLsX0bEkPNupoXh%2B2cmTCFWAazxxWnf%2Bx9TfsQhRWGMEq9dD9q836QZpZk7Cdd4ppMLai5DSsxo5gjINxV40ffDpbAVDVC0%2BatPOWwTVS06Q3coUkkdMNSUnsf87qDsZMBi0RbT%2B5dV%2Bl336ZyFayEJbYKYuuGpG629Xhc17BUFoaCxJeK7sig1prmNnX37LMJGE1xIPnp34nXudXTLvJBto%2BLnamx3z6SXhaPI3ICdjHTawKIaSbuYGMFm6xjYORolHzzUv6JbWeTCV1bg5%2Ful2eLQsNAP%2BIW9HC31xSYWcKlj4J2OSY3OAhZ0Fukoh3Icuc%2B%2F76RvcPUP1ydemkijSt3siGFhh20vx%2F3AWubEWQauDZAN4Hau1FAiEZ4QCt9hHG0b9sXDby%2B8UHLHzcG8w%2BYlSdgYKKwjSMINsO%2FgHckvnsU%2BrDskqzDb1ve%2BBjqkAUcnRbCFWdwaSUWoh7u7DsdIrNxEu26%2Ficv94Oy3KubcRM5PytPDj%2F3sxgXW4SYGSPPv2%2F836evAMN8CEwihCsoz4JUvNqme%2BoavjXrBgEcv6o1USUBNiQYMX0mienlrinXgNHSlwHDEL4NR3z9FtCmaTpsai0z3VkyJ7AoUTblkT2V71h1OSGz4gPnasFI9UXGw6tSUHlIypguNukVhe4%2BB%2By7J&X-Amz-Signature=98e540fa0ed5e4b5356cc61e01895e9535c551e0851b14fc177e11c4695b8048&X-Amz-SignedHeaders=host&x-id=GetObject',
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

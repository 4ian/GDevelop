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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0426867a-ae95-485a-885d-16a46bb9886f/monstra.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666NBE6U6D%2F20250320%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250320T220842Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED0aCXVzLXdlc3QtMiJIMEYCIQCzCEDNr%2FFc9MiMoxHT4Yc2eAyijkQPbd552%2ByEpTjDgwIhALVICuQ14JO5K7pNrrG75k7Hv63UT%2BBo99x%2B5%2BtxXkp3KogECJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgwTJIPyV557CkffAGUq3AMJDUir8YyC4%2FcJkmY5hdGDYm0RWwsj5muGHWW5448J1nm5jEgBMpHrkvemMiPXXZCpywEkSq0HFy0REZWT5tnrR9NHBCb9ip08nULtuGMzihCn%2B8662MdhB74vUrzay3CUkfA2tT8%2BfHjENe4UW8UVWH55hyGbL3VVaF1mPnZSN6SgA9Um%2BnXmZcVUF3C9hbky4xRbRcPyriL7FnZvKFoswGZQQuNnFcl6eTOQYhKdGxotRpv1O17xmmRyH1XrRRqOcVgD%2FzlHNYfSc1PsaMSv7hTJlzWXcC5SuheRwSPNtwpVy%2BDDdGeQkXD3cynvYWXe1OHSRdCtHaSSkyz61xHwrhncH5GAgtdDYnoN1THnTbJFintOujByvpVlrg9N7Pd6tl6w74cyTu53JF%2BoTbDR01I0BaQWCUxioHD7U9QvQiPEszEuxwVIBXV7EM1GrJri2zThgGFxrCHizlV7mK3tHjfOGYvrGwD9u1wkAFPKWp7Ky8eP4rqCCDlQQiPZCuXuk0jpWUBIzYwmeX4fa%2F4ENmjnlKbwfSzFEj5lMD47wvWekiexSxL5NDHYyB%2FNqXQf5kGEH6DPuwjuYPjTjjUcj5C5jEDF%2B7mo0qFoDT%2F%2Fnlv%2BwmNGL59K3oC3PDCYhfK%2BBjqkAYsV2TfrfaHv%2FMo0RRFZBuyOxbo0T2lROdW5NvNyFTF7RlHR%2BZPxu7Xbit%2Frr6oadwj262lMxficw2pM39SQ5lU1jSTU89HMhFbODp%2BEmNppcn0HQxpf43yIouc9HaKUSKYeuVcWh6wOGfihJdpdseChwWRpx6kZW1LeL%2BZEYWg6k%2BkXbsEJ3vmYQNAswEpRp8LCL3OekMvY1mdcQQW0QtNwvbNK&X-Amz-Signature=da92ebebf81edf9fab6e073bc05a13ac38e157ecf7608c58a5bb6c528ffd16e8&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/2e9daaf5-c2a8-4401-8446-6b7bd6f38771/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VDZF75CI%2F20250320%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250320T220845Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED0aCXVzLXdlc3QtMiJHMEUCIQC5j5sxRjkmjw45XeME%2FFX%2F9XOtBBWm2hnvaTHsCQ7rqAIgDafxWUae1FZBUfz%2FhpW3qL%2B1uVRatgIxKzveBRVwSrQqiAQIlv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDA6GtbJinfYgPKzNZyrcAwbJEOriCmjcS4%2FdOA7XrPxxKWC%2BZWTJTgO%2FPABBxugeqE%2Fej8LOaaz6Waupxtgz76muLqkBHba9M2sZm8zUwn8JRdumy%2F6Xfk5VA9FJeIt2eaZ8eYmcl%2FWXbJUTv0U%2BJ4VGq4OSMfriEemaNW9MzYWZUoK5qn4hOlYMtG7s4%2Fewnkr%2BYxUMNkOoR5fA%2BMQTRJBGVFwwrSkQHvBCDIyvJCQd2t8U7BgqTu%2FGYFwgeObe%2BCImZVjDs0xA5pS2DIP%2BYBliHlkeellR3%2BMioNoMHQMsTN9hG9d8wiI2OWwVm00QIZhC6zLiY9OtdTz7%2FtvFsfNePOOa2Val6%2Fzo4RsYlu%2B0F6WNPsf3JmWu9ew2rP3VIyU8KMDQJeJj0JbAXfkO9%2Fd%2FnKPi8eXoIrIMstMd0OyNdOUl7z%2FrlNLF8bzz2higR2M48D3A2oqqu8btZHd8oSTD3b%2Fpt8L0DWvtywrliF96nqmkcdmy2NzgqQ5%2BgjCyq04rC2ix0eJOKD7MwUE0hpAGvP7xaHFoIg4q5SLu6KfXqMtLSOSr9rfzDqnVQaYmWQbwNgWv69qN8NCKe7%2F3dEwCqq8VzZpsb5sSafFgG9jVdUPC%2F%2BMPQj13PIW5x34ecySAmqGNFSWEiDSPMMGF8r4GOqUBjY5u9bjSfJwpY1YVZJ1evOP5mClcw2x2FmqxZGPOQ1%2BO4r3J25Zqw8EHAfjqZiqcv4B3p3Utw4th7dwg%2B%2B%2FsIkrCQHZBBnPL5K0BNtiSAxprY7dC77CHkijVIVsNLBhoP7gXKr8AwOg63nCr0P1oAqUIp9QKLlyzAjfsKjh51kQmOBUGyC%2B2Zfe3m47jhKuwriJ3i%2FjaRi20Tn7QoxmV1AdOoSCG&X-Amz-Signature=f2b63a2100369a073ccf8e2f093695f109e4a588c906c9d377cbf203166f1c6d&X-Amz-SignedHeaders=host&x-id=GetObject',
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
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/d079a8a9-4ebf-4933-b02a-6fc9b95e0d46/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46653VCWQF5%2F20250320%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250320T220846Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED0aCXVzLXdlc3QtMiJHMEUCIHhezeE46lj4nLhX7S2XCjeukSpYakovh2XcwNryg9qkAiEA%2BZCAwmKxYjRwSjtAJYljP8Gp1F88qgvSHVrsd7SbBZ8qiAQIlv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDAefMfUPdlT%2Fhab%2FOCrcA4pmr1iYNz4ksr6qU07%2BHYED6REBYlWgLl3BabKUqpEv26tV8ptY1tkn7W1SQHryCjUw9OuxykxX7zqWKeLpWlpDsNceG0bmw3pN1i%2F%2BfnYJ%2BD9UInlJuSVHLQNSolWrxTEU5CTLkJ8hPXQFHsfpxMk0n0c%2FURX4RmfCTr4tDCNV%2BLjYEx3sg9Vsd4300zry3BHvW15P2XjnlUuRhJ%2F6AD9c6IubGlHukM8zmOBq3w7IAI8dDwGrkd7%2FTV9LVnLbvK9a08F1Y%2FFejpthdwcMyANdLpp0orvZg4vVjulrbhvhugmbAhzpdhCnmr5Cw9IPH%2BWJay6ly3FyrBt0og8a5jz7gqYJVw6KuVn0QcH0cYmbEM9iLD7o6j7SSSOiVlgZYsHu3MnsrGibJe0erA5b8bPYYuiKDx9e7OqdvHTCl5TBAWr9gzkU7bnnHsUFXrO2%2FW0cYNwbdQ5rIxqbc%2FKpWn%2BZLtZ7SpNuJ1v%2BudGBknDJG0HV%2BVVmCCXqyG2buWPQrpfjbFuEwka31SzYdbZQrf9hfx0H%2BxTUFCIPW%2FYmFnaLpAuKTd%2B2SCOzA3PAS8tEOiXul%2FCY9JHTd5yTtYV8Rig9sjC9%2BszNCSEOMyGJgf99ls9HQy%2B%2FdQq70GJWMKGF8r4GOqUBsJVoc7VdTvxOzpcBrZXJaPNjha6uj3si6PvLXJ5wyB65WFcJQgNCVafoVlRDCxPTsLSnS%2BoJnCYV8cy8m2zq1ENnqtHvbeClI1IoUjMv2uR1xIWU%2Fm2wIKjzi%2FLMbouXHmSr752YG5DJsvmFIyQXF%2FCCon7X4aK2bueCrL02cGRl3YQSDMci9JtP10s3CF3gxnsjOaxZZxdxJJJCl%2F9x4%2BIwynLz&X-Amz-Signature=b1a50ae05b7a2b319b61ad8f0352098073fa13e01cc1d3e0e5308c1208b2019d&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    {
      type: 'text',
      text:
        '&#9;During this course you will learn how to understand and work with color and color palette models, as well as creating for people perceiving color differently.',
    },
    {
      type: 'text',
      text:
        'Look at how your eyes process color: stare at the red dot in this Mona Lisa image for 20 seconds, then close your eyes.\n\nWhat causes you to see the image in different colors when your eyes are closed?',
    },
    {
      type: 'image',
      url:
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/f97e3d55-326b-49a2-9fa3-49673822115c/Monalisa.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466Q7HNMY5H%2F20250320%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250320T220846Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED0aCXVzLXdlc3QtMiJHMEUCIG6jgziqnLgPXOhjXDAKDE8Od7Jl2iZ3IQNHkzPtAsF6AiEAk%2BHjbhRCJQh%2FHS95BPVp7APXYGQnnQcNRhfSCR9IGBAqiAQIlv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDDF4i%2F3bAQZUWqoSuyrcA9DkJvPIBA8VgK81McJlHTAhHiWpuebYlTK56ws4T4PvauaKTqrGKMJ12TU239WTOATuyxt3Tm2a08A2hyJxVjmguK8SwQNRfmJZTE09VST061wo%2FSGbcztf6%2FFF7iOGYNSc6gEp0bfSy9S3AuDPlwPRVsGbHzstx9Vp5tAXayKg7kdgP0NRoriBnS4DOA3yLQRfQzByXxtmopJVS9yGU%2FCBOKDqd0%2BeWt3KeDZWqzhYnstd7suyfBeErAPtYp00c0UgUFxZB7NP6FQXe%2B95AvKBWuOXqELJTcdI55n84i0xTzmOcbbe8KB4nd1nXPw5gEDm0coBcxm1NKyOwFNWCsHwzfAhU1zsBA3Tv6TaLS6XJJopOZD%2BFmJdRAzhxCCi%2BaMItNSJYKdd77oezOA0kKMk03Hz0dC34%2BcViga2C563cDm3nJT3z7Kud4n%2BpKplwa8lXWXO8pJRgwYH7nTg%2FHsikIoAwSVvacujI8NP8URpODBZbYmfoXB%2B7IR4W1twC0a5qU%2BSMW16Ou2n1Ioli74XpZIbty4y7mRwOc6dlCOwHpxsVMT7XdGT50739uzTXSq3EDNat02fog15YnjIdy3P3IfiwwgSKP1ykNNtfHEpOSGOUudewM32N5OFMM2E8r4GOqUB%2FiP%2BxJYPHKnSNDARPIiX6g9OUmWvvyGrKFmQOc2Sryt9Yj4XkDZvVv%2BVndXT2txg7HF%2BSEObF643sZs5GKgtJKKmuNxl%2FUlVKkGyJKSWEoomXoIJ32%2BF8ggeGQwAMld2pbr1VR0IWBRaCr6Aj2nCB%2FSLgdYvHMFnQHBQbtWzOap%2BxJUopTT8uLPn11OF0mxawh9r6WWfSi3wWwHLW%2Fov8hu8ObNp&X-Amz-Signature=e37f62ad26e1c97b37c8d5d68f1ce9d343dd27089045bae1d1448e878006ae8b&X-Amz-SignedHeaders=host&x-id=GetObject',
    },
    { type: 'text', text: '**Answer:**' },
    {
      type: 'text',
      text:
        'The image has its original colors inverted: dark colors appear lighter, and light sections appear darker. When you stare at the image for 20 seconds, the photoreceptors in your eyes become overstimulated, causing fatigue and loss of sensitivity. This is why you see a different image when your eyes are closed and resting.\n\nThese same photoreceptors are what cause people with color blindness to see colors differently than you do. At the end of this course, you will learn how to include them in your color palette choices.',
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

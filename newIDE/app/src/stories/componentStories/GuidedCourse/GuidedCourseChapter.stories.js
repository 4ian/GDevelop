// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import type { GuidedCourseChapter } from '../../../Utils/GDevelopServices/Asset';
import GuidedCourseChapterView from '../../../GuidedCourse/GuidedCourseChapterView';

import paperDecorator from '../../PaperDecorator';

export default {
  title: 'GuidedCourse/GuidedCourseChapterView',
  component: GuidedCourseChapterView,
  decorators: [paperDecorator],
};

const guidedCourseChapter: GuidedCourseChapter = {
  title: 'Chapter 2 - Build A Scene With Objects',
  tasks: [
    {
      title: 'Discover the different types of objects',
      text:
        'Complete the six tasks below by dragging the premade objects from the object list in to the scene’s default view window to match the image of the scene shown below.',
      imageUrls: [
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/6900ffbe-4a0e-4f1c-9ad8-b9aa495daf17/Lesson_2_final_result.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=9eaa0e3d586e41fbeacddf55ec0348dba75606749898e2c6ddda8994596b5b00&X-Amz-SignedHeaders=host&x-id=GetObject',
      ],
    },
    {
      title: 'Create a background with a Tiled sprite',
      text:
        'Drag the **Tiled_Sprite** object into the game scene from the object list, and adjust its width to fill the entire default rectangular game window.\n\n',
      hint:
        '(A tiled sprite will repeat the image used in the object instead of stretching when it is scaled. It is also the only object that can be adjusted with an X/Y offset, making it ideal for scrolling backgrounds or repeating images in your game.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/40c07f00-8c66-4b6c-b092-fa4a8e00a3d6/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=6c3bb5128510ad66ab9cc482a8bf332bd9f233c48c705b38cdaf25e6cdb75f1e&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Change the animation of a Sprite',
      text:
        "Drag the **Sprite** object into the game scene from the object list, and in the properties panel, change the object's animation number to match the character in the image above.\n\n",
      hint:
        '(A sprite is the only object that supports multiple image frames for animations. These animations can be played, paused, or switched during gameplay. Each animation can be given a name, but are automatically given a number based on its position in the list (e.g., 0, 1, 2, 3, etc.).)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/22338211-c869-45d2-9d15-0868d9588142/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=48628d534204f727414d8c3d034a3fd66cf0627e3105abc469559be2a64dd8e2&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Create a dialogue box with a Panel sprite(9-patch)',
      text:
        'Drag the **Panel_Sprite(9-patch)** object into the game scene from the object list, and resize it to match the size shown in the image above.\n\n',
      hint:
        '(A panel sprite(9 patch) is used for text boxes and any UI elements with repeating patterns and a rectangular border. They’re called 9-patch because images are broken into 9 “patches” that have different rules applied to them when the object is stretched.)',
      imageUrls: [
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/74933b88-cbd9-4690-87e4-b3dfe583a93e/9_patch_panel.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=a2dc69b21f4bdf398b6ae8cb01996f87aae6704cacf5311dfed2a82842ce281b&X-Amz-SignedHeaders=host&x-id=GetObject',
      ],
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/ffb596da-2200-45f4-ad14-de2c0929f3ab/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=22e1b2a82949ee2adf4ee4b854d44e73924d4342db2b453143422f4b68d63494&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Adding and modifying Text in the game',
      text:
        'Open the Text object, change the object’s font to **CantoraOne-Regular from the drop down menu**, set the color to white, adjust the font size, and change the text to match the image above.\n\nDrag the **Text** object into the game scene from the object list to match the position in the image above.\n\n',
      hint:
        '(There are three different types of text objects in the engine, each serving a different purpose, and they can all have their text changed while the game is running with the use of events. Which you’ll learn more about in later chapters.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/a73da7b8-dc84-4130-917e-7341ed263f5a/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=d32baf425a1129621689404ba74aeea034e808cdf335474bdcc77f41edc1c7a4&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Add functionality with a Panel sprite button',
      text:
        'Drag the **Button** object into the game scene from the object list, and resize it to match the size shown in the image above.\n\n',
      hint:
        '(A panel sprite button is useful because it makes it easy to check if the player has clicked on the button, and automatically handles the animations and state of the button.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/01138252-6128-459c-9cce-c5b728d46479/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=81668444361752593669adfc7870971354127da66bf63f973f122309017e986c&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Display values with a Resource bar',
      text:
        'Open the Resource_Bar object, change it’s initial value to 4 and the maximum value to 5, and then scroll down to the bottom and change the default width of its background to 450, so the object will match the size and value of the object in the image above when you preview the game.\n\nDrag the **Resource_Bar** object into the game scene from the object list to match the position of the object in the image above.\n\nThen in the effects tab inside of the object, add the “Drop Shadow” effect and set its color to black with the color picker tool, or change the “Color of the shadow” text field to 0;0;0.\n\n',
      hint:
        '(When you come across a text field for a color, it will always be presented with a color picker tool next to it. You can pick any color by clicking/tapping the color box, and it will automatically change the text field for you.)',
      imageUrls: [
        'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0c7a1d3b-b2ca-45ad-a832-d51649a5b08d/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=74330e377c9dcbba3550507ea2ad847a1a4e57c95e0cde5a37ff64961f2c1c7d&X-Amz-SignedHeaders=host&x-id=GetObject',
      ],
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/46aab784-344b-46bb-bd04-3017036a010f/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=2c1f580e130afd9715312259232eeab8d8422b9104c55e06487b9c9adf7caf48&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/48e8ea8b-8fcd-45c3-8a5e-5b4f43cc8461/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=9f286ac0bcc83ba5b19469fd8aff38e977585b8e69bdf83e2d133ed637c6040c&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/6ef17077-50f7-46b6-8c03-17dd797d7ffe/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=33c3efb748b1483578b14f11848655a9526e4d0cfdf2168f3c75d73dcf868b78&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Discover how instance z-ordering works',
      text:
        'When placing new instances of objects into the game scene, their z-order is automatically set to 1 higher than the instance with the highest z-order in the scene.\n\nTo see object z-order in action, open the properties panel, select the background Tiled_Sprite object, and increase its z-order in the properties one at a time to see it rise above the other objects in the scene.\n\n',
      hint:
        '(Z-order values determine which elements are in front or behind of others on the same layer, which is useful for games where the player character needs to be in front of certain elements but behind others.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/f699f117-23e5-4856-9412-5cad48573a60/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101740Z&X-Amz-Expires=3600&X-Amz-Signature=90677268c38362d3e56bf41d8ba4b68360926d3f4c92d959d48a8b436997161e&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Change alignments with object points',
      text:
        'Switch to the **PointsAndCollisions** game scene from the project manager, preview the game, and observe how this scene’s logic is currently set up for the **Circle** sprite object to follow the cursor whenever the left mouse button or touch is held. \n\nBy default, the Circle object will not be centered on that point because the action positions the object based on its [origin point](https://wiki.gdevelop.io/gdevelop5/objects/sprite/edit-points/), which is located at the top-left of the image.\n\nOpen the Circle object and, through the button in the bottom left corner, change the Circle object’s origin point to be centered in the middle of the image. Then preview the game again to see that the Circle sprite object is now centered on the cursor or point of touch.\n\n',
      hint:
        '(Take note that this doesn’t need to be done for every object in your game; typically, you only change an object’s origin point when it is required for positioning, rotation, or z-ordering based on the origin point’s position.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/7a74918f-ebab-4ff2-9263-5628565747fc/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101740Z&X-Amz-Expires=3600&X-Amz-Signature=6c02f8a4da2c270e70d4313e88887edd465349d8bd1a6db103eaca1fff38d158&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/17acd5ef-246e-4137-a104-dde205c9dc50/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101740Z&X-Amz-Expires=3600&X-Amz-Signature=fae727d725df4abb6e2211ea3f59a570827de6cbef314a9004898f8b58b95392&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Adjust collision checks with collision masks',
      text:
        'Place the **Collision** object into the game scene and, while previewing the game, move the **Circle** object so it touches the Collision object. The Circle object’s animation will change when the collision occurs, but the collision happens before the images appear to overlap.\n\nOpen both the Circle and Collision objects and, through the button in the bottom left corner, adjust the collision masks of both objects so they roughly match their images.(You can add a new point(Vertex) with the “Add a vertex” button.)\n\nThen preview the game again to see how the collision detection has become more accurate.\n\n',
      hint:
        '(Take note that only sprite and tilemap objects have adjustable collision masks. Most other objects will use their entire height and width as their collision mask, and some objects, like particles, have no collision mask at all.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/8e0a7b37-d8f9-448c-9eeb-9d73eac97b07/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101740Z&X-Amz-Expires=3600&X-Amz-Signature=50ade25191ccf603fd69fd2e699363df2b1eea225af6f191c293e92e8d0c91c6&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/547562c4-4c7e-47fd-bf04-0710fd1a4f57/Collision_Object.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101740Z&X-Amz-Expires=3600&X-Amz-Signature=dff5af83ec4968d706652ae4c59ee57282196e8968d261c225ea730aeae1dc6d&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
  ],
  templateUrl:
    'https://resources.gdevelop-app.com/tutorial/templates/chapter1/game.json',
};

export const Default = () => {
  return (
    <GuidedCourseChapterView
      guidedCourseChapter={guidedCourseChapter}
      onOpenTemplate={action('open template')}
    />
  );
};

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
  title: 'Chapter 1 - Get Familiar With The Engine',
  tasks: [
    {
      title: 'Manipulate an object with the Properties panel',
      text:
        'USING ONLY THE PROPERTIES PANEL, adjust the large Ghost object in the game scene to match the size, angle, and position of the transparent LockedGhost object below it.\n\n',
      hint:
        '(Take note that the angle is 0 when the object faces to the right, and that decreasing the object’s Y position value actually makes it go up in the scene instead of down.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/a9ed8406-7790-44dd-bf08-14c82caf0529/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=171a4b392d632a6fdf916c9344275f457e6287bb90fbc33bca1f85b461c1d352&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Unlock an object with the Instance list panel',
      text:
        'The Background object in the game scene is currently locked and cannot be selected. Using the Instance list panel, unlock the background object and adjust its size to fill the entire default rectangular game window, indicated by the black outline.\n\n',
      hint:
        '(You can then lock of the background again if you want it to not interfere with your game scene, either from the instance list panel or the top of the properties panel.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/2ae98bdd-22d3-4c93-8ae2-a8d6fd3aa61f/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=29656b0f884a146b94a7a8c28345bbe7482d56c9c93836b7c6d9beac16a29d58&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Add a UI layer with the Layers panel',
      text:
        'Preview the example and move the player character by pressing the left mouse button or touching your touch screen. Move the character down, and take note of the ResourceBar object, which moves when the camera moves.\n\nCreate a new layer in the layers panel, and move the resource bar object to that new layer with the drop down menu for layer in the properties panel. This way, when you preview the game, the resource bar stays in the bottom center of the screen and is unaffected by the camera movement on the base layer.\n\n',
      hint:
        '(Take note that objects in layers higher in the layers panel will appear above objects in lower layers.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/0fb57afc-b672-4efa-81d5-90b70af48955/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=ae382a1cacb0d77eae2a916ac781817281f9cd980f85e88d9f0a52ed45c84a85&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
    {
      title: 'Change smoothing settings in the Resource tab',
      text:
        'Open the Ghost object and press the preview button, located above the idle animation on the right side of this window, to see the animation play. Notice that the second frame of the animation is blurry.\n\nOpen the Resources tab, located in the Project Manager, and turn off smoothing for this frame in the Resources tab.\n\nTo make this the default setting for any new images added to your game, open your game Properties under Game Settings in the Project Manager, and change the scale mode of your project from Linear to Nearest.\n\n',
      hint:
        '(Take note that Linear (antialiased rendering, with smoothing) is good for high-resolution art, whereas Nearest (no antialiasing, without smoothing) is better suited for pixel art.)',
      answer: {
        imageUrls: [
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/a8de9349-367b-4091-bf2b-e32de0dcb4bd/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=f2278ba24eec6f3c7ab1d8b4aa233119eca73f0b5496e0bda23e05b3e74781ba&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/b9cba0c5-122e-4ad7-b755-0b36e2780f2b/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=e17841e05ab02c0325d745de4ddb5a4095c413628bc64202ac0c7b43a89803af&X-Amz-SignedHeaders=host&x-id=GetObject',
          'https://prod-files-secure.s3.us-west-2.amazonaws.com/2f7dd1de-c6e0-4f5e-a2bd-f7d1a2207717/d41f4145-1923-4f4e-aabd-40fd7e5e3339/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241122%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241122T101735Z&X-Amz-Expires=3600&X-Amz-Signature=fba4d94d46fc9c3a4e64f43edcb42d5e180cbd2608d1ca9e0227f64e7a828c07&X-Amz-SignedHeaders=host&x-id=GetObject',
        ],
      },
    },
  ],
  videoUrl: 'https://youtu.be/bR2BjT7JG0k',
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

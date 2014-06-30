/**

Game Develop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#ifndef VIDEOWRAPPER_H
#define VIDEOWRAPPER_H
class TheoraVideoClip;
class TheoraVideoManager;
namespace sf
{
    class Texture;
    class Sprite;
}
#include <iostream>

/**
 * \brief VideoWrapper is used to hide implementation details from VideoObject interface.
 */
class GD_EXTENSION_API VideoWrapper
{
    public:
        VideoWrapper();
        virtual ~VideoWrapper();
        /**
         * VideoWrapper have special copy constructor behaviour : It does not copy the video
         * being played.
         */
        VideoWrapper(const VideoWrapper & other) :
            renderSprite(NULL),
            currentFrameImage(NULL),
            clip(NULL)
        {
            Init(other);
        };
        /**
         * VideoWrapper have special assignement operator behaviour : It does not copy the video
         * being played.
         */
        VideoWrapper & operator=(const VideoWrapper & other)
        {
            if ( &other != this ) Init(other);

            return *this;
        }

        /**
         * Load a new clip.
         */
        bool Load(std::string filename);

        /**
         * Return true if the current video clip is valid.
         */
        bool IsValid() const { return valid; };

        /**
         * Update current frame image and return it.
         */
        const sf::Texture & GetNextFrameImage();

        /**
         * Update video clip time.
         */
        void UpdateTime(float time);

        /**
         * Set the looping of the video
         */
        void SetLooping(bool loop_);

        /**
         * Go to a certain position in the video.
         */
        void Seek(float time);

        /**
         * Pause or unpause the video clip.
         */
        void SetPause(bool pause);

        /**
         * Restart video from beginning
         */
        void Restart();

        /**
         * Return current position in the video.
         */
        float GetTimePosition() const;

        /**
         * Return length of the video.
         */
        float GetDuration() const;

        unsigned int GetVolume();
        void SetVolume(unsigned int vol);

        sf::Sprite & GetRenderSprite() { return *renderSprite; }
        const sf::Sprite & GetRenderSprite() const { return *renderSprite; }

    private:

        void Init(const VideoWrapper & other);

        sf::Sprite * renderSprite; ///<SFML sprite to be displayed
        sf::Texture * currentFrameImage; ///<SFML Texture to be displayed using renderSprite
        TheoraVideoClip * clip; ///< Theora video clip.
        bool started;
        bool valid; ///< True if the clip is valid
        unsigned int volume;
};

#endif // VIDEOWRAPPER_H


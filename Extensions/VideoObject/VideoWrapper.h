#ifndef VIDEOWRAPPER_H
#define VIDEOWRAPPER_H

#include <TheoraPlayer.h>
#include <SFML/Graphics.hpp>
#include <iostream>

class VideoWrapper
{
    public:
        VideoWrapper();
        virtual ~VideoWrapper();
        /**
         * VideoWrapper have special copy constructor behaviour : It does not copy the video
         * being played.
         */
        VideoWrapper(const VideoWrapper & other)
        {
            clip = NULL;
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
        const sf::Image & GetNextFrameImage();

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
         * Return current position in the video.
         */
        float GetDuration() const;

    private:

        void Init(const VideoWrapper & other);

        sf::Image currentFrameImage; ///<SFML Image to be displayed
        TheoraVideoClip * clip; ///< Theora video clip.
        bool started;
        bool valid; ///< True if the clip is valid
};

#endif // VIDEOWRAPPER_H

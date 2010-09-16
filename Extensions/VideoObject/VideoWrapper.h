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
         * Load clip
         */
        bool Load(std::string filename);

        const sf::Image & GetNextFrameImage();
        const sf::Image & GetFrameImage() const { return currentFrameImage; };

        void UpdateTime(float time);

    private:

        void Init(const VideoWrapper & other);

        sf::Image currentFrameImage;
        TheoraVideoClip * clip;
        bool started;
};

#endif // VIDEOWRAPPER_H

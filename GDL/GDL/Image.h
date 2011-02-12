/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef IMAGE_H
#define IMAGE_H

#include <string>
#include <vector>

using namespace std;

/**
 * \brief An image of an ImageManager.
 * During runtime, objects use SFML images or OpenGL textures using ImageManager.
 */
class GD_API Image
{
    public:
        Image() : smooth(true), alwaysLoaded(false) {};
        ~Image() {};

        string file; ///<File to load
        string nom; ///<Name of the image
        bool smooth; ///< True if smoothing filter is applied
        bool alwaysLoaded; ///< True if the image must always be loaded in memory.
};

#endif // IMAGE_H

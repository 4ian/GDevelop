/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef IMAGE_H
#define IMAGE_H

#include <string>
#include <vector>

using namespace std;

/**
 * Class that represent an image of an image manager.
 */
class GD_API Image
{
    public:
        Image() : smooth(true) {};
        ~Image() {};

        string fichier; ///<File to load
        string nom; ///<Name of the image
        bool smooth; ///< True if smoothing filter is applied
};

#endif // IMAGE_H

/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef POSITION_H
#define POSITION_H

#include <string>
#include <map>

using namespace std;

/**
 * \brief Represents an object on a scene at startup.
 *
 * Class used so as to represent objects at their initial states on the scene.
 * During loading of a scene, "real" objects are created from the initial positions.
 */
class GD_API InitialPosition
{
    public:
        InitialPosition();
        virtual ~InitialPosition() {};

        string objectName; ///< Object name
        float x; ///< Object initial X position
        float y; ///< Object initial Y position
        float angle; ///< Object initial angle
        int zOrder; ///< Object initial Z order
        string layer; ///< Object initial layer
        bool personalizedSize; ///< True if object has a custom size
        float width;  ///< Object custom width
        float height; ///< Object custom height
        map < string, float > floatInfos; ///< More data which can be used by the object
        map < string, string > stringInfos; ///< More data which can be used by the object
};

#endif // POSITION_H

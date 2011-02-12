/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef POSITION_H
#define POSITION_H

#include <string>
#include <map>

using namespace std;

/**
 * Class used so as to represent objects at their initial state on the scene.
 * During loading of a scene, "real" objects are created from the initial positions.
 */
class GD_API InitialPosition
{
    public:
        InitialPosition();
        virtual ~InitialPosition();

        string objectName;
        float x;
        float y;
        float angle;
        int zOrder;
        string layer;
        bool personalizedSize;
        float width;
        float height;
        map < string, float > floatInfos;
        map < string, string > stringInfos;
};

#endif // POSITION_H

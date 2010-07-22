/**

Game Develop - Physic Automatism Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef SCENEPHYSICSDATAS_H
#define SCENEPHYSICSDATAS_H

#include "Box2D/Box2D.h"

class ScenePhysicsDatas
{
    public:
        ScenePhysicsDatas() : world(new b2World(b2Vec2(0.0f, -1.0f), false)), scaleX(100), scaleY(100), stepped(false)
        {

        };
        virtual ~ScenePhysicsDatas();

        b2World * world;
        float scaleX;
        float scaleY;
        bool stepped; ///< Used to be sure that Step is called only once at each frame.

    private:
};

#endif // SCENEPHYSICSDATAS_H

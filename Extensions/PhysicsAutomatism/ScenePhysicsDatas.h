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
        ScenePhysicsDatas() : gravityX(0), gravityY(0), scaleX(100), scaleY(100), world(NULL), stepped(false)
        {

        };
        /*ScenePhysicsDatas(const ScenePhysicsDatas & other) : world(b2World(b2Vec2(0.0f, 0.0f), false)) { Init(other); }
        ScenePhysicsDatas& operator=(const ScenePhysicsDatas & other) { if(&other != this) Init(other); return *this; }*/
        virtual ~ScenePhysicsDatas() {};

        float gravityX;
        float gravityY;
        float scaleX;
        float scaleY;

        //Runtime only :
        b2World * world;
        bool stepped; ///< Used to be sure that Step is called only once at each frame.

    private:
        //void Init(const ScenePhysicsDatas & other);
};

#endif // SCENEPHYSICSDATAS_H

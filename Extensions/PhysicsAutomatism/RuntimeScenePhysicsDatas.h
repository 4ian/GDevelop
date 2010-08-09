/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef RUNTIMESCENEPHYSICSDATAS_H
#define RUNTIMESCENEPHYSICSDATAS_H

#include "Box2D/Box2D.h"
#include <iostream>
#include "GDL/AutomatismsRuntimeSharedDatas.h"
class ScenePhysicsDatas;

/**
 * Datas shared by Physics Automatism at runtime
 */
class RuntimeScenePhysicsDatas : public AutomatismsRuntimeSharedDatas
{
    public:
        RuntimeScenePhysicsDatas(const ScenePhysicsDatas & automatismSharedDatas);
        virtual ~RuntimeScenePhysicsDatas();
        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> Clone() { return boost::shared_ptr<AutomatismsRuntimeSharedDatas>(new RuntimeScenePhysicsDatas(*this));}

        b2World * world;
        bool stepped; ///< Used to be sure that Step is called only once at each frame.
        float scaleX;
        float scaleY;

    private:
};

#endif // RUNTIMESCENEPHYSICSDATAS_H

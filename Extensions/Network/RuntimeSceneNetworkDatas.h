/**

Game Develop - Network Extension
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

#ifndef RUNTIMESCENENETWORKDATAS_H
#define RUNTIMESCENENETWORKDATAS_H

#include <iostream>
#include "GDCpp/AutomatismsRuntimeSharedData.h"
class SceneNetworkDatas;

/**
 * Datas shared by Network Automatism at runtime ( i.e. Nothing )
 */
class GD_EXTENSION_API RuntimeSceneNetworkDatas : public AutomatismsRuntimeSharedData
{
    public:
        RuntimeSceneNetworkDatas(const SceneNetworkDatas & automatismSharedDatas);
        virtual ~RuntimeSceneNetworkDatas();
        virtual boost::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));}

    private:
};

#endif // RUNTIMESCENENETWORKDATAS_H


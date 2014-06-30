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

#ifndef SCENENETWORKDATAS_H
#define SCENENETWORKDATAS_H

#include "GDCpp/AutomatismsSharedData.h"
#include "RuntimeSceneNetworkDatas.h"

/**
 * \brief Data shared by Network Automatism ( i.e. Nothing )
 */
class GD_EXTENSION_API SceneNetworkDatas : public gd::AutomatismsSharedData
{
public:
    SceneNetworkDatas() {};
    virtual ~SceneNetworkDatas() {};
    virtual boost::shared_ptr<gd::AutomatismsSharedData> Clone() const { return boost::shared_ptr<gd::AutomatismsSharedData>(new SceneNetworkDatas(*this));}

    virtual boost::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return boost::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);

private:
};

#endif // SCENENETWORKDATAS_H


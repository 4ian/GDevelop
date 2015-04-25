/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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
    virtual std::shared_ptr<gd::AutomatismsSharedData> Clone() const { return std::shared_ptr<gd::AutomatismsSharedData>(new SceneNetworkDatas(*this));}

    virtual std::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);

private:
};

#endif // SCENENETWORKDATAS_H


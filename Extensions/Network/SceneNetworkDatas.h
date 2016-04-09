/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENENETWORKDATAS_H
#define SCENENETWORKDATAS_H

#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "RuntimeSceneNetworkDatas.h"

/**
 * \brief Data shared by Network Behavior ( i.e. Nothing )
 */
class GD_EXTENSION_API SceneNetworkDatas : public gd::BehaviorsSharedData
{
public:
    SceneNetworkDatas() {};
    virtual ~SceneNetworkDatas() {};
    virtual std::shared_ptr<gd::BehaviorsSharedData> Clone() const { return std::shared_ptr<gd::BehaviorsSharedData>(new SceneNetworkDatas(*this));}

    virtual std::shared_ptr<BehaviorsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeSceneNetworkDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);

private:
};

#endif // SCENENETWORKDATAS_H


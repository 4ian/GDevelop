/**

GDevelop - Light Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENELIGHTOBSTACLEPHYSICSDATAS_H
#define SCENELIGHTOBSTACLEPHYSICSDATAS_H

#include "GDCpp/Project/BehaviorsSharedData.h"
#include "RuntimeSceneLightObstacleDatas.h"

/**
 * \brief Data common to all light obstacles behaviors of a scene.
 */
class GD_EXTENSION_API SceneLightObstacleDatas : public gd::BehaviorsSharedData
{
public:
    SceneLightObstacleDatas() {};
    virtual ~SceneLightObstacleDatas() {};
    virtual std::shared_ptr<gd::BehaviorsSharedData> Clone() const { return std::shared_ptr<gd::BehaviorsSharedData>(new SceneLightObstacleDatas(*this));}

    virtual std::shared_ptr<BehaviorsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeSceneLightObstacleDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);
};

#endif // SCENELIGHTOBSTACLEPHYSICSDATAS_H


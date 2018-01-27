/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENEPHYSICSDATAS_H
#define SCENEPHYSICSDATAS_H

#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "RuntimeScenePhysicsDatas.h"

/**
 * Datas shared by Physics Behavior
 */
class ScenePhysicsDatas : public gd::BehaviorsSharedData
{
public:
    ScenePhysicsDatas() : BehaviorsSharedData(), gravityX(0), gravityY(0), scaleX(100), scaleY(100)
    {
    };
    virtual ~ScenePhysicsDatas() {};
    virtual std::shared_ptr<gd::BehaviorsSharedData> Clone() const { return std::shared_ptr<gd::BehaviorsSharedData>(new ScenePhysicsDatas(*this));}

    float gravityX;
    float gravityY;
    float scaleX;
    float scaleY;

    virtual std::shared_ptr<BehaviorsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeScenePhysicsDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project);
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);
};

#endif // SCENEPHYSICSDATAS_H


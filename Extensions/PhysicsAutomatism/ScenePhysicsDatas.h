/**

GDevelop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENEPHYSICSDATAS_H
#define SCENEPHYSICSDATAS_H

#include "GDCpp/AutomatismsSharedData.h"
#include "RuntimeScenePhysicsDatas.h"

/**
 * Datas shared by Physics Automatism
 */
class ScenePhysicsDatas : public gd::AutomatismsSharedData
{
public:
    ScenePhysicsDatas() : AutomatismsSharedData(), gravityX(0), gravityY(0), scaleX(100), scaleY(100)
    {
    };
    virtual ~ScenePhysicsDatas() {};
    virtual std::shared_ptr<gd::AutomatismsSharedData> Clone() const { return std::shared_ptr<gd::AutomatismsSharedData>(new ScenePhysicsDatas(*this));}

    float gravityX;
    float gravityY;
    float scaleX;
    float scaleY;

    virtual std::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeScenePhysicsDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);
};

#endif // SCENEPHYSICSDATAS_H


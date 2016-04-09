/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENEPATHDATAS_H
#define SCENEPATHDATAS_H

#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "GDCpp/Runtime/String.h"
#include "RuntimeScenePathDatas.h"
#include <SFML/System/Vector2.hpp>
#include <map>
#include <vector>

/**
 * Datas shared by Path Behavior
 */
class GD_EXTENSION_API ScenePathDatas : public gd::BehaviorsSharedData
{
public:
    ScenePathDatas() {};
    virtual ~ScenePathDatas() {};
    virtual std::shared_ptr<gd::BehaviorsSharedData> Clone() const { return std::shared_ptr<gd::BehaviorsSharedData>(new ScenePathDatas(*this));}

    virtual std::shared_ptr<BehaviorsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<BehaviorsRuntimeSharedData>(new RuntimeScenePathDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);

    std::map<gd::String, std::vector<sf::Vector2f> > globalPaths; ///< Map containing all the global paths

private:
};

#endif // SCENEPATHDATAS_H

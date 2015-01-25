/**

GDevelop - Path Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef SCENEPATHDATAS_H
#define SCENEPATHDATAS_H

#include "GDCpp/AutomatismsSharedData.h"
#include "RuntimeScenePathDatas.h"
#include <SFML/System/Vector2.hpp>
#include <map>
#include <vector>

/**
 * Datas shared by Path Automatism
 */
class GD_EXTENSION_API ScenePathDatas : public gd::AutomatismsSharedData
{
public:
    ScenePathDatas() {};
    virtual ~ScenePathDatas() {};
    virtual std::shared_ptr<gd::AutomatismsSharedData> Clone() const { return std::shared_ptr<gd::AutomatismsSharedData>(new ScenePathDatas(*this));}

    virtual std::shared_ptr<AutomatismsRuntimeSharedData> CreateRuntimeSharedDatas()
    {
        return std::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeScenePathDatas(*this));
    }

    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    virtual void UnserializeFrom(const gd::SerializerElement & element);

    std::map<std::string, std::vector<sf::Vector2f> > globalPaths; ///< Map containing all the global paths

private:
};

#endif // SCENEPATHDATAS_H


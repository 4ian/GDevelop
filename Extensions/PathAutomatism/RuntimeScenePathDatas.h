/**

GDevelop - Path Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef RUNTIMESCENEPATHDATAS_H
#define RUNTIMESCENEPATHDATAS_H
#include "GDCpp/AutomatismsRuntimeSharedData.h"
#include <map>
#include <vector>
#include <SFML/System/Vector2.hpp>

class ScenePathDatas;
class ContactListener;

/**
 * Datas shared by Path Automatism at runtime
 */
class GD_EXTENSION_API RuntimeScenePathDatas : public AutomatismsRuntimeSharedData
{
    public:
        RuntimeScenePathDatas(const ScenePathDatas & automatismSharedDatas);
        virtual ~RuntimeScenePathDatas();
        virtual boost::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeScenePathDatas(*this));}

        std::map<std::string, std::vector<sf::Vector2f> > globalPaths; ///< Map containing all the global paths

    private:
};

#endif // RUNTIMESCENEPATHDATAS_H


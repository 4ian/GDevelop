/**

Game Develop - Path Automatism Extension
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


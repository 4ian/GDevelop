/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef SCENEPATHDATAS_H
#define SCENEPATHDATAS_H

#include "GDL/AutomatismsSharedDatas.h"
#include "RuntimeScenePathDatas.h"
#include <SFML/System/Vector2.hpp>
#include <map>
#include <vector>

/**
 * Datas shared by Path Automatism
 */
class GD_EXTENSION_API ScenePathDatas : public AutomatismsSharedDatas
{
    public:
        ScenePathDatas(std::string typeName) : AutomatismsSharedDatas(typeName) {};
        virtual ~ScenePathDatas() {};
        virtual boost::shared_ptr<AutomatismsSharedDatas> Clone() const { return boost::shared_ptr<AutomatismsSharedDatas>(new ScenePathDatas(*this));}

        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> CreateRuntimeSharedDatas()
        {
            return boost::shared_ptr<AutomatismsRuntimeSharedDatas>(new RuntimeScenePathDatas(*this));
        }

        #if defined(GD_IDE_ONLY)
        virtual void SaveToXml(TiXmlElement * eventElem) const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * eventElem);

        std::map<std::string, std::vector<sf::Vector2f> > globalPaths; ///< Map containing all the global paths

    private:
};

#endif // SCENEPATHDATAS_H

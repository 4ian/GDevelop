/**

Game Develop - Light Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef SCENELIGHTOBSTACLEPHYSICSDATAS_H
#define SCENELIGHTOBSTACLEPHYSICSDATAS_H

#include "GDL/AutomatismsSharedDatas.h"
#include "RuntimeSceneLightObstacleDatas.h"

/**
 * Datas shared by A Star Automatism
 */
class GD_EXTENSION_API SceneLightObstacleDatas : public AutomatismsSharedDatas
{
    public:
        SceneLightObstacleDatas(std::string typeName) : AutomatismsSharedDatas(typeName), gridWidth(20), gridHeight(20), diagonalMove(true) {};
        virtual ~SceneLightObstacleDatas() {};
        virtual boost::shared_ptr<AutomatismsSharedDatas> Clone() { return boost::shared_ptr<AutomatismsSharedDatas>(new SceneLightObstacleDatas(*this));}

        virtual boost::shared_ptr<AutomatismsRuntimeSharedDatas> CreateRuntimeSharedDatas()
        {
            return boost::shared_ptr<AutomatismsRuntimeSharedDatas>(new RuntimeSceneLightObstacleDatas(*this));
        }

        #if defined(GD_IDE_ONLY)
        virtual void SaveToXml(TiXmlElement * eventElem) const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * eventElem);

        float gridWidth;
        float gridHeight;
        bool diagonalMove;
};

#endif // SCENELIGHTOBSTACLEPHYSICSDATAS_H

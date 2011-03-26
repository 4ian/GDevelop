/**

Game Develop - Network Extension
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

#ifndef PHYSICAUTOMATISM_H
#define PHYSICAUTOMATISM_H

#include "GDL/Automatism.h"
#include "GDL/Object.h"
#include "SceneNetworkDatas.h"
#include <boost/weak_ptr.hpp>
#include <iostream>
#include <map>
#include <set>
#include "GDL/RuntimeScene.h"
class TiXmlElement;
class Scene;
class NetworkAutomatismEditor;

class GD_EXTENSION_API NetworkAutomatism : public Automatism
{
    friend class NetworkAutomatismEditor;

    public:
        NetworkAutomatism(std::string automatismTypeName);
        virtual ~NetworkAutomatism();
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new NetworkAutomatism(*this));}

        #if defined(GD_IDE_ONLY)
        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * elem) const;
        #endif

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * elem);

        #if defined(GD_IDE_ONLY)
        /**
         * Called when user wants to edit the automatism.
         */
        virtual void EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ );
        #endif

        static std::map < const Scene* , SceneNetworkDatas > scenesNetworkDatas; ///< Static map associating scene to datas

        std::string dataPrefix;
        bool xPosition; ///< True if X position must be send/updated
        bool yPosition; ///< True if Y position must be send/updated
        bool angle; ///< True if agnle must be send/updated
        bool width; ///< True if width must be send/updated
        bool height; ///< True if height must be send/updated

        bool sending;
        unsigned int objectNetworkId;

        bool ActSetAsSender( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetAsReceiver( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActSetIdentifier( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        double ExpGetIdentifier( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction ) { return objectNetworkId; };

    private:

        virtual void DoStepPreEvents(RuntimeScene & scene);
        virtual void DoStepPostEvents(RuntimeScene & scene);

        boost::shared_ptr<RuntimeSceneNetworkDatas> runtimeScenesNetworkDatas;
};

#endif // PHYSICAUTOMATISM_H

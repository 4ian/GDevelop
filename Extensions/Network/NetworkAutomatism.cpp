/**

Game Develop - Network Extension
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

#include <iostream>
#include <vector>
#include <SFML/Network.hpp>
#include "GDL/Scene.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/XmlMacros.h"
#include "GDL/CommonTools.h"
#include "ReceivedDataManager.h"
#include "NetworkAutomatismEditor.h"
#include "NetworkAutomatism.h"
#include "NetworkManager.h"

NetworkAutomatism::NetworkAutomatism(std::string automatismTypeName) :
Automatism(automatismTypeName),
dataPrefix("Object"),
xPosition(true),
yPosition(true),
angle(true),
width(false),
height(false),
sending(true),
objectNetworkId(0)
{
}

NetworkAutomatism::~NetworkAutomatism()
{
}

#if defined(GD_IDE_ONLY)
void NetworkAutomatism::EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    NetworkAutomatismEditor editor(parent, game_, scene, *this);
    editor.ShowModal();
}
#endif

/**
 * Called at each frame before events
 */
void NetworkAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !sending )
    {
        if ( xPosition ) object->SetX(ReceivedDataManager::GetInstance()->values[dataPrefix+ToString(objectNetworkId)+"/X"]);
        if ( yPosition ) object->SetY(ReceivedDataManager::GetInstance()->values[dataPrefix+ToString(objectNetworkId)+"/Y"]);
        if ( angle ) object->SetAngle(ReceivedDataManager::GetInstance()->values[dataPrefix+ToString(objectNetworkId)+"/Angle"]);
        if ( width ) object->SetWidth(ReceivedDataManager::GetInstance()->values[dataPrefix+ToString(objectNetworkId)+"/Width"]);
        if ( height ) object->SetHeight(ReceivedDataManager::GetInstance()->values[dataPrefix+ToString(objectNetworkId)+"/Height"]);
    }
}

/**
 * Called at each frame after events
 */
void NetworkAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if ( !sending ) return;

    if ( xPosition )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+ToString(objectNetworkId)+"/X"
                << static_cast<double>(object->GetX());

        NetworkManager::GetInstance()->Send(packet);
    }
    if ( yPosition )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+ToString(objectNetworkId)+"/Y"
                << static_cast<double>(object->GetY());

        NetworkManager::GetInstance()->Send(packet);
    }
    if ( angle )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+ToString(objectNetworkId)+"/Angle"
                << static_cast<double>(object->GetAngle());

        NetworkManager::GetInstance()->Send(packet);
    }
    if ( width )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+ToString(objectNetworkId)+"/Width"
                << static_cast<double>(object->GetWidth());

        NetworkManager::GetInstance()->Send(packet);
    }
    if ( height )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+ToString(objectNetworkId)+"/Height"
                << static_cast<double>(object->GetHeight());

        NetworkManager::GetInstance()->Send(packet);
    }
}

/**
 * Generate an object network identifier, unique for each object.
 */
void NetworkAutomatism::GenerateObjectNetworkIdentifier( const std::string &, const std::string & automatismName, std::map <std::string, std::vector<Object*> *> objectsLists1)
{
    std::vector<Object*> objects1;
    for (std::map <std::string, std::vector<Object*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
    {
        if ( it->second != NULL )
        {
            objects1.reserve(objects1.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects1));
        }
    }

    for ( unsigned int i = 0; i<objects1.size(); ++i )
    {
        //We can afford a dynamic_cast in this action
        NetworkAutomatism* automatism = dynamic_cast<NetworkAutomatism*>(objects1[i]->GetAutomatismRawPointer(automatismName));

        if ( automatism != NULL ) automatism->objectNetworkId = i;
    }
}

#if defined(GD_IDE_ONLY)
void NetworkAutomatism::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("sending", sending);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("xPosition", xPosition);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("yPosition", yPosition);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("angle", angle);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("width", width);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("height", height);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("dataPrefix", dataPrefix);
}
#endif

void NetworkAutomatism::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("sending", sending);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("xPosition", xPosition);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("yPosition", yPosition);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("angle", angle);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("width", width);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("height", height);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("dataPrefix", dataPrefix);
}

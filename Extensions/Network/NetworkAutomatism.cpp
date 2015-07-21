/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <iostream>
#include <vector>
#include <SFML/Network.hpp>
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/CommonTools.h"
#include "ReceivedDataManager.h"
#include "NetworkAutomatismEditor.h"
#include "NetworkAutomatism.h"
#include "NetworkManager.h"

NetworkAutomatism::NetworkAutomatism() :
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
void NetworkAutomatism::EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
#if !defined(GD_NO_WX_GUI)
    NetworkAutomatismEditor editor(parent, game_, scene, *this);
    editor.ShowModal();
#endif
}
#endif

/**
 * Called at each frame before events
 */
void NetworkAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !sending )
    {
        if ( xPosition ) object->SetX(ReceivedDataManager::Get()->values[dataPrefix+gd::String::From(objectNetworkId)+"/X"]);
        if ( yPosition ) object->SetY(ReceivedDataManager::Get()->values[dataPrefix+gd::String::From(objectNetworkId)+"/Y"]);
        if ( angle ) object->SetAngle(ReceivedDataManager::Get()->values[dataPrefix+gd::String::From(objectNetworkId)+"/Angle"]);
        if ( width ) object->SetWidth(ReceivedDataManager::Get()->values[dataPrefix+gd::String::From(objectNetworkId)+"/Width"]);
        if ( height ) object->SetHeight(ReceivedDataManager::Get()->values[dataPrefix+gd::String::From(objectNetworkId)+"/Height"]);
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
                << dataPrefix+gd::String::From(objectNetworkId)+"/X"
                << static_cast<double>(object->GetX());

        NetworkManager::Get()->Send(packet);
    }
    if ( yPosition )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+gd::String::From(objectNetworkId)+"/Y"
                << static_cast<double>(object->GetY());

        NetworkManager::Get()->Send(packet);
    }
    if ( angle )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+gd::String::From(objectNetworkId)+"/Angle"
                << static_cast<double>(object->GetAngle());

        NetworkManager::Get()->Send(packet);
    }
    if ( width )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+gd::String::From(objectNetworkId)+"/Width"
                << static_cast<double>(object->GetWidth());

        NetworkManager::Get()->Send(packet);
    }
    if ( height )
    {
        sf::Packet packet;
        packet  << sf::Int32(0)
                << dataPrefix+gd::String::From(objectNetworkId)+"/Height"
                << static_cast<double>(object->GetHeight());

        NetworkManager::Get()->Send(packet);
    }
}

/**
 * Generate an object network identifier, unique for each object.
 */
void NetworkAutomatism::GenerateObjectNetworkIdentifier( std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists1, const gd::String & automatismName)
{
    std::vector<RuntimeObject*> objects1;
    for (std::map <gd::String, std::vector<RuntimeObject*> *>::const_iterator it = objectsLists1.begin();it!=objectsLists1.end();++it)
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
void NetworkAutomatism::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("sending", sending);
    element.SetAttribute("xPosition", xPosition);
    element.SetAttribute("yPosition", yPosition);
    element.SetAttribute("angle", angle);
    element.SetAttribute("width", width);
    element.SetAttribute("height", height);
    element.SetAttribute("dataPrefix", dataPrefix);
}
#endif

void NetworkAutomatism::UnserializeFrom(const gd::SerializerElement & element)
{
    sending = element.GetBoolAttribute("sending");
    xPosition = element.GetBoolAttribute("xPosition");
    yPosition = element.GetBoolAttribute("yPosition");
    angle = element.GetBoolAttribute("angle");
    width = element.GetBoolAttribute("width");
    height = element.GetBoolAttribute("height");
    dataPrefix = element.GetStringAttribute("dataPrefix");
}

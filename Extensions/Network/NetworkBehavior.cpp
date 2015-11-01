/**

GDevelop - Network Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <iostream>
#include <vector>
#include <SFML/Network.hpp>
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/Project/Layout.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/CommonTools.h"
#include "ReceivedDataManager.h"
#include "NetworkBehaviorEditor.h"
#include "NetworkBehavior.h"
#include "NetworkManager.h"

NetworkBehavior::NetworkBehavior() :
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

NetworkBehavior::~NetworkBehavior()
{
}

#if defined(GD_IDE_ONLY)
void NetworkBehavior::EditBehavior( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ )
{
#if !defined(GD_NO_WX_GUI)
    NetworkBehaviorEditor editor(parent, game_, scene, *this);
    editor.ShowModal();
#endif
}
#endif

/**
 * Called at each frame before events
 */
void NetworkBehavior::DoStepPreEvents(RuntimeScene & scene)
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
void NetworkBehavior::DoStepPostEvents(RuntimeScene & scene)
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
void NetworkBehavior::GenerateObjectNetworkIdentifier( std::map <gd::String, std::vector<RuntimeObject*> *> objectsLists1, const gd::String & behaviorName)
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
        NetworkBehavior* behavior = dynamic_cast<NetworkBehavior*>(objects1[i]->GetBehaviorRawPointer(behaviorName));

        if ( behavior != NULL ) behavior->objectNetworkId = i;
    }
}

#if defined(GD_IDE_ONLY)
void NetworkBehavior::SerializeTo(gd::SerializerElement & element) const
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

void NetworkBehavior::UnserializeFrom(const gd::SerializerElement & element)
{
    sending = element.GetBoolAttribute("sending");
    xPosition = element.GetBoolAttribute("xPosition");
    yPosition = element.GetBoolAttribute("yPosition");
    angle = element.GetBoolAttribute("angle");
    width = element.GetBoolAttribute("width");
    height = element.GetBoolAttribute("height");
    dataPrefix = element.GetStringAttribute("dataPrefix");
}

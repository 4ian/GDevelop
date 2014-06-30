/**

Game Develop - Network Extension
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

#include "GDCpp/RuntimeScene.h"
#include "NetworkManager.h"
#include "ErrorManager.h"
#include "ReceivedDataManager.h"
#include <SFML/Network.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <list>

namespace GDpriv
{
namespace NetworkExtension
{

void GD_EXTENSION_API ResetReceivedData()
{
    ReceivedDataManager::Get()->values.clear();
    ReceivedDataManager::Get()->strings.clear();
}

void GD_EXTENSION_API ActStopListening()
{
    NetworkManager::Get()->StopListening();
}

void GD_EXTENSION_API AddRecipient( const std::string & adressStr, short unsigned int port  )
{
    sf::IpAddress address = adressStr;

    if ( port == 0 ) port = 50001; //Default value

    NetworkManager::Get()->AddRecipient(address, port);
}

void GD_EXTENSION_API RemoveAllRecipients()
{
    NetworkManager::Get()->RemoveAllRecipients();
}

void GD_EXTENSION_API ListenToPort( short unsigned int port )
{
    if ( port == 0 ) port = 50001;

    NetworkManager::Get()->ListenToPort(port);
}

void GD_EXTENSION_API SendValue( const std::string & title, double data )
{
    sf::Packet packet;
    packet  << sf::Int32(0) //0 indicate that the packet contains a double
            << title
            << static_cast<double>(data);

    NetworkManager::Get()->Send(packet);
}

void GD_EXTENSION_API SendString( const std::string & title, const std::string & data )
{
    sf::Packet packet;
    packet  << sf::Int32(1) //1 indicate that the packet contains a string
            << title
            << data;

    NetworkManager::Get()->Send(packet);
}

void GD_EXTENSION_API ReceivePackets(  )
{
    NetworkManager::Get()->ReceivePackets();
}

std::string GD_EXTENSION_API GetReceivedDataString( const std::string & title)
{
    return ReceivedDataManager::Get()->strings[title];
}

double GD_EXTENSION_API GetReceivedDataValue( const std::string & title )
{
    return ReceivedDataManager::Get()->values[title];
}

std::string GD_EXTENSION_API GetLastError()
{
    return ErrorManager::Get()->GetLastError();
}

std::string GD_EXTENSION_API GetPublicAddress(float timeoutInSeconds)
{
    return sf::IpAddress::getPublicAddress(sf::seconds(timeoutInSeconds)).toString();
}

std::string GD_EXTENSION_API GetLocalAddress()
{
    return sf::IpAddress::getLocalAddress().toString();
}

}
}


/**

GDevelop - Network Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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


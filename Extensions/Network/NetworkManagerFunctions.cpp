/**

GDevelop - Network Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Runtime/RuntimeScene.h"
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

void GD_EXTENSION_API AddRecipient( const gd::String & adressStr, short unsigned int port  )
{
    sf::IpAddress address = adressStr.ToLocale();

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

void GD_EXTENSION_API SendValue( const gd::String & title, double data )
{
    sf::Packet packet;
    packet  << sf::Int32(0) //0 indicate that the packet contains a double
            << title
            << static_cast<double>(data);

    NetworkManager::Get()->Send(packet);
}

void GD_EXTENSION_API SendString( const gd::String & title, const gd::String & data )
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

gd::String GD_EXTENSION_API GetReceivedDataString( const gd::String & title)
{
    return ReceivedDataManager::Get()->strings[title];
}

double GD_EXTENSION_API GetReceivedDataValue( const gd::String & title )
{
    return ReceivedDataManager::Get()->values[title];
}

gd::String GD_EXTENSION_API GetLastError()
{
    return ErrorManager::Get()->GetLastError();
}

gd::String GD_EXTENSION_API GetPublicAddress(float timeoutInSeconds)
{
    return gd::String::FromLocale(sf::IpAddress::getPublicAddress(sf::seconds(timeoutInSeconds)).toString());
}

gd::String GD_EXTENSION_API GetLocalAddress()
{
    return gd::String::FromLocale(sf::IpAddress::getLocalAddress().toString());
}

}
}

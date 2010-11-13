/**

Game Develop - Network Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "ReceivedDataManager.h"
#include "ErrorManager.h"
#include <SFML/Network.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <list>

sf::UdpSocket serverSocket;
bool serverInitialized;

bool ActDoServer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    serverSocket.SetBlocking(false);
    serverSocket.Bind(55002);

    serverInitialized = true;

    return true;
}

bool ActAcceptNewClients( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    return true;
}

bool ActServerReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !serverInitialized )
    {
        ErrorManager::getInstance()->SetLastError("Server not launched\n");
        return false;
    }

    sf::Packet packet;
    sf::IpAddress sender;
    unsigned short port;

    while (serverSocket.Receive(packet, sender, port) == sf::Socket::Done)
    {
        sf::Int32 type = -1;
        packet >> type; //Read the primary type of the packet

        switch(type)
        {
        case 0:
        {
            std::string title;
            packet >> title;
            double number;
            packet >> number;

            ReceivedDataManager::getInstance()->values[title] = number;
            break;
        }
        default:
            ErrorManager::getInstance()->SetLastError("Received unknown data ( Type "+ToString(type)+" )\n");
            break;
        }
    }
    return true;
}

bool ActServerSendValue( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    sf::Packet packet;
    packet  << sf::Int32(0)
            << action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)
            << static_cast<double>(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned));

    sf::IpAddress sendto = "127.0.0.1";

    if (!serverSocket.Send(packet, sendto, 55001) == sf::Socket::Done)
        ErrorManager::getInstance()->SetLastError("Failed to send packet to "+sendto.ToString()+".\n");

    return true;
}

bool connected;
sf::UdpSocket clientSocket;

bool ActDoClient( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    clientSocket.Bind(55001);
    clientSocket.SetBlocking(false);

    connected = true;
    return true;
}

bool ActClientSendValue( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !connected )
    {
        ErrorManager::getInstance()->SetLastError("Unable to send data : Client not connected to a server.\n");
        return false;
    }

    sf::Packet packet;
    packet  << sf::Int32(0)
            << action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)
            << static_cast<double>(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned));

    clientSocket.Send(packet, "127.0.0.1", 55002);

    return true;
}

bool ActClientReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !connected )
    {
        ErrorManager::getInstance()->SetLastError("Unable to receive data : Client not connected to a server.\n");
        return false;
    }

    sf::Packet packet;
    sf::IpAddress address;
    short unsigned int port;

    while ( clientSocket.Receive(packet, address, port) == sf::Socket::Done)
    {
        sf::Int32 type = -1;
        packet >> type; //Read the primary type of the packet

        switch(type)
        {
        case 0:
        {
            std::string title;
            packet >> title;
            double number;
            packet >> number;

            ReceivedDataManager::getInstance()->values[title] = number;
            break;
        }
        default:
            ErrorManager::getInstance()->SetLastError("Received unknown data ( Type "+ToString(type)+" )\n");
            break;
        }
    }

    return true;
}

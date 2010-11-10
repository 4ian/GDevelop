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

const unsigned short Port = 2435;

boost::shared_ptr<sf::TcpListener> serverListener;
sf::SocketSelector serverSelector;
std::list< boost::shared_ptr<sf::TcpSocket> > serverClients;

bool ActDoServer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    serverListener = boost::shared_ptr<sf::TcpListener>(new sf::TcpListener);

    if (!serverListener->Listen(Port) == sf::Socket::Done)
    {
        ErrorManager::getInstance()->SetLastError("Server unable to listen to port "+ToString(Port)+"\n");
        return false;
    }

    // Create a Selector for handling several sockets (the listener + the socket associated to each client)
    sf::SocketSelector newSelector;
    serverSelector = newSelector;
    serverClients.clear();

    // Add the listener
    serverSelector.Add(*serverListener);

    return true;
}

bool ActAcceptNewClients( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if (!serverListener)
    {
        ErrorManager::getInstance()->SetLastError("Server not launched\n");
        return false;
    }

    // Get the sockets ready for reading
    unsigned int NbSockets = serverSelector.Wait(0.001);

    // We can read from each returned socket
    for (unsigned int i = 0; i < NbSockets; ++i)
    {
        if (serverSelector.IsReady(*serverListener))
        {
            boost::shared_ptr<sf::TcpSocket> client = boost::shared_ptr<sf::TcpSocket>(new sf::TcpSocket);
             if (serverListener->Accept(*client) == sf::Socket::Done)
             {
                 // Add the new client to the clients list
                 serverClients.push_back(client);

                 // Add the new client to the Selector so that we will
                 // be notified when he sends something
                 serverSelector.Add(*client);
             }
        }
    }

    return true;
}

bool ActServerReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if (!serverListener)
    {
        ErrorManager::getInstance()->SetLastError("Server not launched\n");
        return false;
    }

    // Get the sockets ready for reading
    unsigned int NbSockets = serverSelector.Wait(0.001);

    // We can read from each returned socket
    for (unsigned int i = 0; i < NbSockets; ++i)
    {
        if (serverSelector.IsReady(*serverListener))
        {
            //Pass, connection of new clients are handled in another action.
        }
        else
        {
            // The listener socket is not ready, test all other sockets (the clients)
             for (std::list< boost::shared_ptr<sf::TcpSocket> >::iterator it = serverClients.begin(); it != serverClients.end(); ++it)
             {
                 sf::TcpSocket& client = **it;
                 if (serverSelector.IsReady(client))
                 {
                     // The client has sent some data, we can receive it
                     sf::Packet packet;
                     if (client.Receive(packet) == sf::Socket::Done)
                     {
                        sf::Int32 type = -1; packet >> type; //Read the primary type of the packet

                        switch(type)
                        {
                            case 0:
                            {
                                std::string title; packet >> title;
                                double number; packet >> number;

                                ReceivedDataManager::getInstance()->values[title] = number;
                                break;
                            }
                            default:
                                ErrorManager::getInstance()->SetLastError("Received unknown data ( Type "+ToString(type)+" )\n");
                                break;
                        }
                     }
                 }
             }
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

    for (std::list< boost::shared_ptr<sf::TcpSocket> >::iterator it = serverClients.begin(); it != serverClients.end(); ++it)
    {
        sf::TcpSocket& client = **it;

        if (!client.Send(packet) == sf::Socket::Done)
            ErrorManager::getInstance()->SetLastError("Failed to send packet to a client\n");
    }

    return true;
}

bool connected;
sf::TcpSocket clientSocket;

bool ActDoClient( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    // Ask for server address
    sf::IpAddress ServerAddress = action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);
    if (ServerAddress == sf::IpAddress::None)
    {
        ErrorManager::getInstance()->SetLastError("IP Adress malformated\n");
        return false;
    }

    clientSocket.Disconnect();

    // Connect to the server
    if (clientSocket.Connect(ServerAddress, Port) != sf::Socket::Done)
    {
        ErrorManager::getInstance()->SetLastError("Unable to connect to server.\n");
        connected = false;
        return false;
    }
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

    connected = (clientSocket.Send(packet) == sf::Socket::Done);
    return connected;
}

bool ActClientReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !connected )
    {
        ErrorManager::getInstance()->SetLastError("Unable to receive data : Client not connected to a server.\n");
        return false;
    }

    sf::Packet packet;
    packet  << sf::Int32(0)
            << action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned)
            << static_cast<double>(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned));

    if (clientSocket.Receive(packet) == sf::Socket::Done)
    {
        sf::Int32 type = -1; packet >> type; //Read the primary type of the packet

        switch(type)
        {
            case 0:
            {
                std::string title; packet >> title;
                double number; packet >> number;

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

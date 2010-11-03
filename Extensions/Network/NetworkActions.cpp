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
#include <SFML/Network.hpp>
#include <iostream>
#include <fstream>
#include <string>
#include <list>

const unsigned short Port = 2435;

sf::TcpListener serverListener;
sf::SocketSelector serverSelector;
std::list<sf::TcpSocket*> serverClients;

bool ActDoServer( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if (!serverListener.Listen(Port) == sf::Socket::Done)
    {
        cout << "Server unable to listen to port " << Port << endl;
        return false;
    }
    std::cout << "Listening to port " << Port << ", waiting for connections..." << std::endl;

    // Create a Selector for handling several sockets (the listener + the socket associated to each client)
    sf::SocketSelector newSelector;
    serverSelector = newSelector;
    serverClients.clear();

    // Add the listener
    serverSelector.Add(serverListener);

    return true;
}

bool ActServerReceivePackets( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    // Get the sockets ready for reading
    unsigned int NbSockets = serverSelector.Wait(0.1);
    cout << NbSockets;

    // We can read from each returned socket
    for (unsigned int i = 0; i < NbSockets; ++i)
    {
        // Get the current socket
        sf::TcpSocket Socket;

        if (serverSelector.IsReady(serverListener))
        {
            sf::TcpSocket* client = new sf::TcpSocket;
             if (serverListener.Accept(*client) == sf::Socket::Done)
             {
                 // Add the new client to the clients list
                 serverClients.push_back(client);

                std::cout << "Client connected (" << client->GetRemoteAddress() << ")" << std::endl;

                 // Add the new client to the Selector so that we will
                 // be notified when he sends something
                 serverSelector.Add(*client);
             }
        }
        else
        {
            // The listener socket is not ready, test all other sockets (the clients)
             for (std::list<sf::TcpSocket*>::iterator it = serverClients.begin(); it != serverClients.end(); ++it)
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
                                cout << "Received " << title << ";"<<number;

                                ReceivedDataManager::getInstance()->values[title] = number;
                                break;
                            }
                            default:
                                cout << "Received unknown data ( Type " << type << " )" << endl;
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

    for (std::list<sf::TcpSocket*>::iterator it = serverClients.begin(); it != serverClients.end(); ++it)
    {
        sf::TcpSocket& client = **it;

        if (!client.Send(packet) == sf::Socket::Done)
            cout << "Failed to send packet to a client" << endl;
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
        cout << "Bad IP Adress";
        return false;
    }

    // Connect to the server
    if (clientSocket.Connect(ServerAddress, Port) != sf::Socket::Done)
    {
        cout << "Unable to connect to server.";
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
        cout << "ClientSendValue: Client not connected to server" << endl;
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
        cout << "ClientReceivePackets: Client not connected to server" << endl;
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

                cout << "Received " << number;

                ReceivedDataManager::getInstance()->values[title] = number;
                break;
            }
            default:
                cout << "Client received unknown data ( Type " << type << " )" << endl;
        }
    }

    return true;
}

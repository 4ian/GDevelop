#include "NetworkManager.h"
#include "ReceivedDataManager.h"
#include "ErrorManager.h"
#include "GDCpp/Runtime/CommonTools.h"

NetworkManager * NetworkManager::_singleton = NULL;

void NetworkManager::ReceivePackets()
{
    sf::Packet packet;
    sf::IpAddress address;
    short unsigned int port;

    while ( socket.receive(packet, address, port) == sf::Socket::Done)
    {
        //Be sure the sender is not blocked
        if ( find(blockedList.begin(), blockedList.end(), address) == blockedList.end())
        {
            sf::Int32 type = -1;
            packet >> type; //Read the primary type of the packet

            switch(type)
            {
            case 0:
            {
                sf::String title;
                packet >> title;
                double number;
                packet >> number;

                ReceivedDataManager::Get()->values[title] = number;
                break;
            }
            case 1:
            {
                sf::String title;
                packet >> title;
                sf::String str;
                packet >> str;

                ReceivedDataManager::Get()->strings[title] = str;
                break;
            }
            default:
                ErrorManager::Get()->SetLastError("Received unknown data ( Type "+gd::String::From(type)+" )\n");
                break;
            }
        }
    }
}

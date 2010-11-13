#include "NetworkManager.h"
#include "ReceivedDataManager.h"
#include "ErrorManager.h"
#include "GDL/CommonTools.h"

NetworkManager * NetworkManager::_singleton = NULL;

void NetworkManager::ReceivePackets()
{
    sf::Packet packet;
    sf::IpAddress address;
    short unsigned int port;

    while ( socket.Receive(packet, address, port) == sf::Socket::Done)
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
    }
}
